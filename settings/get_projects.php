<?php
/**
 * Get Projects API
 * Returns all projects from database
 */

session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');

// Set JSON header
header('Content-Type: application/json');

// Initialize response
$response = [
    'success' => true,
    'projects' => []
];

try {
    // Get all projects
    $query = "SELECT * FROM projects ORDER BY created_at DESC";
    $result = $conn->query($query);
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Convert timestamps to readable dates
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
            
            $response['projects'][] = $project;
        }
        $response['count'] = count($response['projects']);
    }
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
