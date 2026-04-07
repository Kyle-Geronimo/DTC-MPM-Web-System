<?php
/**
 * Mark Notification Read API
 * Marks one or all notifications as read
 */

session_start();
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/db_connect.php');
require_once(__DIR__ . '/notification_manager.php');

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid method']);
    exit;
}

$userId = intval($_SESSION['user_id']);
$notificationId = isset($_POST['id']) ? intval($_POST['id']) : 0;
$markAll = isset($_POST['all']) && $_POST['all'] === '1';

try {
    $nm = get_notification_manager($conn);

    if ($markAll) {
        $nm->markAllRead($userId);
        echo json_encode(['success' => true, 'message' => 'All notifications marked as read']);
    } elseif ($notificationId > 0) {
        $nm->markRead($notificationId, $userId);
        echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Notification ID required']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error updating notification']);
}

$conn->close();
?>
