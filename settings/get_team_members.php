<?php
/**
 * Get Team Members API
 * Returns users with their team associations
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
header('Content-Type: application/json');

$response = ['success' => false, 'members' => []];
try {
    $query = "SELECT u.id, u.full_name, u.email, u.role AS user_role, t.id AS team_id, t.name AS team_name
              FROM users u
              LEFT JOIN team_members tm ON tm.user_id = u.id
              LEFT JOIN teams t ON tm.team_id = t.id
              ORDER BY u.created_at DESC";
    $result = $conn->query($query);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $response['members'][] = $row;
        }
        $response['success'] = true;
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
if (isset($conn)) $conn->close();

?>
