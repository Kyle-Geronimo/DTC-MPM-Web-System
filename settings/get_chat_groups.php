<?php
/**
 * Get Chat Groups
 * Retrieves all chat groups that the current user has access to
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
    
    // Get all chat groups for the user
    $query = "
        SELECT 
            cg.id,
            cg.team_id,
            cg.name,
            cg.description,
            t.name as team_name,
            cg.created_at,
            cg.updated_at,
            (SELECT COUNT(*) FROM chat_group_members WHERE group_id = cg.id) as member_count,
            (SELECT COUNT(*) FROM chat_messages WHERE group_id = cg.id AND created_at > IFNULL(
                (SELECT MAX(read_at) FROM message_read_status WHERE message_id IN 
                    (SELECT id FROM chat_messages WHERE group_id = cg.id) AND user_id = ?),
                DATE_SUB(NOW(), INTERVAL 30 DAY)
            )) as unread_count
        FROM chat_groups cg
        INNER JOIN chat_group_members cgm ON cg.id = cgm.group_id
        LEFT JOIN teams t ON cg.team_id = t.id
        WHERE cgm.user_id = ?
        ORDER BY cg.updated_at DESC
    ";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param('ii', $user_id, $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $groups = [];
    
    while ($row = $result->fetch_assoc()) {
        $groups[] = [
            'id' => (int)$row['id'],
            'team_id' => (int)$row['team_id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'team_name' => $row['team_name'],
            'member_count' => (int)$row['member_count'],
            'unread_count' => (int)$row['unread_count'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'groups' => $groups,
        'total' => count($groups)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching chat groups: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
