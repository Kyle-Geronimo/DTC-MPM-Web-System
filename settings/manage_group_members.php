<?php
/**
 * Manage Group Members
 * Adds or removes users from a chat group
 * Called when team members are added or removed
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_manager.php';

header('Content-Type: application/json');

try {
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }
    
    $action = isset($_POST['action']) ? trim($_POST['action']) : '';
    $group_id = isset($_POST['group_id']) ? intval($_POST['group_id']) : 0;
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    
    // Validate inputs
    if (!in_array($action, ['add', 'remove']) || !$group_id || !$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
        exit;
    }

    // Authorization: only admins or team leads can add/remove members
    $current_user_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;
    if (!$current_user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit;
    }

    // Check if current user is admin
    $is_admin = false;
    $stmt_role = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt_role->bind_param('i', $current_user_id);
    $stmt_role->execute();
    $role_result = $stmt_role->get_result();
    if ($role_row = $role_result->fetch_assoc()) {
        $is_admin = ($role_row['role'] === 'admin');
    }
    $stmt_role->close();

    // Check if current user is team lead for this team
    $is_lead = false;
    $stmt_lead = $conn->prepare("SELECT id FROM teams WHERE id = ? AND team_lead = ?");
    $stmt_lead->bind_param('ii', $group_id, $current_user_id);
    $stmt_lead->execute();
    if ($stmt_lead->get_result()->num_rows > 0) {
        $is_lead = true;
    }
    $stmt_lead->close();

    if (!$is_admin && !$is_lead) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only admins or team leaders can manage members']);
        exit;
    }
    
    if ($action === 'add') {
        // Add user to group
        $query = "
            INSERT INTO chat_group_members (group_id, user_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE joined_at = CURRENT_TIMESTAMP
        ";
        
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('ii', $group_id, $user_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'User added to group successfully'
        ]);
        
    } elseif ($action === 'remove') {
        // Remove user from group
        $query = "
            DELETE FROM chat_group_members
            WHERE group_id = ? AND user_id = ?
        ";
        
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('ii', $group_id, $user_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'User removed from group successfully'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error managing group members: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
