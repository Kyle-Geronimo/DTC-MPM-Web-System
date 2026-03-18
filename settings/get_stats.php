<?php
/**
 * Dashboard Statistics API
 * Returns real-time statistics from database matching your schema
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');

/** @var mysqli $conn */

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
    $result = $conn->query("SELECT COUNT(*) as count FROM projects WHERE status = 'active' AND id IS NOT NULL");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['active_projects'] = $row['count'] ?? 0;
    } else {
        $stats['data']['active_projects'] = 0;
        error_log("Query error in get_stats.php (active_projects): " . $conn->error);
    }
    
    // Get total projects created (all projects for this week concept)
    $result = $conn->query("SELECT COUNT(*) as count FROM projects WHERE id IS NOT NULL");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['projects_this_week'] = $row['count'] ?? 0;
    } else {
        $stats['data']['projects_this_week'] = 0;
        error_log("Query error in get_stats.php (projects_this_week): " . $conn->error);
    }
    
    // Get Completed Tasks count
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed' AND id IS NOT NULL");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['completed_tasks'] = $row['count'] ?? 0;
    } else {
        $stats['data']['completed_tasks'] = 0;
        error_log("Query error in get_stats.php (completed_tasks): " . $conn->error);
    }
    
    // Get all tasks (general overview)
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks WHERE id IS NOT NULL");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['tasks_today'] = $row['count'] ?? 0;
    } else {
        $stats['data']['tasks_today'] = 0;
        error_log("Query error in get_stats.php (tasks_today): " . $conn->error);
    }
    
    // Get Team Members count (active users)
    $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['team_members'] = $row['count'] ?? 0;
    } else {
        $stats['data']['team_members'] = 0;
        error_log("Query error in get_stats.php (team_members): " . $conn->error);
    }
    
    // Get online users (users with recent sessions)
    $result = $conn->query("SELECT COUNT(DISTINCT user_id) as count FROM user_sessions");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['users_online'] = $row['count'] ?? 0;
    } else {
        $stats['data']['users_online'] = 0;
        error_log("Query error in get_stats.php (users_online): " . $conn->error);
    }
    
    // Get Open Issues (tasks with high/critical priority that are not completed)
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks WHERE priority IN ('high', 'critical') AND status IN ('todo', 'in-progress') AND id IS NOT NULL");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['open_issues'] = $row['count'] ?? 0;
    } else {
        $stats['data']['open_issues'] = 0;
        error_log("Query error in get_stats.php (open_issues): " . $conn->error);
    }
    
    // Get critical issues
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks WHERE priority = 'critical' AND status IN ('todo', 'in-progress') AND id IS NOT NULL");
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['data']['critical_issues'] = $row['count'] ?? 0;
    } else {
        $stats['data']['critical_issues'] = 0;
        error_log("Query error in get_stats.php (critical_issues): " . $conn->error);
    }
    
    // Get project progress data for charts (top 5 by progress)
    $result = $conn->query("SELECT id, name, progress FROM projects WHERE id IS NOT NULL ORDER BY progress DESC LIMIT 5");
    $projects = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $projects[] = [
                'id' => $row['id'],
                'name' => $row['name'] ?? 'Untitled Project',
                'progress' => intval($row['progress'] ?? 0)
            ];
        }
    } else {
        error_log("Query error in get_stats.php (active_projects_list): " . $conn->error);
    }
    $stats['data']['active_projects_list'] = $projects;

    // Get recent activities
    $result = $conn->query("SELECT description, created_at FROM activity_log ORDER BY created_at DESC LIMIT 10");
    $activities = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $activities[] = [
                'action' => $row['description'] ?? 'Activity',
                'timestamp' => $row['created_at']
            ];
        }
    } else {
        error_log("Query error in get_stats.php (activities): " . $conn->error);
    }
    $stats['data']['recent_activities'] = $activities;

    
} catch (Exception $e) {
    $stats['success'] = false;
    $stats['error'] = $e->getMessage();
    error_log("Exception in get_stats.php: " . $e->getMessage());
}

echo json_encode($stats);
$conn->close();
?>
