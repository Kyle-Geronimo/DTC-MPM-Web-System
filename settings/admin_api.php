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

// Require admin role — check session AND verify role from database
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: please log in']);
    if (isset($conn) && $conn instanceof mysqli) $conn->close();
    exit;
}

// Verify role from database to prevent session spoofing
if (!isset($conn) || !$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}
$_adminCheckStmt = $conn->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
if (!$_adminCheckStmt) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    $conn->close();
    exit;
}
$_adminCheckStmt->bind_param('i', $_SESSION['user_id']);
$_adminCheckStmt->execute();
$_adminCheckRes = $_adminCheckStmt->get_result();
$_adminRow = $_adminCheckRes->fetch_assoc();
$_adminCheckStmt->close();
if (!$_adminRow || $_adminRow['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Forbidden: admin access required']);
    if (isset($conn) && $conn instanceof mysqli) $conn->close();
    exit;
}

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
            
        case 'archive':
            $response = getArchivedUsers($conn);
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

        case 'delete_user':
            // Soft-delete a user (set status = 'deleted') -- admin only
            $userId = isset($_POST['id']) ? intval($_POST['id']) : 0;
            $response = deleteUserById($conn, $userId);
            break;
        case 'get_user_by_id':
            $uId = isset($_GET['id']) ? intval($_GET['id']) : 0;
            $response = getUserById($conn, $uId);
            break;
        case 'update_user':
            $uId = isset($_POST['id']) ? intval($_POST['id']) : 0;
            $response = updateUserById($conn, $uId);
            break;
        case 'get_project_by_id':
            $pId = isset($_GET['id']) ? trim($_GET['id']) : '';
            $response = getProjectById($conn, $pId);
            break;
        case 'update_project':
            $pId = isset($_POST['id']) ? intval($_POST['id']) : 0;
            $response = updateProjectById($conn, $pId);
            break;
        case 'delete_project':
            $pId = isset($_POST['id']) ? trim($_POST['id']) : '';
            $response = deleteProjectById($conn, $pId);
            break;
            
        default:
            $response['message'] = 'Invalid action';
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);
if (isset($conn) && $conn instanceof mysqli) $conn->close();

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
    
    // Recent activity (all activities)
    $recentActivity = array();
    $sql = "SELECT al.*, u.full_name as user_name 
            FROM activity_log al 
            LEFT JOIN users u ON al.user_id = u.id 
            ORDER BY al.created_at DESC";
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
            WHERE p.status != 'deleted'
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

function getArchivedUsers($conn) {
    $users = array();

    // Return users marked as inactive or non-active (archived)
    $sql = "SELECT id, username, email, full_name, phone, department, role, status, created_at, updated_at FROM users WHERE status != 'active' ORDER BY updated_at DESC";
    $result = $conn->query($sql);

    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    return array(
        'success' => true,
        'archived' => $users
    );
}

function getUserById($conn, $id) {
    if ($id <= 0) return array('success' => false, 'message' => 'Invalid user id');
    $stmt = $conn->prepare("SELECT id, username, email, full_name, phone, department, role, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1");
    if (!$stmt) return array('success' => false, 'message' => 'DB prepare error');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) { $stmt->close(); return array('success' => false, 'message' => 'User not found'); }
    $row = $res->fetch_assoc();
    $stmt->close();
    return array('success' => true, 'user' => $row);
}

function getProjectById($conn, $id) {
    if (empty($id)) return array('success' => false, 'message' => 'Invalid project id');
    $stmt = $conn->prepare("SELECT p.*, u.full_name as created_by_name FROM projects p LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ? LIMIT 1");
    if (!$stmt) return array('success' => false, 'message' => 'DB prepare error');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) { $stmt->close(); return array('success' => false, 'message' => 'Project not found'); }
    $row = $res->fetch_assoc();
    $stmt->close();
    return array('success' => true, 'project' => $row);
}

