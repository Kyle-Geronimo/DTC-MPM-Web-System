<?php
/**
 * Assign Task Handler
 * Saves new task to database
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

// Check if user is logged in (temporarily make this a warning, not a blocker)
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
    $priority = isset($_POST['priority']) ? trim($_POST['priority']) : 'medium';
    $status = isset($_POST['status']) ? trim($_POST['status']) : 'pending';
    $due_date = isset($_POST['due_date']) ? trim($_POST['due_date']) : '';
    $estimated_hours = isset($_POST['estimated_hours']) ? floatval($_POST['estimated_hours']) : 0;
    
    $response['debug']['received_data'] = [
        'title' => $title,
        'priority' => $priority,
        'status' => $status,
        'due_date' => $due_date
    ];
    
    // Validate required fields
    if (empty($title)) {
        $response['message'] = 'Task title is required';
        echo json_encode($response);
        exit;
    }
    
    if (empty($due_date)) {
        $response['message'] = 'Due date is required';
        echo json_encode($response);
        exit;
    }
    
    // Convert due date to timestamp
    $due_timestamp = strtotime($due_date);
    
    if (!$due_timestamp) {
        $response['message'] = 'Invalid date format';
        echo json_encode($response);
        exit;
    }
    
    // Get current user ID
    $created_by = isset($_SESSION['user_id']) ? (string)$_SESSION['user_id'] : '';
    
    // Generate unique task ID
    $task_id = 'TASK-' . date('YmdHis') . '-' . substr(md5(uniqid()), 0, 6);
    
    // Get current timestamp as string
    $created_at = date('Y-m-d H:i:s');
    
    $response['debug']['task_id'] = $task_id;
    
    // Insert task into database
    $stmt = $conn->prepare("INSERT INTO tasks (id, title, description, priority, status, due_date, estimated_hours, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        $response['message'] = 'Database prepare error: ' . $conn->error;
        $response['debug']['db_error'] = $conn->error;
        echo json_encode($response);
        exit;
    }
    
    $stmt->bind_param("sssssisss", $task_id, $title, $description, $priority, $status, $due_timestamp, $estimated_hours, $created_by, $created_at);
    
    if ($stmt->execute()) {
        $response['debug']['insert'] = 'SUCCESS';
        
        // Log activity (optional - don't fail if logging fails)
        if ($created_by) {
            try {
                $activityStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, 'create', 'task', ?, ?, ?)");
                if ($activityStmt) {
                    $activityDescription = "Created new task: " . $title;
                    $activityStmt->bind_param("ssss", $created_by, $task_id, $activityDescription, $created_at);
                    $activityStmt->execute();
                    $activityStmt->close();
                }
            } catch (Exception $activityError) {
                error_log('Activity logging failed: ' . $activityError->getMessage());
            }
        }
        
        $response['success'] = true;
        $response['message'] = 'Task assigned successfully';
        $response['task_id'] = $task_id;
        $response['task_title'] = $title;
    } else {
        $response['message'] = 'Failed to assign task: ' . $stmt->error;
        $response['debug']['execute_error'] = $stmt->error;
        $response['debug']['errno'] = $stmt->errno;
        error_log('Assign Task Error: ' . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    $response['debug']['exception'] = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    error_log('Assign Task Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
}

echo json_encode($response);
if (isset($conn)) {
    $conn->close();
}
?>
