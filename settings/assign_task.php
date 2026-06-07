<?php
/**
 * Assign Task Handler
 * Saves new task to database with validation, audit logging, and notifications
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');
/** @var mysqli $conn */
if (!isset($conn)) { $conn = null; }
require_once('error_handler.php');
require_once('validator.php');
require_once('audit_logger.php');
require_once('notification_manager.php');
require_once('email_service.php');

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in to assign tasks.', ERR_AUTH, 401);
}

if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    respond_error('User session is invalid. Please log in again.', ERR_AUTH, 401);
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION, 405);
}

// Validate inputs
    /** @noinspection PhpUndefinedClassInspection */
    $v = new Validator($_POST);
$v->required('title', 'Task title')
  ->maxLength('title', 150, 'Task title')
  ->maxLength('description', 5000, 'Description')
  ->inList('priority', ['low', 'medium', 'high', 'critical'], 'Priority')
  ->inList('status', ['pending', 'in-progress', 'completed', 'todo'], 'Status')
  ->required('due_date', 'Due date')
  ->date('due_date', 'Due date')
  ->numeric('estimated_hours', 'Estimated hours');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

/** @var mysqli $conn */
/** @noinspection PhpUndefinedVariableInspection */
safe_execute(function () use ($conn, $v) {
    $title = Validator::sanitize($v->get('title'));
    $description = Validator::sanitize($v->get('description'));
    $priority = $v->get('priority', 'medium');
    $status = $v->get('status', 'pending');
    $due_date = $v->get('due_date');
    $estimated_hours = floatval($v->get('estimated_hours', 0));

    $taskColumns = [];
    $columnsResult = $conn->query("SHOW COLUMNS FROM tasks");
    while ($row = $columnsResult->fetch_assoc()) {
        $taskColumns[$row['Field']] = strtolower($row['Type']);
    }

    $due_date_type = $taskColumns['due_date'] ?? 'date';
    $assigned_to_type = $taskColumns['assigned_to'] ?? 'int';
    $due_date_is_int = strpos($due_date_type, 'int') !== false;
    $assigned_to_is_int = strpos($assigned_to_type, 'int') !== false;
    $due_timestamp = strtotime($due_date);

    if ($due_timestamp === false) {
        respond_error('Invalid due date', ERR_VALIDATION, 422);
    }

    $normalized_due_date = $due_date_is_int
        ? $due_timestamp
        : date('Y-m-d', $due_timestamp);
    $assigned_to = $assigned_to_is_int
        ? intval($_SESSION['user_id'])
        : (string)$_SESSION['user_id'];
    $bind_types = 'ssss' . ($due_date_is_int ? 'i' : 's') . 'd' . ($assigned_to_is_int ? 'i' : 's') . 's';
    $created_at = date('Y-m-d H:i:s');

    // Insert task using the table's auto-increment integer ID.
    $stmt = $conn->prepare("INSERT INTO tasks (title, description, priority, status, due_date, estimated_hours, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        respond_error('Database error: ' . $conn->error, ERR_DATABASE, 500);
    }
    $stmt->bind_param($bind_types, $title, $description, $priority, $status, $normalized_due_date, $estimated_hours, $assigned_to, $created_at);

    if ($stmt->execute()) {
        $task_id = intval($stmt->insert_id);
        $stmt->close();

        // Audit log
        $audit = get_audit_logger($conn);
        $audit->log('create', 'task', $task_id, null, [
            'title' => $title,
            'priority' => $priority,
            'status' => $status,
            'due_date' => $due_date
        ]);

        // Notify user about task assignment
        $nm = get_notification_manager($conn);
        $creatorName = $_SESSION['full_name'] ?? 'Someone';
        $nm->notify(
            $assigned_to,
            'Task Assigned: ' . $title,
            "Priority: " . ucfirst($priority) . " | Due: $due_date",
            'task',
            'tasks.html'
        );

        // Send email notification for high/critical tasks
        if (in_array($priority, ['high', 'critical']) && !empty($_SESSION['email'])) {
            $emailService = get_email_service($conn);
            $emailService->sendTaskAssigned(
                $_SESSION['email'],
                $_SESSION['full_name'] ?? 'User',
                $title,
                $due_date,
                $priority
            );
        }

        respond_success([
            'task_id' => $task_id,
            'task_title' => $title
        ], 'Task assigned successfully');
    } else {
        $error = $stmt->error;
        $stmt->close();
        respond_error('Failed to assign task: ' . $error, ERR_DATABASE, 500);
    }
});
?>
