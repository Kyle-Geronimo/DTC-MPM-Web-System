<?php
/**
 * Schedule Meeting Handler
 * Saves meeting as a task to database
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

// Set JSON header
header('Content-Type: application/json');

// Require login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in to schedule meetings', ERR_AUTH);
}

if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    respond_error('User session is invalid. Please log in again.', ERR_AUTH, 401);
}

// Require POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION);
}

safe_execute(function() use ($conn) {
    // Validate input
    /** @noinspection PhpUndefinedClassInspection */
    $v = new Validator($_POST);
    $v->required('title', 'Meeting title')
      ->required('meeting_date', 'Meeting date')
      ->required('meeting_time', 'Meeting time')
      ->maxLength('title', 200, 'Title');

    if (!$v->passes()) {
            respond_validation_error($v->errors());
        }

    /** @var mysqli $conn */
    /** @noinspection PhpUndefinedVariableInspection */
        $title = Validator::sanitize($_POST['title']);
    $description = Validator::sanitize($_POST['description'] ?? '');
    $meeting_date = Validator::sanitize($_POST['meeting_date']);
    $meeting_time = Validator::sanitize($_POST['meeting_time']);
    $duration = isset($_POST['duration']) ? floatval($_POST['duration']) : 1;
    $priority = isset($_POST['priority']) && in_array($_POST['priority'], ['low','medium','high','critical']) ? $_POST['priority'] : 'medium';

    // Combine and validate date/time
    $meeting_datetime = $meeting_date . ' ' . $meeting_time;
    $meeting_timestamp = strtotime($meeting_datetime);
    if (!$meeting_timestamp) {
        respond_error('Invalid date/time format', ERR_VALIDATION);
    }

    // Build full description
    $full_description = "MEETING SCHEDULED\n";
    $full_description .= "Date & Time: " . date('Y-m-d H:i', $meeting_timestamp) . "\n";
    $full_description .= "Duration: " . $duration . " hour(s)\n\n";
    $full_description .= "Agenda:\n" . $description;

    $taskColumns = [];
    $columnsResult = $conn->query("SHOW COLUMNS FROM tasks");
    while ($row = $columnsResult->fetch_assoc()) {
        $taskColumns[$row['Field']] = strtolower($row['Type']);
    }

    $due_date_type = $taskColumns['due_date'] ?? 'date';
    $assigned_to_type = $taskColumns['assigned_to'] ?? 'int';
    $due_date_is_int = strpos($due_date_type, 'int') !== false;
    $assigned_to_is_int = strpos($assigned_to_type, 'int') !== false;
    $normalized_due_date = $due_date_is_int
        ? $meeting_timestamp
        : date('Y-m-d', $meeting_timestamp);
    $assigned_to = $assigned_to_is_int
        ? intval($_SESSION['user_id'])
        : (string)$_SESSION['user_id'];
    $bind_types = 'sss' . ($due_date_is_int ? 'i' : 's') . 'd' . ($assigned_to_is_int ? 'i' : 's') . 's';
    $created_at = date('Y-m-d H:i:s');

    // Insert meeting as task using the table's auto-increment integer ID.
    $stmt = $conn->prepare("INSERT INTO tasks (title, description, priority, status, due_date, estimated_hours, assigned_to, created_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)");
    if (!$stmt) {
        respond_error('Database error', ERR_DATABASE);
    }

    $stmt->bind_param($bind_types, $title, $full_description, $priority, $normalized_due_date, $duration, $assigned_to, $created_at);

    if (!$stmt->execute()) {
        error_log('Schedule Meeting Error: ' . $stmt->error);
        respond_error('Failed to schedule meeting', ERR_DATABASE);
    }
    $task_id = intval($stmt->insert_id);
    $stmt->close();

    // Audit log
    $audit = get_audit_logger($conn);
    $audit->log('create', 'meeting', $task_id, null, [
        'title' => $title,
        'datetime' => date('Y-m-d H:i', $meeting_timestamp),
        'duration' => $duration,
        'priority' => $priority
    ]);

    // Notify all users about the meeting
    $notifier = get_notification_manager($conn);
    $notifier->notifyAll(
        'meeting_scheduled',
        'New meeting: ' . $title . ' on ' . date('M j, Y g:i A', $meeting_timestamp),
        'meeting',
        $task_id
    );

    respond_success([
        'meeting_id' => $task_id,
        'meeting_title' => $title,
        'meeting_datetime' => date('Y-m-d H:i', $meeting_timestamp)
    ], 'Meeting scheduled successfully');
});
?>
