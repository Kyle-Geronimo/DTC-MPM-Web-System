<?php
/**
 * Get Team Group Chat
 * Retrieves the group chat for a team and checks if user has access
 * Returns group chat ID and permission status
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_manager.php';

header('Content-Type: application/json');

try {
    // Check session
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $user_id = $_SESSION['user_id'];
    $team_id = isset($_GET['team_id']) ? intval($_GET['team_id']) : null;
    
    if (!$team_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Team ID is required']);
        exit;
    }
    
    // Get current user's role
    $userRoleQuery = "SELECT role FROM users WHERE id = ?";
    $userRoleStmt = $conn->prepare($userRoleQuery);
    if (!$userRoleStmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $userRoleStmt->bind_param('i', $user_id);
    if (!$userRoleStmt->execute()) {
        throw new Exception('Execute failed: ' . $userRoleStmt->error);
    }
    $userRoleResult = $userRoleStmt->get_result();
    $userRow = $userRoleResult->fetch_assoc();
    $userRoleStmt->close();
    
    if (!$userRow) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    $userRole = isset($userRow['role']) ? strtolower($userRow['role']) : '';
    $isAdmin = ($userRole === 'admin' || $userRole === 'administrator');
    
    // Check if user is a member of the team
    $membershipQuery = "SELECT id FROM team_members WHERE team_id = ? AND user_id = ?";
    $membershipStmt = $conn->prepare($membershipQuery);
    if (!$membershipStmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $membershipStmt->bind_param('ii', $team_id, $user_id);
    if (!$membershipStmt->execute()) {
        throw new Exception('Execute failed: ' . $membershipStmt->error);
    }
    $membershipResult = $membershipStmt->get_result();
    $isMember = $membershipResult->num_rows > 0;
    $membershipStmt->close();
    
    // Check if user is the team lead
    $isLead = false;
    try {
        $leadStmt = $conn->prepare("SELECT team_lead FROM teams WHERE id = ? LIMIT 1");
        if ($leadStmt) {
            $leadStmt->bind_param('i', $team_id);
            $leadStmt->execute();
            $leadRes = $leadStmt->get_result();
            if ($leadRow = $leadRes->fetch_assoc()) {
                $isLead = intval($leadRow['team_lead']) === intval($user_id);
            }
            $leadStmt->close();
        }
    } catch (Exception $e) {
        // ignore
    }

    // Check if user has access (admin OR team member OR team lead)
    $hasAccess = $isAdmin || $isMember || $isLead;
    
    // Get the group chat ID for this team
    $groupChatQuery = "SELECT id, name FROM chat_groups WHERE team_id = ?";
    $groupChatStmt = $conn->prepare($groupChatQuery);
    if (!$groupChatStmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $groupChatStmt->bind_param('i', $team_id);
    if (!$groupChatStmt->execute()) {
        throw new Exception('Execute failed: ' . $groupChatStmt->error);
    }
    $groupChatResult = $groupChatStmt->get_result();
    $groupChatRow = $groupChatResult->fetch_assoc();
    $groupChatStmt->close();
    
    if (!$groupChatRow) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Group chat not found for this team']);
        exit;
    }
    
    $groupChatId = $groupChatRow['id'];
    $groupChatName = $groupChatRow['name'];
    
    // If user doesn't have access, return denied response
    if (!$hasAccess) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'You do not have access to this team\'s group chat',
            'access_denied' => true,
            'group_id' => $groupChatId
        ]);
        exit;
    }
    
    // If user has access but is not a member of the group chat, add them
    if ($hasAccess) {
        $checkMembershipQuery = "SELECT id FROM chat_group_members WHERE group_id = ? AND user_id = ?";
        $checkMembershipStmt = $conn->prepare($checkMembershipQuery);
        if (!$checkMembershipStmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $checkMembershipStmt->bind_param('ii', $groupChatId, $user_id);
        if (!$checkMembershipStmt->execute()) {
            throw new Exception('Execute failed: ' . $checkMembershipStmt->error);
        }
        $checkMembershipResult = $checkMembershipStmt->get_result();
        $isGroupMember = $checkMembershipResult->num_rows > 0;
        $checkMembershipStmt->close();
        
        // If not already a member of the group chat, add them
        if (!$isGroupMember) {
            $addMemberQuery = "INSERT INTO chat_group_members (group_id, user_id) VALUES (?, ?)";
            $addMemberStmt = $conn->prepare($addMemberQuery);
            if (!$addMemberStmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $addMemberStmt->bind_param('ii', $groupChatId, $user_id);
            if (!$addMemberStmt->execute()) {
                throw new Exception('Execute failed: ' . $addMemberStmt->error);
            }
            $addMemberStmt->close();
        }
    }
    
    echo json_encode([
        'success' => true,
        'group_id' => $groupChatId,
        'group_name' => $groupChatName,
        'has_access' => $hasAccess,
        'is_admin' => $isAdmin,
        'is_member' => $isMember
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching group chat: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
