<?php
/**
 * Dashboard Statistics API
 * Returns real-time statistics from database
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');

// Set JSON header
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Initialize response
$stats = [
    'success' => true,
    'data' => []
];

try {
    // Get Active Projects count
    $result = $conn->query("SELECT COUNT(*) as count FROM projects WHERE status = 'active'");
    $row = $result->fetch_assoc();
    $stats['data']['active_projects'] = $row['count'];
    
    // Get total projects this week (created in last 7 days)
    $weekAgo = date('Y-m-d H:i:s', strtotime('-7 days'));
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM projects WHERE created_at >= ?");
    $stmt->bind_param("s", $weekAgo);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stats['data']['projects_this_week'] = $row['count'];
    $stmt->close();
    
    // Get Completed Tasks count
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
    $row = $result->fetch_assoc();
    $stats['data']['completed_tasks'] = $row['count'];
    
    // Get tasks completed today
    $today = date('Y-m-d');
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed' AND DATE(created_at) = ?");
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stats['data']['tasks_today'] = $row['count'];
    $stmt->close();
    
    // Get Team Members count
    $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
    $row = $result->fetch_assoc();
    $stats['data']['team_members'] = $row['count'];
    
    // Get online users (logged in within last hour)
    $hourAgo = date('Y-m-d H:i:s', strtotime('-1 hour'));
    // Use user_sessions table if available, otherwise fallback
    $tableCheck = $conn->query("SHOW TABLES LIKE 'user_sessions'");
    if ($tableCheck && $tableCheck->num_rows > 0) {
        $stmt = $conn->prepare("SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE last_activity >= ?");
        $stmt->bind_param("s", $hourAgo);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stats['data']['users_online'] = $row['count'];
        $stmt->close();
    } else {
        $stats['data']['users_online'] = 0;
    }
    
    // Get Open Issues (tasks with high/critical priority that are pending/in-progress)
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks WHERE priority IN ('high', 'critical') AND status IN ('pending', 'in-progress')");
    $row = $result->fetch_assoc();
    $stats['data']['open_issues'] = $row['count'];
    
    // Get critical issues
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks WHERE priority = 'critical' AND status IN ('pending', 'in-progress')");
    $row = $result->fetch_assoc();
    $stats['data']['critical_issues'] = $row['count'];
    
    // Get project progress data for charts
    $result = $conn->query("SELECT id, name, progress FROM projects WHERE status = 'active' ORDER BY created_at DESC LIMIT 5");
    $projects = [];
    while ($row = $result->fetch_assoc()) {
        $projects[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'progress' => intval($row['progress'])
        ];
    }
    $stats['data']['active_projects_list'] = $projects;
    
} catch (Exception $e) {
    $stats['success'] = false;
    $stats['error'] = $e->getMessage();
}

echo json_encode($stats);
$conn->close();
?>
