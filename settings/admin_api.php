<?php
/**
 * Admin API
 * Provides data endpoints for admin dashboard
 */

session_start();

// Include configuration and database connection
require_once('config.php');
require_once('db_connect.php');

// Set header for JSON response
header('Content-Type: application/json');

// Check if user is logged in (optional: add admin role check)
// if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
//     echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
//     exit;
// }

// Get action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

$response = array('success' => false);

try {
    switch ($action) {
        case 'overview':
            $response = getOverviewStats($conn);
            break;
            
        case 'users':
            $response = getUsers($conn);
            break;
            
        case 'projects':
            $response = getProjects($conn);
            break;
            
        case 'activity':
            $response = getActivityLogs($conn);
            break;
            
        case 'database':
            $response = getDatabaseStats($conn);
            break;
            
        case 'password_resets':
            $response = getPasswordResets($conn);
            break;
            
        case 'approve_reset':
            $resetId = isset($_POST['id']) ? intval($_POST['id']) : 0;
            $response = approvePasswordReset($conn, $resetId);
            break;
            
        case 'reject_reset':
            $resetId = isset($_POST['id']) ? intval($_POST['id']) : 0;
            $response = rejectPasswordReset($conn, $resetId);
            break;
            
        default:
            $response['message'] = 'Invalid action';
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();

// Functions

function getOverviewStats($conn) {
    $stats = array();
    
    // Total users
    $result = $conn->query("SELECT COUNT(*) as count FROM users");
    $stats['total_users'] = $result->fetch_assoc()['count'];
    
    // Total projects
    $result = $conn->query("SELECT COUNT(*) as count FROM projects");
    $stats['total_projects'] = $result->fetch_assoc()['count'];
    
    // Total tasks
    $result = $conn->query("SELECT COUNT(*) as count FROM tasks");
    $stats['total_tasks'] = $result->fetch_assoc()['count'];
    
    // Active users today (users with activity today)
    $result = $conn->query("SELECT COUNT(DISTINCT user_id) as count FROM activity_log WHERE DATE(created_at) = CURDATE()");
    $stats['active_users'] = $result->fetch_assoc()['count'];
    
    // Recent activity (last 10)
    $recentActivity = array();
    $sql = "SELECT al.*, u.full_name as user_name 
            FROM activity_log al 
            LEFT JOIN users u ON al.user_id = u.id 
            ORDER BY al.created_at DESC 
            LIMIT 10";
    $result = $conn->query($sql);
    while ($row = $result->fetch_assoc()) {
        $recentActivity[] = $row;
    }
    
    return array(
        'success' => true,
        'stats' => $stats,
        'recent_activity' => $recentActivity
    );
}

function getUsers($conn) {
    $users = array();
    
    $sql = "SELECT id, username, email, full_name, phone, department, role, status, created_at, updated_at 
            FROM users 
            ORDER BY created_at DESC";
    
    $result = $conn->query($sql);
    
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    return array(
        'success' => true,
        'users' => $users
    );
}

function getProjects($conn) {
    $projects = array();
    
    $sql = "SELECT p.*, u.full_name as created_by_name 
            FROM projects p 
            LEFT JOIN users u ON p.created_by = u.id 
            ORDER BY p.created_at DESC";
    
    $result = $conn->query($sql);
    
    while ($row = $result->fetch_assoc()) {
        $projects[] = $row;
    }
    
    return array(
        'success' => true,
        'projects' => $projects
    );
}

function getActivityLogs($conn) {
    $activity = array();
    
    $sql = "SELECT al.*, u.full_name as user_name 
            FROM activity_log al 
            LEFT JOIN users u ON al.user_id = u.id 
            ORDER BY al.created_at DESC 
            LIMIT 100";
    
    $result = $conn->query($sql);
    
    while ($row = $result->fetch_assoc()) {
        $activity[] = $row;
    }
    
    return array(
        'success' => true,
        'activity' => $activity
    );
}

function getDatabaseStats($conn) {
    $stats = array();
    
    // Get total tables
    $result = $conn->query("SHOW TABLES");
    $stats['total_tables'] = $result->num_rows;
    
    // Get total records (sum of all table counts)
    $totalRecords = 0;
    $tables = array('users', 'projects', 'tasks', 'teams', 'team_members', 'activity_log', 'alerts', 'reports', 'settings');
    
    foreach ($tables as $table) {
        $result = $conn->query("SELECT COUNT(*) as count FROM $table");
        if ($result) {
            $totalRecords += $result->fetch_assoc()['count'];
        }
    }
    
    $stats['total_records'] = $totalRecords;
    
    return array(
        'success' => true,
        'stats' => $stats
    );
}

function getPasswordResets($conn) {
    $resets = array();
    
    $sql = "SELECT prt.*, u.full_name, u.email 
            FROM password_reset_tokens prt 
            LEFT JOIN users u ON prt.email = u.email 
            ORDER BY prt.created_at DESC 
            LIMIT 200";
    
    $result = $conn->query($sql);
    
    while ($row = $result->fetch_assoc()) {
        // Determine status
        $status = $row['approval_status'] ?: 'pending';
        if ($row['approval_status'] === 'approved' || $row['used_at']) {
            $status = 'approved';
        } elseif ($row['approval_status'] === 'rejected') {
            $status = 'rejected';
        } elseif (strtotime($row['expires_at']) < time()) {
            $status = 'expired';
        }
        $row['status'] = $status;
        
        $resets[] = $row;
    }
    
    return array(
        'success' => true,
        'resets' => $resets
    );
}

function approvePasswordReset($conn, $resetId) {
    if ($resetId <= 0) {
        return array('success' => false, 'message' => 'Invalid reset ID');
    }
    
    // Get the reset request details
    $stmt = $conn->prepare("SELECT email, new_password_hash, approval_status FROM password_reset_tokens WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $resetId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        return array('success' => false, 'message' => 'Reset request not found');
    }
    
    $reset = $result->fetch_assoc();
    $stmt->close();
    
    if ($reset['approval_status'] !== 'pending') {
        return array('success' => false, 'message' => 'This request has already been processed');
    }
    
    // Update user's password
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $updateStmt->bind_param("ss", $reset['new_password_hash'], $reset['email']);
    
    if ($updateStmt->execute()) {
        $updateStmt->close();
        
        // Update reset token status
        $statusStmt = $conn->prepare("UPDATE password_reset_tokens SET approval_status = 'approved', used = 1, used_at = NOW() WHERE id = ?");
        $statusStmt->bind_param("i", $resetId);
        $statusStmt->execute();
        $statusStmt->close();
        
        // Log activity
        $activityStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, description) SELECT id, 'password_reset', 'user', 'Password reset approved by admin' FROM users WHERE email = ? LIMIT 1");
        $activityStmt->bind_param("s", $reset['email']);
        $activityStmt->execute();
        $activityStmt->close();
        
        return array('success' => true, 'message' => 'Password reset approved successfully');
    } else {
        $updateStmt->close();
        return array('success' => false, 'message' => 'Failed to update password');
    }
}

function rejectPasswordReset($conn, $resetId) {
    if ($resetId <= 0) {
        return array('success' => false, 'message' => 'Invalid reset ID');
    }
    
    // Update reset token status
    $stmt = $conn->prepare("UPDATE password_reset_tokens SET approval_status = 'rejected' WHERE id = ? AND approval_status = 'pending'");
    $stmt->bind_param("i", $resetId);
    
    if ($stmt->execute() && $stmt->affected_rows > 0) {
        $stmt->close();
        return array('success' => true, 'message' => 'Password reset rejected');
    } else {
        $stmt->close();
        return array('success' => false, 'message' => 'Failed to reject request or request already processed');
    }
}
?>
