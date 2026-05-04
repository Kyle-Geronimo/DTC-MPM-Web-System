<?php
/**
 * Update Task API
 * Updates an existing task by id
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');
require_once('validator.php');
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
    if (!ctype_digit($task_id)) {
        $response['message'] = 'Invalid task id';
        $response['posted'] = $_POST;
        echo json_encode($response);
        exit;
    }
    $task_id = intval($task_id);

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

    $taskColumns = [];
    $columnsResult = $conn->query("SHOW COLUMNS FROM tasks");
    while ($row = $columnsResult->fetch_assoc()) {
        $taskColumns[$row['Field']] = strtolower($row['Type']);
    }
    $due_date_type = $taskColumns['due_date'] ?? 'date';
    $due_date_is_int = strpos($due_date_type, 'int') !== false;

    if (!empty($due_date)) {
        $parsedDate = strtotime($due_date);
        if ($parsedDate === false) {
            $response['message'] = 'Invalid due date';
            $response['posted'] = $_POST;
            echo json_encode($response);
            exit;
        }
        $due_date = $due_date_is_int
            ? $parsedDate
            : date('Y-m-d', $parsedDate);
    } else {
        $response['message'] = 'Due date is required';
        $response['posted'] = $_POST;
        echo json_encode($response);
        exit;
    }

    $stmt = $conn->prepare("UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, estimated_hours = ? WHERE id = ?");
    if (!$stmt) {
        $response['message'] = 'DB prepare error: ' . $conn->error;
        echo json_encode($response);
        exit;
    }
    // types: title(s), description(s), priority(s), status(s), due_date(dynamic), estimated_hours(d), task_id(i)
    $stmt->bind_param('ssss' . ($due_date_is_int ? 'i' : 's') . 'di', $title, $description, $priority, $status, $due_date, $estimated_hours, $task_id);
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Task updated';

        // Audit log
        $audit = get_audit_logger($conn);
        $audit->log('update', 'task', $task_id, null, [
            'title' => $title, 'priority' => $priority, 'status' => $status
        ]);
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
