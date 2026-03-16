<?php
/**
 * Create Project Handler
 * Saves new project to database
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
    'debug' => [] // Add debug info
];

// Check if user is logged in (temporarily make this a warning, not a blocker)
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // For now, allow creation but use a default user
    $response['debug']['warning'] = 'Not logged in - using default user';
    $_SESSION['user_id'] = 'USER-DEFAULT'; // Temporary default user
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
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $start_date = isset($_POST['start_date']) ? trim($_POST['start_date']) : '';
    $end_date = isset($_POST['end_date']) ? trim($_POST['end_date']) : '';
    $status = isset($_POST['status']) ? trim($_POST['status']) : 'active';
    $progress = isset($_POST['progress']) ? intval($_POST['progress']) : 0;
    
    // Debug: Log received data
    $response['debug']['received_data'] = [
        'name' => $name,
        'start_date' => $start_date,
        'end_date' => $end_date,
        'status' => $status,
        'progress' => $progress
    ];
    
    // Validate required fields
    if (empty($name)) {
        $response['message'] = 'Project name is required';
        echo json_encode($response);
        exit;
    }
    
    if (empty($start_date)) {
        $response['message'] = 'Start date is required';
        echo json_encode($response);
        exit;
    }
    
    if (empty($end_date)) {
        $response['message'] = 'End date is required';
        echo json_encode($response);
        exit;
    }
    
    // Validate date format and logic
    $start_timestamp = strtotime($start_date);
    $end_timestamp = strtotime($end_date);
    
    if (!$start_timestamp || !$end_timestamp) {
        $response['message'] = 'Invalid date format';
        echo json_encode($response);
        exit;
    }
    
    if ($end_timestamp < $start_timestamp) {
        $response['message'] = 'End date must be after start date';
        echo json_encode($response);
        exit;
    }
    
    // Validate progress
    if ($progress < 0 || $progress > 100) {
        $progress = 0;
    }
    
    // Get current user ID and convert to string
    $created_by = isset($_SESSION['user_id']) ? (string)$_SESSION['user_id'] : '';
    
    // Generate unique project ID
    $project_id = 'PROJ-' . date('YmdHis') . '-' . substr(md5(uniqid()), 0, 6);
    
    // Get current timestamp as string
    $created_at = date('Y-m-d H:i:s');
    
    // Convert dates to timestamps (as integers matching the table structure)
    $start_timestamp = strtotime($start_date);
    $end_timestamp = strtotime($end_date);
    
    $response['debug']['project_id'] = $project_id;
    $response['debug']['timestamps'] = [
        'start' => $start_timestamp,
        'end' => $end_timestamp
    ];
    
    // Insert project into database
    $stmt = $conn->prepare("INSERT INTO projects (id, name, description, start_date, end_date, status, progress, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        $response['message'] = 'Database prepare error: ' . $conn->error;
        $response['debug']['db_error'] = $conn->error;
        echo json_encode($response);
        exit;
    }
    
    $response['debug']['bind_params'] = [
        'id' => $project_id,
        'name' => $name,
        'start_timestamp' => $start_timestamp,
        'end_timestamp' => $end_timestamp,
        'status' => $status,
        'progress' => $progress,
        'created_by' => $created_by
    ];
    
    $stmt->bind_param("ssssissss", $project_id, $name, $description, $start_timestamp, $end_timestamp, $status, $progress, $created_by, $created_at);
    
    if ($stmt->execute()) {
        $response['debug']['insert'] = 'SUCCESS';
        
        // Log activity (optional - don't fail if logging fails)
        if ($created_by) {
            try {
                $activityStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, 'create', 'project', ?, ?, ?)");
                if ($activityStmt) {
                    $activityDescription = "Created new project: " . $name;
                    // Note: entity_id is project string ID, may need table adjustment later
                    $activityStmt->bind_param("ssss", $created_by, $project_id, $activityDescription, $created_at);
                    $activityStmt->execute();
                    $activityStmt->close();
                }
            } catch (Exception $activityError) {
                // Log error but don't fail the project creation
                error_log('Activity logging failed: ' . $activityError->getMessage());
            }
        }
        
        $response['success'] = true;
        $response['message'] = 'Project created successfully';
        $response['project_id'] = $project_id;
        $response['project_name'] = $name;
    } else {
        $response['message'] = 'Failed to create project: ' . $stmt->error;
        $response['debug']['execute_error'] = $stmt->error;
        $response['debug']['errno'] = $stmt->errno;
        error_log('Create Project Error: ' . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    $response['debug']['exception'] = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    error_log('Create Project Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
}

echo json_encode($response);
if (isset($conn)) {
    $conn->close();
}
?>
