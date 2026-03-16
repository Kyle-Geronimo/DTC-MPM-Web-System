<?php
/**
 * Delete Project Handler
 * Deletes a project from the database
 */

session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');

// Set JSON header
header('Content-Type: application/json');

// Initialize response
$response = [
    'success' => false,
    'message' => ''
];

// Check if user is logged in (optional for now)
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    $response['debug']['warning'] = 'Not logged in - allowing delete anyway';
    $_SESSION['user_id'] = 'USER-DEFAULT';
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

try {
    // Get project ID
    $project_id = isset($_POST['project_id']) ? trim($_POST['project_id']) : '';
    
    if (empty($project_id)) {
        $response['message'] = 'Project ID is required';
        echo json_encode($response);
        exit;
    }
    
    // First, get project name for activity log
    $stmt = $conn->prepare("SELECT name FROM projects WHERE id = ?");
    $stmt->bind_param("s", $project_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $project = $result->fetch_assoc();
    $stmt->close();
    
    if (!$project) {
        $response['message'] = 'Project not found';
        echo json_encode($response);
        exit;
    }
    
    // Delete the project
    $stmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
    $stmt->bind_param("s", $project_id);
    
    if ($stmt->execute()) {
        // Log the deletion
        $user_id = isset($_SESSION['user_id']) ? (string)$_SESSION['user_id'] : 'SYSTEM';
        $created_at = date('Y-m-d H:i:s');
        
        try {
            $activityStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, 'delete', 'project', ?, ?, ?)");
            if ($activityStmt) {
                $activityDescription = "Deleted project: " . $project['name'];
                $activityStmt->bind_param("ssss", $user_id, $project_id, $activityDescription, $created_at);
                $activityStmt->execute();
                $activityStmt->close();
            }
        } catch (Exception $activityError) {
            error_log('Activity logging failed: ' . $activityError->getMessage());
        }
        
        $response['success'] = true;
        $response['message'] = 'Project deleted successfully';
        $response['project_id'] = $project_id;
        $response['project_name'] = $project['name'];
    } else {
        $response['message'] = 'Failed to delete project: ' . $stmt->error;
        error_log('Delete Project Error: ' . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    error_log('Delete Project Exception: ' . $e->getMessage());
}

echo json_encode($response);
$conn->close();
?>
