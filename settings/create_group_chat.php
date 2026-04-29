<?php
/**
 * Create Group Chat
 * Creates a new group chat when a team is created
 * Also called to create initial group chat for new teams
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
    
    $team_id = isset($_POST['team_id']) ? intval($_POST['team_id']) : 0;
    $team_name = isset($_POST['team_name']) ? trim($_POST['team_name']) : '';
    
    // Validate inputs
    if (!$team_id || !$team_name) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Team ID and name are required']);
        exit;
    }
    
    // Check if chat group already exists for this team
    $checkQuery = "SELECT id FROM chat_groups WHERE team_id = ?";
    $stmt = $conn->prepare($checkQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('i', $team_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Chat group already exists', 'exists' => true]);
        $stmt->close();
        exit;
    }
    $stmt->close();
    
    // Create group chat
    $groupName = $team_name . ' Group Chat';
    $description = 'Team group chat for ' . $team_name;
    
    $insertQuery = "INSERT INTO chat_groups (team_id, name, description) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($insertQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('iss', $team_id, $groupName, $description);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $group_id = $conn->insert_id;
    $stmt->close();
    
    // Get team members and add them to the chat group
    $membersQuery = "SELECT user_id FROM team_members WHERE team_id = ?";
    $stmt = $conn->prepare($membersQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('i', $team_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $stmt->close();
    
    // Add all team members to the chat group
    $addMemberQuery = "INSERT INTO chat_group_members (group_id, user_id) VALUES (?, ?)";
    $stmt = $conn->prepare($addMemberQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $memberCount = 0;
    while ($row = $result->fetch_assoc()) {
        $user_id = $row['user_id'];
        $stmt->bind_param('ii', $group_id, $user_id);
        
        if (!$stmt->execute()) {
            // Skip if member already exists in group
            if (strpos($stmt->error, 'Duplicate') === false) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }
        } else {
            $memberCount++;
        }
    }
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'message' => 'Chat group created successfully',
        'group_id' => $group_id,
        'member_count' => $memberCount
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error creating chat group: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
