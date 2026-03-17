<?php
/**
 * Get Teams API
 * Returns list of teams as JSON
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
header('Content-Type: application/json');

$response = ['success' => false, 'teams' => []];
try {
    $query = "SELECT id, name, description, created_at, updated_at FROM teams ORDER BY created_at DESC";
    $result = $conn->query($query);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $response['teams'][] = $row;
        }
        $response['success'] = true;
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
if (isset($conn)) $conn->close();

?>
