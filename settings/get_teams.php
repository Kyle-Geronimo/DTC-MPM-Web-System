<?php
/**
 * Get Teams API
 * Returns list of teams as JSON
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($conn) || $conn === null) {
    respond_error('Database connection failed', ERR_DATABASE);
}

// Try query with team_lead (if column exists)
$query = "SELECT t.id, t.name, t.description, t.team_lead, u.full_name AS team_lead_name, t.created_at, t.updated_at 
          FROM teams t
          LEFT JOIN users u ON t.team_lead = u.id
          ORDER BY t.created_at DESC";
$result = $conn->query($query);

// If column doesn't exist, use fallback query
if (!$result) {
    error_log('Query with team_lead failed, trying fallback: ' . $conn->error);
    $query = "SELECT t.id, t.name, t.description, NULL as team_lead, NULL as team_lead_name, t.created_at, t.updated_at 
              FROM teams t
              ORDER BY t.created_at DESC";
    $result = $conn->query($query);
    
    if (!$result) {
        error_log('Fallback query also failed: ' . $conn->error);
        respond_error('Failed to retrieve teams: ' . $conn->error, ERR_DATABASE);
    }
}

$teams = [];
while ($row = $result->fetch_assoc()) {
    $teams[] = $row;
}

respond_success(['teams' => $teams], 'Teams retrieved successfully');
?>
