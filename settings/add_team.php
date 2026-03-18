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

if (!isset($conn) || $conn === null) {
    respond_error('Database connection failed', ERR_DATABASE);
}

// Validate input
$v = new Validator($_POST);
$v->required('name', 'Team name')
  ->maxLength('name', 100, 'Team name');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

$name = Validator::sanitize($_POST['name']);
$description = Validator::sanitize($_POST['description'] ?? '');
$team_lead = !empty($_POST['team_lead']) ? intval($_POST['team_lead']) : null;
$team_id = rand(1000, 999999);
$created_at = date('Y-m-d H:i:s');

try {
    // Insert team with team_lead if provided
    if ($team_lead) {
        $stmt = $conn->prepare("INSERT INTO teams (id, name, description, team_lead, created_at) VALUES (?, ?, ?, ?, ?)");
        if (!$stmt) {
            error_log('Add Team Prepare Error: ' . $conn->error);
            respond_error('Database error', ERR_DATABASE);
        }
        $stmt->bind_param("issii", $team_id, $name, $description, $team_lead, $created_at);
    } else {
        $stmt = $conn->prepare("INSERT INTO teams (id, name, description, created_at) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            error_log('Add Team Prepare Error: ' . $conn->error);
            respond_error('Database error', ERR_DATABASE);
        }
        $stmt->bind_param("isss", $team_id, $name, $description, $created_at);
    }

    $stmt->execute();
    $stmt->close();

    // Handle members if provided
    if (!empty($_POST['members'])) {
        $members_json = $_POST['members'];
        $members = json_decode($members_json, true);
        if (is_array($members)) {
            foreach ($members as $user_id) {
                $user_id = intval($user_id);
                $stmt = $conn->prepare("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)");
                if ($stmt) {
                    $stmt->bind_param("ii", $team_id, $user_id);
                    $stmt->execute();
                    $stmt->close();
                }
            }
        }
    }
} catch (mysqli_sql_exception $e) {
    error_log('Add Team Exception: ' . $e->getMessage());
    respond_error('Failed to create team', ERR_DATABASE, 500);
}

// Audit log
try {
    $audit = get_audit_logger($conn);
    if ($audit) {
        $audit->log('create', 'team', (string)$team_id, null, [
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
    'team_id' => $team_id,
    'team_name' => $name
], 'Team created successfully');
?>