function deleteProjectById($conn, $projectId) {
    if (empty($projectId)) return array('success' => false, 'message' => 'Invalid project id');

    // Delete related tasks first (foreign key constraint)
    $delTasks = $conn->prepare("DELETE FROM tasks WHERE project_id = ?");
    if ($delTasks) {
        $delTasks->bind_param('s', $projectId);
        $delTasks->execute();
        $delTasks->close();
    }

    // Hard-delete the project from the database
    $stmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
    if (!$stmt) return array('success' => false, 'message' => 'DB prepare error: ' . $conn->error);
    $stmt->bind_param('s', $projectId);
    if ($stmt->execute()) {
        $affected = $stmt->affected_rows;
        $stmt->close();
        if ($affected === 0) {
            return array('success' => false, 'message' => 'Project not found');
        }
        // Log activity
        $act = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description) VALUES (?, 'delete', 'project', ?, 'Project permanently deleted by admin')");
        if ($act) {
            $adminId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;
            $act->bind_param('is', $adminId, $projectId);
            $act->execute();
            $act->close();
        }
        return array('success' => true, 'message' => 'Project deleted successfully');
    } else {
        $err = $stmt->error;
        $stmt->close();
        return array('success' => false, 'message' => 'Failed to delete project: ' . $err);
    }
}

function updateProjectById($conn, $projectId) {
    if ($projectId <= 0) return array('success' => false, 'message' => 'Invalid project id');

    // Collect fields from POST
    $name = isset($_POST['name']) ? trim($_POST['name']) : null;
    $description = isset($_POST['description']) ? trim($_POST['description']) : null;
    $status = isset($_POST['status']) ? trim($_POST['status']) : null;
    $start_date = isset($_POST['start_date']) && $_POST['start_date'] !== '' ? $_POST['start_date'] : null;
    $end_date = isset($_POST['end_date']) && $_POST['end_date'] !== '' ? $_POST['end_date'] : null;
    $progress = isset($_POST['progress']) ? intval($_POST['progress']) : null;

    $fields = [];
    $types = '';
    $values = [];

    if ($name !== null) { $fields[] = 'name = ?'; $types .= 's'; $values[] = $name; }
    if ($description !== null) { $fields[] = 'description = ?'; $types .= 's'; $values[] = $description; }
    if ($status !== null) { $fields[] = 'status = ?'; $types .= 's'; $values[] = $status; }
    if ($start_date !== null) { $fields[] = 'start_date = ?'; $types .= 's'; $values[] = $start_date; }
    if ($end_date !== null) { $fields[] = 'end_date = ?'; $types .= 's'; $values[] = $end_date; }
    if ($progress !== null) { $fields[] = 'progress = ?'; $types .= 'i'; $values[] = $progress; }

    if (count($fields) === 0) return array('success' => false, 'message' => 'No fields to update');

    $setSql = implode(', ', $fields);
    $sql = "UPDATE projects SET $setSql, updated_at = NOW() WHERE id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) return array('success' => false, 'message' => 'DB prepare error: ' . $conn->error);

    // bind params dynamically
    $types .= 'i';
    $values[] = $projectId;

    $bind_names[] = $types;
    for ($i=0;$i<count($values);$i++) {
        $bind_name = 'bind' . $i;
        $$bind_name = $values[$i];
        $bind_names[] = &$$bind_name;
    }

    call_user_func_array(array($stmt, 'bind_param'), $bind_names);

    if ($stmt->execute()) {
        $stmt->close();
        // log activity
        $act = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description) VALUES (?, 'update', 'project', ?, 'Project updated by admin')");
        if ($act) {
            $adminId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;
            $act->bind_param('ii', $adminId, $projectId);
            $act->execute();
            $act->close();
        }
        return array('success' => true, 'message' => 'Project updated');
    } else {
        $err = $stmt->error;
        $stmt->close();
        return array('success' => false, 'message' => 'Failed to update project: ' . $err);
    }
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

/**
 * Soft-delete a user by id. Marks the user's status as 'deleted' and logs activity.
 */
