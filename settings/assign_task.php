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
use Validator;
require_once('audit_logger.php');
require_once('notification_manager.php');
require_once('email_service.php');

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in to assign tasks.', ERR_AUTH, 401);
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

    $due_timestamp = strtotime($due_date);
    $created_by = (string)$_SESSION['user_id'];
    $task_id = 'TASK-' . date('YmdHis') . '-' . substr(md5(uniqid(mt_rand(), true)), 0, 6);
    $created_at = date('Y-m-d H:i:s');

    // Insert task
    $stmt = $conn->prepare("INSERT INTO tasks (id, title, description, priority, status, due_date, estimated_hours, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        respond_error('Database error: ' . $conn->error, ERR_DATABASE, 500);
    }
    $stmt->bind_param("sssssisss", $task_id, $title, $description, $priority, $status, $due_timestamp, $estimated_hours, $created_by, $created_at);

    if ($stmt->execute()) {
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
        $userId = intval($_SESSION['user_id']);
        $nm->notify(
            $userId,
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
