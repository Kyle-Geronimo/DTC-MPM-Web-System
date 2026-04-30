<?php
/**
 * Get Notifications API
 * Returns notifications for the current user
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

$userId = intval($_SESSION['user_id']);
$unreadOnly = isset($_GET['unread']) && $_GET['unread'] === '1';
$limit = isset($_GET['limit']) ? min(intval($_GET['limit']), 50) : 20;

try {
    $nm = get_notification_manager($conn);
    $notifications = $nm->getForUser($userId, $limit, $unreadOnly);
    $unreadCount = $nm->getUnreadCount($userId);

    echo json_encode([
        'success' => true,
        'unread_count' => $unreadCount,
        'notifications' => $notifications
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error loading notifications']);
}

$conn->close();
?>
