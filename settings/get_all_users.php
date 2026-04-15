<?php
/**
 * Get All Users API
 * Returns list of all users for team lead selection and member selection
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($conn) || $conn === null) {
    respond_error('Database connection failed', ERR_DATABASE);
}

$query = "SELECT id, full_name, username, email FROM users WHERE status = 'active' ORDER BY full_name ASC";
$result = $conn->query($query);
if (!$result) {
    error_log('Get All Users Query Error: ' . $conn->error);
    respond_error('Failed to retrieve users: ' . $conn->error, ERR_DATABASE);
}

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

respond_success(['users' => $users], 'Users retrieved successfully');
?>
