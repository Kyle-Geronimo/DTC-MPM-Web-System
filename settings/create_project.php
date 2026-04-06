<?php
/**
 * Create Project Handler
 * Saves new project to database with validation, audit logging, and notifications
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

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in to create projects.', ERR_AUTH, 401);
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION, 405);
}

// Validate inputs
    /** @noinspection PhpUndefinedClassInspection */
    $v = new Validator($_POST);
$v->required('name', 'Project name')
  ->maxLength('name', 100, 'Project name')
  ->maxLength('description', 5000, 'Description')
  ->required('start_date', 'Start date')
  ->date('start_date', 'Start date')
  ->required('end_date', 'End date')
  ->date('end_date', 'End date')
  ->dateAfter('end_date', 'start_date', 'End date', 'Start date')
  ->inList('status', ['active', 'on-hold', 'completed'], 'Status')
  ->between('progress', 0, 100, 'Progress');


if (!$v->passes()) {
    respond_validation_error($v->errors());
}

/** @var mysqli $conn */
/** @noinspection PhpUndefinedVariableInspection */
safe_execute(function () use ($conn, $v) {
    $name = Validator::sanitize($v->get('name'));
    $description = Validator::sanitize($v->get('description'));
    $start_date = $v->get('start_date');
    $end_date = $v->get('end_date');
    $status = $v->get('status', 'active');
    $progress = intval($v->get('progress', 0));

    $start_timestamp = strtotime($start_date);
    $end_timestamp = strtotime($end_date);
    $created_by = (string)$_SESSION['user_id'];
    $project_id = 'PROJ-' . date('YmdHis') . '-' . substr(md5(uniqid(mt_rand(), true)), 0, 6);
    $created_at = date('Y-m-d H:i:s');

    // Insert project
    $stmt = $conn->prepare("INSERT INTO projects (id, name, description, start_date, end_date, status, progress, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        respond_error('Database error: ' . $conn->error, ERR_DATABASE, 500);
    }
    $stmt->bind_param("ssssissss", $project_id, $name, $description, $start_timestamp, $end_timestamp, $status, $progress, $created_by, $created_at);

    if ($stmt->execute()) {
        $stmt->close();

        // Audit log
        $audit = get_audit_logger($conn);
        $audit->log('create', 'project', $project_id, null, [
            'name' => $name,
            'status' => $status,
            'start_date' => $start_date,
            'end_date' => $end_date
        ]);

        // Notify all team members about new project
        $nm = get_notification_manager($conn);
        $creatorName = $_SESSION['full_name'] ?? 'Someone';
        $nm->notifyAll(
            'New Project Created',
            "$creatorName created project \"$name\"",
            'project',
            'projects.html'
        );

        respond_success([
            'project_id' => $project_id,
            'project_name' => $name
        ], 'Project created successfully');
    } else {
        $error = $stmt->error;
        $stmt->close();
        respond_error('Failed to create project: ' . $error, ERR_DATABASE, 500);
    }
});
?>
