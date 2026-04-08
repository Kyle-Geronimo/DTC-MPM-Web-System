<?php
/**
 * Get Messages
 * Retrieves messages from a specific chat group
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
    $group_id = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    
    // Validate inputs
    if (!$group_id || $limit <= 0 || $offset < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
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
    
    // Get messages from the group, ordered by newest first, then reverse for display
    $query = "
        SELECT 
            cm.id,
            cm.group_id,
            cm.user_id,
            cm.message,
            cm.created_at,
            u.username,
            u.full_name,
            u.avatar_url,
            (SELECT COUNT(*) FROM message_read_status WHERE message_id = cm.id AND user_id = ?) as is_read_by_user
        FROM chat_messages cm
        INNER JOIN users u ON cm.user_id = u.id
        WHERE cm.group_id = ?
        ORDER BY cm.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('iiii', $user_id, $group_id, $limit, $offset);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $messages = [];
    
    while ($row = $result->fetch_assoc()) {
        $messages[] = [
            'id' => (int)$row['id'],
            'group_id' => (int)$row['group_id'],
            'user_id' => (int)$row['user_id'],
            'username' => $row['username'],
            'full_name' => $row['full_name'],
            'avatar_url' => $row['avatar_url'],
            'message' => $row['message'],
            'created_at' => $row['created_at'],
            'is_read_by_user' => (int)$row['is_read_by_user'] > 0
        ];
    }
    
    // Reverse to get oldest first for display
    $messages = array_reverse($messages);
    
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'total' => count($messages)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching messages: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
