<?php
/**
 * Send Message
 * Sends a message to a specific chat group
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
    
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }
    
    $user_id = $_SESSION['user_id'];
    $group_id = isset($_POST['group_id']) ? intval($_POST['group_id']) : 0;
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    
    // Validate inputs
    if (!$group_id || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Group ID and message are required']);
        exit;
    }
    
    // Limit message length
    if (strlen($message) > 2000) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Message is too long (max 2000 characters)']);
        exit;
    }
    
    // Check if user has access to this group
    $accessQuery = "SELECT id FROM chat_group_members WHERE group_id = ? AND user_id = ?";
    $stmt = $conn->prepare($accessQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('ii', $group_id, $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $stmt->close();
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    $stmt->close();
    
    // Insert message
    $insertQuery = "
        INSERT INTO chat_messages (group_id, user_id, message)
        VALUES (?, ?, ?)
    ";
    
    $stmt = $conn->prepare($insertQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('iis', $group_id, $user_id, $message);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $message_id = $conn->insert_id;
    
    // Mark message as read by sender
    $markReadQuery = "
        INSERT INTO message_read_status (message_id, user_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
    ";
    
    $stmt = $conn->prepare($markReadQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('ii', $message_id, $user_id);
    $stmt->execute();
    $stmt->close();
    
    // Update group's updated_at timestamp
    $updateGroupQuery = "UPDATE chat_groups SET updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $conn->prepare($updateGroupQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('i', $group_id);
    $stmt->execute();
    $stmt->close();
    
    // Get user info for response
    $userQuery = "SELECT username, full_name, avatar_url FROM users WHERE id = ?";
    $stmt = $conn->prepare($userQuery);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('i', $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully',
        'message_id' => $message_id,
        'user' => [
            'id' => $user_id,
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'avatar_url' => $user['avatar_url']
        ],
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error sending message: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
