<?php
/**
 * Get Specific Team Members API
 * Returns members of a specific team
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($conn) || $conn === null) {
    respond_error('Database connection failed', ERR_DATABASE);
}

$team_id = isset($_GET['team_id']) ? intval($_GET['team_id']) : null;

if (!$team_id) {
    respond_error('Team ID is required', ERR_VALIDATION);
}

$query = "SELECT u.id, u.full_name, u.username, u.email, u.role, tm.joined_at 
          FROM users u
          INNER JOIN team_members tm ON tm.user_id = u.id
          WHERE tm.team_id = ?
          ORDER BY u.full_name ASC";

$stmt = $conn->prepare($query);
if (!$stmt) {
    error_log('Get Team Members Prepare Error: ' . $conn->error);
    respond_error('Database error: ' . $conn->error, ERR_DATABASE);
}

$stmt->bind_param("i", $team_id);
if (!$stmt->execute()) {
    error_log('Get Team Members Execute Error: ' . $stmt->error);
    respond_error('Failed to execute query: ' . $stmt->error, ERR_DATABASE);
}

$result = $stmt->get_result();
$members = [];

while ($row = $result->fetch_assoc()) {
    $members[] = $row;
}

$stmt->close();

respond_success(['members' => $members], 'Team members retrieved successfully');
?>
