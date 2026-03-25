<?php
/**
 * Get Tasks API
 * Returns tasks list as JSON
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
header('Content-Type: application/json');

$response = ['success' => false, 'tasks' => []];
try {
    $query = "SELECT t.*, p.name AS project_name, u.full_name AS assigned_name
              FROM tasks t
              LEFT JOIN projects p ON t.project_id = p.id
              LEFT JOIN users u ON t.assigned_to = u.id
              ORDER BY t.created_at DESC";

    $result = $conn->query($query);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $task = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'project_id' => $row['project_id'],
                'project_name' => $row['project_name'],
                'assigned_to' => $row['assigned_to'],
                'assigned_name' => $row['assigned_name'],
                'priority' => $row['priority'],
                'status' => $row['status'],
                'due_date' => $row['due_date'],
                'estimated_hours' => $row['estimated_hours'],
                'created_at' => $row['created_at']
            ];
            $response['tasks'][] = $task;
        }
        $response['success'] = true;
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
if (isset($conn)) $conn->close();

?>