function deleteUserById($conn, $userId) {
    if ($userId <= 0) {
        return array('success' => false, 'message' => 'Invalid user id');
    }

    // Protect super-admin (id 1) from deletion as a safety measure
    if ($userId === 1) {
        return array('success' => false, 'message' => 'Cannot delete system administrator');
    }

    // Prevent admin deleting themselves
    $currentAdminId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;
    if ($currentAdminId === $userId) {
        return array('success' => false, 'message' => 'Cannot delete your own account');
    }

    // Capture user snapshot into archived_users before marking inactive
    $sel = $conn->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    if ($sel) {
        $sel->bind_param('i', $userId);
        $sel->execute();
        $res = $sel->get_result();
        $userRow = $res->fetch_assoc();
        $sel->close();

        if ($userRow) {
            $jsonData = json_encode($userRow);
            $arch = $conn->prepare("INSERT INTO archived_users (original_user_id, username, email, full_name, phone, department, role, status, data, archived_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            if ($arch) {
                $archivedBy = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;
                $arch->bind_param('issssssssi', $userId, $userRow['username'], $userRow['email'], $userRow['full_name'], $userRow['phone'], $userRow['department'], $userRow['role'], $userRow['status'], $jsonData, $archivedBy);
                $arch->execute();
                $arch->close();
            }
        }
    }

    // Mark user as inactive (soft delete — keeps the record in DB)
    $stmt = $conn->prepare("UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?");
    if (!$stmt) {
        return array('success' => false, 'message' => 'DB prepare error: ' . $conn->error);
    }
    $stmt->bind_param("i", $userId);
    if ($stmt->execute()) {
        $stmt->close();
        // Log the action
        $desc = 'User deactivated by admin';
        $act = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, description) VALUES (?, 'deactivate', 'user', ?)");
        if ($act) {
            $act->bind_param("is", $userId, $desc);
            $act->execute();
            $act->close();
        }
        return array('success' => true, 'message' => 'User deactivated and archived successfully');
    } else {
        $err = $stmt->error;
        $stmt->close();
        error_log('deleteUserById error: ' . $err);
        return array('success' => false, 'message' => 'Failed to deactivate user');
    }
}

/**
 * Update only the username for a given user id.
 */
function updateUserById($conn, $userId) {
    if ($userId <= 0) return array('success' => false, 'message' => 'Invalid user id');

    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $role = isset($_POST['role']) ? trim($_POST['role']) : '';
    if ($username === '') return array('success' => false, 'message' => 'Username cannot be empty');

    // Validate role if provided
    $allowedRoles = array('staff', 'intern', 'user');
    if ($role !== '' && !in_array($role, $allowedRoles)) {
        return array('success' => false, 'message' => 'Invalid role. Allowed: staff, intern');
    }

    // Check if username is already taken by another user
    $chk = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1");
    if (!$chk) return array('success' => false, 'message' => 'DB prepare error: ' . $conn->error);
    $chk->bind_param('si', $username, $userId);
    $chk->execute();
    $res = $chk->get_result();
    if ($res && $res->num_rows > 0) { $chk->close(); return array('success' => false, 'message' => 'Username already in use'); }
    $chk->close();

    // Update username, full_name, and optionally role
    if ($role !== '') {
        $stmt = $conn->prepare("UPDATE users SET username = ?, full_name = ?, role = ?, updated_at = NOW() WHERE id = ?");
        if (!$stmt) return array('success' => false, 'message' => 'DB prepare error: ' . $conn->error);
        $stmt->bind_param('sssi', $username, $username, $role, $userId);
    } else {
        $stmt = $conn->prepare("UPDATE users SET username = ?, full_name = ?, updated_at = NOW() WHERE id = ?");
        if (!$stmt) return array('success' => false, 'message' => 'DB prepare error: ' . $conn->error);
        $stmt->bind_param('ssi', $username, $username, $userId);
    }
    if ($stmt->execute()) {
        $stmt->close();
        // Log activity: admin changed username
        $adminId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;
        $desc = ($role !== '') ? 'Username and role updated by admin' : 'Username updated by admin';
        $act = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, description) VALUES (?, 'update', 'user', ?, ?)");
        if ($act) {
            $act->bind_param('iis', $adminId, $userId, $desc);
            $act->execute();
            $act->close();
        }
        return array('success' => true, 'message' => 'Username updated');
    } else {
        $err = $stmt->error;
        $stmt->close();
        return array('success' => false, 'message' => 'Failed to update username: ' . $err);
    }
}

// Intentionally omit closing PHP tag to avoid accidental trailing output
