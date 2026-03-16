<?php
/**
 * Update Task API
 * Updates an existing task by id
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

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

    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $priority = isset($_POST['priority']) ? trim($_POST['priority']) : 'medium';
    $status = isset($_POST['status']) ? trim($_POST['status']) : 'pending';
    $due_date = isset($_POST['due_date']) ? trim($_POST['due_date']) : '';
    $estimated_hours = isset($_POST['estimated_hours']) ? floatval($_POST['estimated_hours']) : 0;

    if (empty($title)) {
        $response['message'] = 'Title is required';
        $response['posted'] = $_POST;
        echo json_encode($response);
        exit;
    }

    $due_timestamp = null;
    if (!empty($due_date)) {
        $ts = strtotime($due_date);
        if ($ts === false) {
            $response['message'] = 'Invalid due date';
            $response['posted'] = $_POST;
            echo json_encode($response);
            exit;
        }
        $due_timestamp = $ts;
    }

    $stmt = $conn->prepare("UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, estimated_hours = ? WHERE id = ?");
    if (!$stmt) {
        $response['message'] = 'DB prepare error: ' . $conn->error;
        echo json_encode($response);
        exit;
    }
    // types: title(s), description(s), priority(s), status(s), due_date(i), estimated_hours(d), task_id(s)
    $stmt->bind_param('ssssids', $title, $description, $priority, $status, $due_timestamp, $estimated_hours, $task_id);
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Task updated';
    } else {
        $response['message'] = 'Update failed';
        $response['db_error'] = $stmt->error ?: $conn->error;
        $response['posted'] = $_POST;
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

echo json_encode($response);
if (isset($conn)) $conn->close();

?>
