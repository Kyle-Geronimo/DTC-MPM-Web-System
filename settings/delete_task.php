<?php
/**
 * Delete Task API
 * Deletes a task by id (hard delete)
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');
require_once('audit_logger.php');
header('Content-Type: application/json');

$response = ['success' => false, 'message' => '', 'posted' => [], 'db_error' => ''];
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        $response['message'] = 'Invalid request method';
        echo json_encode($response);
        exit;
    }

    $task_id = isset($_POST['task_id']) ? trim($_POST['task_id']) : '';
    if (empty($task_id)) {
        $response['message'] = 'Task id required';
        $response['posted'] = $_POST;
        echo json_encode($response);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
    if (!$stmt) {
        $response['message'] = 'DB prepare error';
        $response['db_error'] = $conn->error;
        echo json_encode($response);
        exit;
    }
    $stmt->bind_param('s', $task_id);
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Task deleted';

        // Audit log
        $audit = get_audit_logger($conn);
        $audit->log('delete', 'task', $task_id);
    } else {
        $response['message'] = 'Delete failed';
        $response['db_error'] = $stmt->error;
        $response['posted'] = $_POST;
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

echo json_encode($response);
if (isset($conn)) $conn->close();

?>
