<?php
/**
 * Get Direct Messages
 * Retrieves direct messages between the current user and another user
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_manager.php';

header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $other_id = isset($_GET['other_user_id']) ? intval($_GET['other_user_id']) : 0;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

    if (!$other_id || $limit <= 0 || $offset < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
        exit;
    }

    // Ensure table exists
    $create = "CREATE TABLE IF NOT EXISTS direct_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sender (sender_id),
        INDEX idx_receiver (receiver_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $conn->query($create);

    $query = "SELECT dm.id, dm.sender_id, dm.receiver_id, dm.message, dm.created_at, u.username, u.full_name
        FROM direct_messages dm
        LEFT JOIN users u ON u.id = dm.sender_id
        WHERE (dm.sender_id = ? AND dm.receiver_id = ?) OR (dm.sender_id = ? AND dm.receiver_id = ?)
        ORDER BY dm.created_at ASC
        LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($query);
    if (!$stmt) throw new Exception('Prepare failed: ' . $conn->error);
    $stmt->bind_param('iiiiii', $user_id, $other_id, $other_id, $user_id, $limit, $offset);
    if (!$stmt->execute()) throw new Exception('Execute failed: ' . $stmt->error);

    $res = $stmt->get_result();
    $messages = [];
    while ($row = $res->fetch_assoc()) {
        $messages[] = [
            'id' => (int)$row['id'],
            'sender_id' => (int)$row['sender_id'],
            'receiver_id' => (int)$row['receiver_id'],
            'username' => $row['username'],
            'full_name' => $row['full_name'],
            'message' => $row['message'],
            'created_at' => $row['created_at']
        ];
    }

    $stmt->close();

    echo json_encode(['success' => true, 'messages' => $messages, 'total' => count($messages)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error fetching direct messages: ' . $e->getMessage()]);
}

$conn->close();
?>
