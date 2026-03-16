<?php
/**
 * Schedule Meeting Handler
 * Saves meeting as a task to database
 */

session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');

// Enable error display for debugging
ini_set('display_errors', '1');
error_reporting(E_ALL);

// Set JSON header
header('Content-Type: application/json');

// Initialize response
$response = [
    'success' => false,
    'message' => '',
    'debug' => []
];

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    $response['debug']['warning'] = 'Not logged in - using default user';
    $_SESSION['user_id'] = 'USER-DEFAULT';
} else {
    $response['debug']['user_logged_in'] = true;
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

try {
    // Get and validate form data
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $meeting_date = isset($_POST['meeting_date']) ? trim($_POST['meeting_date']) : '';
    $meeting_time = isset($_POST['meeting_time']) ? trim($_POST['meeting_time']) : '';
    $duration = isset($_POST['duration']) ? floatval($_POST['duration']) : 1;
    $priority = isset($_POST['priority']) ? trim($_POST['priority']) : 'medium';
    
    $response['debug']['received_data'] = [
        'title' => $title,
        'meeting_date' => $meeting_date,
        'meeting_time' => $meeting_time,
        'duration' => $duration
    ];
    
    // Validate required fields
    if (empty($title)) {
        $response['message'] = 'Meeting title is required';
        echo json_encode($response);
        exit;
    }
    
    if (empty($meeting_date) || empty($meeting_time)) {
        $response['message'] = 'Meeting date and time are required';
        echo json_encode($response);
        exit;
    }
    
    // Combine date and time
    $meeting_datetime = $meeting_date . ' ' . $meeting_time;
    $meeting_timestamp = strtotime($meeting_datetime);
    
    if (!$meeting_timestamp) {
        $response['message'] = 'Invalid date/time format';
        echo json_encode($response);
        exit;
    }
    
    // Add meeting details to description
    $full_description = "MEETING SCHEDULED\n";
    $full_description .= "Date & Time: " . date('Y-m-d H:i', $meeting_timestamp) . "\n";
    $full_description .= "Duration: " . $duration . " hour(s)\n\n";
    $full_description .= "Agenda:\n" . $description;
    
    // Get current user ID
    $created_by = isset($_SESSION['user_id']) ? (string)$_SESSION['user_id'] : '';
    
    // Generate unique task ID for meeting
    $task_id = 'MEET-' . date('YmdHis') . '-' . substr(md5(uniqid()), 0, 6);
    
    // Get current timestamp as string
    $created_at = date('Y-m-d H:i:s');
    
    $response['debug']['task_id'] = $task_id;
    
    // Insert meeting as task into database
    $stmt = $conn->prepare("INSERT INTO tasks (id, title, description, priority, status, due_date, estimated_hours, assigned_to, created_at) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)");
    
    if (!$stmt) {
        $response['message'] = 'Database prepare error: ' . $conn->error;
        $response['debug']['db_error'] = $conn->error;
        echo json_encode($response);
        exit;
    }
    
    $stmt->bind_param("sssissss", $task_id, $title, $full_description, $priority, $meeting_timestamp, $duration, $created_by, $created_at);
    
    if ($stmt->execute()) {
        $response['debug']['insert'] = 'SUCCESS';
        
        // Log activity
        if ($created_by) {
            try {
                $activityStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, 'create', 'meeting', ?, ?, ?)");
                if ($activityStmt) {
                    $activityDescription = "Scheduled meeting: " . $title . " on " . date('Y-m-d H:i', $meeting_timestamp);
                    $activityStmt->bind_param("ssss", $created_by, $task_id, $activityDescription, $created_at);
                    $activityStmt->execute();
                    $activityStmt->close();
                }
            } catch (Exception $activityError) {
                error_log('Activity logging failed: ' . $activityError->getMessage());
            }
        }
        
        $response['success'] = true;
        $response['message'] = 'Meeting scheduled successfully';
        $response['meeting_id'] = $task_id;
        $response['meeting_title'] = $title;
        $response['meeting_datetime'] = date('Y-m-d H:i', $meeting_timestamp);
    } else {
        $response['message'] = 'Failed to schedule meeting: ' . $stmt->error;
        $response['debug']['execute_error'] = $stmt->error;
        $response['debug']['errno'] = $stmt->errno;
        error_log('Schedule Meeting Error: ' . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    $response['debug']['exception'] = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    error_log('Schedule Meeting Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
}

echo json_encode($response);
if (isset($conn)) {
    $conn->close();
}
?>
