<?php
/**
 * Send Direct Message
 * Sends a one-to-one message between users (not group chat)
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/session_manager.php';

header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    $sender_id = $_SESSION['user_id'];
    $receiver_id = isset($_POST['receiver_id']) ? intval($_POST['receiver_id']) : 0;
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if (!$receiver_id || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Receiver and message are required']);
        exit;
    }

    if ($receiver_id === $sender_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cannot send a direct message to yourself']);
        exit;
    }

    if (strlen($message) > 2000) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Message is too long (max 2000 characters)']);
        exit;
    }

    // Ensure table exists
    ensureDirectMessagesTable($conn);

    $stmt = $conn->prepare("INSERT INTO direct_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)");
    if (!$stmt) throw new Exception('Prepare failed: ' . $conn->error);
    $stmt->bind_param('iis', $sender_id, $receiver_id, $message);
    if (!$stmt->execute()) throw new Exception('Execute failed: ' . $stmt->error);

    $message_id = $conn->insert_id;
    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => 'Message sent',
        'message_id' => $message_id,
        'created_at' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error sending direct message: ' . $e->getMessage()]);
}

$conn->close();
?>
