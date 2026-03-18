<?php
/**
 * Update Team Handler
 * Updates an existing team in the database
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
    respond_error('Please log in to update teams', ERR_AUTH);
}

// Require POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION);
}

if (!isset($conn) || $conn === null) {
    respond_error('Database connection failed', ERR_DATABASE);
}

// Validate input
$v = new Validator($_POST);
$v->required('id', 'Team ID')
  ->required('name', 'Team name')
  ->maxLength('name', 100, 'Team name');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

$id = intval($_POST['id']);
$name = Validator::sanitize($_POST['name']);
$description = Validator::sanitize($_POST['description'] ?? '');
$team_lead = !empty($_POST['team_lead']) ? intval($_POST['team_lead']) : null;

// Update team
try {
    if ($team_lead) {
        $stmt = $conn->prepare("UPDATE teams SET name = ?, description = ?, team_lead = ? WHERE id = ?");
        $stmt->bind_param("ssii", $name, $description, $team_lead, $id);
    } else {
        $stmt = $conn->prepare("UPDATE teams SET name = ?, description = ? WHERE id = ?");
        $stmt->bind_param("ssi", $name, $description, $id);
    }

    if (!$stmt) {
        error_log('Update Team Prepare Error: ' . $conn->error);
        respond_error('Database error', ERR_DATABASE);
    }

    $stmt->execute();
    $stmt->close();
} catch (mysqli_sql_exception $e) {
    error_log('Update Team Exception: ' . $e->getMessage());
    respond_error('Failed to update team', ERR_DATABASE, 500);
}

// Audit log
try {
    $audit = get_audit_logger($conn);
    if ($audit) {
        $audit->log('update', 'team', (string)$id, null, [
            'name' => $name,
            'description' => $description,
            'team_lead' => $team_lead
        ]);
    }
} catch (Exception $e) {
    error_log('Audit log error: ' . $e->getMessage());
    // Don't fail the request if audit logging fails
}

respond_success([
    'team_id' => $id,
    'team_name' => $name
], 'Team updated successfully');
?>

