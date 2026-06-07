<?php
/**
 * Delete Project Handler
 * Deletes a project from the database
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');
require_once('audit_logger.php');

// Set JSON header
header('Content-Type: application/json');

// Ensure DB connection is available
if (!isset($conn) || !($conn instanceof mysqli)) {
    respond_error('Database connection failed', ERR_DATABASE, 500);
}

// Initialize response
$response = [
    'success' => false,
    'message' => ''
];

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
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
        // Audit log
        $audit = get_audit_logger($conn);
        $audit->log('delete', 'project', $project_id, ['name' => $project['name']], null);
        
        // Save report entry for deletion
        try {
            require_once(__DIR__ . '/report_helper.php');
            save_report($conn, 'Project Deleted: ' . $project['name'], 'project', [
                'project_id' => $project_id,
                'name' => $project['name']
            ]);
        } catch (Exception $e) {
            error_log('delete_project: save_report failed: ' . $e->getMessage());
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
