<?php
/**
 * Add Team Handler
 * Saves new team to database
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
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    
    $response['debug']['received_data'] = [
        'name' => $name,
        'description' => $description
    ];
    
    // Validate required fields
    if (empty($name)) {
        $response['message'] = 'Team name is required';
        echo json_encode($response);
        exit;
    }
    
    // Get current user ID
    $created_by = isset($_SESSION['user_id']) ? (string)$_SESSION['user_id'] : '';
    
    // Generate unique team ID
    $team_id = rand(1000, 999999); // Simple numeric ID for compatibility
    
    // Get current timestamp as string
    $created_at = date('Y-m-d H:i:s');
    
    $response['debug']['team_id'] = $team_id;
    
    // Insert team into database
    $stmt = $conn->prepare("INSERT INTO teams (id, name, description, created_at) VALUES (?, ?, ?, ?)");
    
    if (!$stmt) {
        $response['message'] = 'Database prepare error: ' . $conn->error;
        $response['debug']['db_error'] = $conn->error;
        echo json_encode($response);
        exit;
    }
    
    $stmt->bind_param("isss", $team_id, $name, $description, $created_at);
    
    if ($stmt->execute()) {
        $response['debug']['insert'] = 'SUCCESS';
        
        // Log activity
        if ($created_by) {
            try {
                $activityStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, 'create', 'team', ?, ?, ?)");
                if ($activityStmt) {
                    $activityDescription = "Created new team: " . $name;
                    // Convert team_id to string for activity log
                    $team_id_str = (string)$team_id;
                    $activityStmt->bind_param("ssss", $created_by, $team_id_str, $activityDescription, $created_at);
                    $activityStmt->execute();
                    $activityStmt->close();
                }
            } catch (Exception $activityError) {
                error_log('Activity logging failed: ' . $activityError->getMessage());
            }
        }
        
        $response['success'] = true;
        $response['message'] = 'Team added successfully';
        $response['team_id'] = $team_id;
        $response['team_name'] = $name;
    } else {
        $response['message'] = 'Failed to add team: ' . $stmt->error;
        $response['debug']['execute_error'] = $stmt->error;
        $response['debug']['errno'] = $stmt->errno;
        error_log('Add Team Error: ' . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    $response['debug']['exception'] = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    error_log('Add Team Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
}

echo json_encode($response);
if (isset($conn)) {
    $conn->close();
}
?>
