<?php
/**
 * Get Single Project API
 * Returns project details by id
 */

session_start();

require_once('config.php');
require_once('db_connect.php');

header('Content-Type: application/json');

$response = ['success' => false, 'project' => null];

try {
    // allow lookup by id OR name
    if (empty($_GET['id']) && empty($_GET['name'])) {
        throw new Exception('Missing project id or name');
    }

    if (!empty($_GET['id'])) {
        $id = $_GET['id'];
        $stmt = $conn->prepare("SELECT * FROM projects WHERE id = ? LIMIT 1");
        $stmt->bind_param('s', $id);
    } else {
        $name = $_GET['name'];
        $stmt = $conn->prepare("SELECT * FROM projects WHERE name = ? LIMIT 1");
        $stmt->bind_param('s', $name);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $row = $result->fetch_assoc()) {
        $start_date = is_numeric($row['start_date']) ? date('M d, Y', $row['start_date']) : $row['start_date'];
        $end_date = is_numeric($row['end_date']) ? date('M d, Y', $row['end_date']) : $row['end_date'];

        $project = [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'status' => $row['status'],
            'start_date' => $start_date,
            'end_date' => $end_date,
            'progress' => intval($row['progress']),
            'budget' => $row['budget'],
            'spent' => $row['spent'],
            'team_id' => $row['team_id'],
            'created_by' => $row['created_by'],
            'created_at' => $row['created_at']
        ];

        $response['success'] = true;
        $response['project'] = $project;
    } else {
        throw new Exception('Project not found');
    }

    $stmt->close();
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
