<?php
/**
 * Add Team Handler
 * Saves new team to database
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

// Set JSON header
header('Content-Type: application/json');

// Require login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in to create teams', ERR_AUTH);
}

// Require POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION);
}

/** @var mysqli $conn */
/** @noinspection PhpUndefinedVariableInspection */
safe_execute(function() use ($conn) {
    // Validate input
    /** @noinspection PhpUndefinedClassInspection */
    $v = new Validator($_POST);
    $v->required('name', 'Team name')
      ->maxLength('name', 100, 'Team name');

    if (!$v->passes()) {
        respond_validation_error($v->errors());
    }

    $name = Validator::sanitize($_POST['name']);
    $description = Validator::sanitize($_POST['description'] ?? '');
    $created_by = (string)$_SESSION['user_id'];
    $team_id = rand(1000, 999999);
    $created_at = date('Y-m-d H:i:s');

    // Insert team
    $stmt = $conn->prepare("INSERT INTO teams (id, name, description, created_at) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        respond_error('Database error', ERR_DATABASE);
    }

    $stmt->bind_param("isss", $team_id, $name, $description, $created_at);

    if (!$stmt->execute()) {
        error_log('Add Team Error: ' . $stmt->error);
        respond_error('Failed to create team', ERR_DATABASE);
    }
    $stmt->close();

    // Audit log
    $audit = get_audit_logger($conn);
    $audit->log('create', 'team', (string)$team_id, null, [
        'name' => $name,
        'description' => $description
    ]);

    respond_success([
        'team_id' => $team_id,
        'team_name' => $name
    ], 'Team created successfully');
});
?>
