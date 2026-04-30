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
    
    // Get project due dates data (top 5 by due date)
    $result = $conn->query("SELECT id, name, start_date, end_date FROM projects WHERE id IS NOT NULL AND end_date IS NOT NULL AND start_date IS NOT NULL ORDER BY end_date ASC LIMIT 5");
    $projects = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $end_date = $row['end_date'];
            $start_date = $row['start_date'];
            if ($end_date && $start_date) {
                // Format the dates
                $end_date_obj = new DateTime($end_date);
                $start_date_obj = new DateTime($start_date);
                $today = new DateTime();
                
                $formatted_date = $end_date_obj->format('M d, Y');
                $days_until = $end_date_obj->diff($today)->days;
                $is_overdue = $end_date_obj < $today;
                
                // Calculate progress (0-100) based on timeline from start to due date
                $total_days = $start_date_obj->diff($end_date_obj)->days;
                $days_elapsed = $start_date_obj->diff($today)->days;
                
                if ($total_days > 0) {
                    $timeline_progress = min(100, max(0, ($days_elapsed / $total_days) * 100));
                } else {
                    $timeline_progress = 0;
                }
                
                $projects[] = [
                    'id' => $row['id'],
                    'name' => $row['name'] ?? 'Untitled Project',
                    'due_date' => $formatted_date,
                    'days_until' => $days_until,
                    'is_overdue' => $is_overdue,
                    'timeline_progress' => round($timeline_progress, 1)
                ];
            }
        }
    } else {
        error_log("Query error in get_stats.php (active_projects_list): " . $conn->error);
    }
    $stats['data']['active_projects_list'] = $projects;

    // Get recent activities (limit to 5 most recent)
    $result = $conn->query("SELECT description, created_at FROM activity_log ORDER BY created_at DESC LIMIT 5");
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
