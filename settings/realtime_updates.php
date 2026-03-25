<?php
/**
 * Real-Time Updates Endpoint (Polling)
 * Returns live data for dashboard elements.
 * Called via AJAX polling from the frontend.
 */

session_start();
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/db_connect.php');

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Check login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'session_expired' => true]);
    exit;
}

// Update last activity
$_SESSION['last_activity'] = time();

$section = isset($_GET['section']) ? $_GET['section'] : 'all';
$since = isset($_GET['since']) ? $_GET['since'] : null;

$response = ['success' => true, 'timestamp' => date('Y-m-d H:i:s')];

try {
    switch ($section) {
        case 'stats':
            $response['data'] = getStats($conn);
            break;
        case 'projects':
            $response['data'] = getActiveProjects($conn);
            break;
        case 'tasks':
            $response['data'] = getRecentTasks($conn);
            break;
        case 'activity':
            $response['data'] = getRecentActivity($conn, $since);
            break;
        case 'notifications':
            $userId = intval($_SESSION['user_id']);
            $response['data'] = getNotificationData($conn, $userId);
            break;
        case 'all':
        default:
            $userId = intval($_SESSION['user_id']);
            $response['data'] = [
                'stats' => getStats($conn),
                'projects' => getActiveProjects($conn),
                'recent_tasks' => getRecentTasks($conn),
                'activity' => getRecentActivity($conn, $since),
                'notifications' => getNotificationData($conn, $userId)
            ];
            break;
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['error'] = defined('DEBUG_MODE') && DEBUG_MODE ? $e->getMessage() : 'Server error';
}

echo json_encode($response);
$conn->close();

// ==========================================
// DATA FUNCTIONS
// ==========================================

function getStats($conn) {
    $stats = [];

    $r = $conn->query("SELECT COUNT(*) as c FROM projects WHERE status = 'active'");
    $stats['active_projects'] = $r->fetch_assoc()['c'];

    $r = $conn->query("SELECT COUNT(*) as c FROM tasks WHERE status = 'completed'");
    $stats['completed_tasks'] = $r->fetch_assoc()['c'];

    $r = $conn->query("SELECT COUNT(*) as c FROM tasks WHERE status IN ('pending','in-progress')");
    $stats['pending_tasks'] = $r->fetch_assoc()['c'];

    $r = $conn->query("SELECT COUNT(*) as c FROM users WHERE status = 'active'");
    $stats['team_members'] = $r->fetch_assoc()['c'];

    $r = $conn->query("SELECT COUNT(*) as c FROM tasks WHERE priority IN ('high','critical') AND status IN ('pending','in-progress')");
    $stats['open_issues'] = $r->fetch_assoc()['c'];

    $r = $conn->query("SELECT COUNT(*) as c FROM tasks WHERE priority = 'critical' AND status IN ('pending','in-progress')");
    $stats['critical_issues'] = $r->fetch_assoc()['c'];

    $weekAgo = date('Y-m-d H:i:s', strtotime('-7 days'));
    $stmt = $conn->prepare("SELECT COUNT(*) as c FROM projects WHERE created_at >= ?");
    $stmt->bind_param("s", $weekAgo);
    $stmt->execute();
    $stats['projects_this_week'] = $stmt->get_result()->fetch_assoc()['c'];
    $stmt->close();

    $today = date('Y-m-d');
    $stmt = $conn->prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'completed' AND DATE(created_at) = ?");
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $stats['tasks_today'] = $stmt->get_result()->fetch_assoc()['c'];
    $stmt->close();

    return $stats;
}

function getActiveProjects($conn) {
    $result = $conn->query(
        "SELECT id, name, progress, status FROM projects WHERE status = 'active' ORDER BY created_at DESC LIMIT 10"
    );
    $projects = [];
    while ($row = $result->fetch_assoc()) {
        $projects[] = $row;
    }
    return $projects;
}

function getRecentTasks($conn) {
    $result = $conn->query(
        "SELECT t.id, t.title, t.status, t.priority, t.due_date, u.full_name as assigned_name
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id
         ORDER BY t.created_at DESC
         LIMIT 10"
    );
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    return $tasks;
}

function getRecentActivity($conn, $since = null) {
    if ($since) {
        $stmt = $conn->prepare(
            "SELECT al.*, u.full_name as user_name
             FROM activity_log al
             LEFT JOIN users u ON al.user_id = u.id
             WHERE al.created_at > ?
             ORDER BY al.created_at DESC
             LIMIT 20"
        );
        $stmt->bind_param("s", $since);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query(
            "SELECT al.*, u.full_name as user_name
             FROM activity_log al
             LEFT JOIN users u ON al.user_id = u.id
             ORDER BY al.created_at DESC
             LIMIT 10"
        );
    }

    $activities = [];
    while ($row = $result->fetch_assoc()) {
        $row['time_ago'] = timeAgo($row['created_at']);
        $activities[] = $row;
    }
    if (isset($stmt)) $stmt->close();
    return $activities;
}

function getNotificationData($conn, $userId) {
    // Check if notifications table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'notifications'");
    if ($tableCheck->num_rows === 0) {
        return ['unread_count' => 0, 'items' => []];
    }

    $stmt = $conn->prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $unread = $stmt->get_result()->fetch_assoc()['c'];
    $stmt->close();

    $stmt = $conn->prepare(
        "SELECT id, type, title, message, link, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $row['time_ago'] = timeAgo($row['created_at']);
        $items[] = $row;
    }
    $stmt->close();

    return ['unread_count' => intval($unread), 'items' => $items];
}

function timeAgo($datetime) {
    $diff = time() - strtotime($datetime);
    if ($diff < 60) return 'Just now';
    if ($diff < 3600) return floor($diff / 60) . 'm ago';
    if ($diff < 86400) return floor($diff / 3600) . 'h ago';
    if ($diff < 604800) return floor($diff / 86400) . 'd ago';
    return date('M j', strtotime($datetime));
}
?>
