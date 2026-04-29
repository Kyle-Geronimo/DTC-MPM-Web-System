<?php
/**
 * Delete Team Handler
 * Deletes a team from the database
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
    respond_error('Please log in to delete teams', ERR_AUTH);
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
$v->required('id', 'Team ID');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

$id = intval($_POST['id']);

// Authorization: only admin or team lead can delete
$current_user_id = intval($_SESSION['user_id'] ?? 0);
$user_role = '';
$stmt_r = $conn->prepare("SELECT role FROM users WHERE id = ?");
$stmt_r->bind_param('i', $current_user_id);
$stmt_r->execute();
$rr = $stmt_r->get_result();
if ($row_r = $rr->fetch_assoc()) $user_role = $row_r['role'];
$stmt_r->close();

if ($user_role !== 'admin') {
    $stmt_l = $conn->prepare("SELECT id FROM teams WHERE id = ? AND team_lead = ?");
    $stmt_l->bind_param('ii', $id, $current_user_id);
    $stmt_l->execute();
    if ($stmt_l->get_result()->num_rows === 0) {
        $stmt_l->close();
        respond_error('Only admins or team leaders can delete teams', ERR_AUTH);
    }
    $stmt_l->close();
}

try {
    // First, delete all team members associated with this team
    $stmt = $conn->prepare("DELETE FROM team_members WHERE team_id = ?");
    if (!$stmt) {
        error_log('Delete Team Members Prepare Error: ' . $conn->error);
        respond_error('Database error', ERR_DATABASE);
    }
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();

    // Delete the team
    $stmt = $conn->prepare("DELETE FROM teams WHERE id = ?");
    if (!$stmt) {
        error_log('Delete Team Prepare Error: ' . $conn->error);
        respond_error('Database error', ERR_DATABASE);
    }
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
} catch (mysqli_sql_exception $e) {
    error_log('Delete Team Exception: ' . $e->getMessage());
    respond_error('Failed to delete team', ERR_DATABASE, 500);
}

// Audit log
try {
    $audit = get_audit_logger($conn);
    if ($audit) {
        $audit->log('delete', 'team', (string)$id, null, []);
    }
} catch (Exception $e) {
    error_log('Audit log error: ' . $e->getMessage());
    // Don't fail the request if audit logging fails
}

// Save a report entry for deletion
try {
    require_once(__DIR__ . '/report_helper.php');
    save_report($conn, 'Team Deleted: ' . $id, 'team', [
        'team_id' => $id
    ]);
} catch (Exception $e) {
    error_log('delete_team: save_report failed: ' . $e->getMessage());
}

respond_success(['team_id' => $id], 'Team deleted successfully');
?>

