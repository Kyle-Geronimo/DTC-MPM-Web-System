<?php
/**
 * Create Alert API
 * POST parameters:
 * - user_id (optional): target user id; if omitted and 'broadcast'=1, will notify all users
 * - broadcast (optional): if 1, notify all users
 * - title: notification title
 * - message: notification message
 * - type: info|success|warning|error|task|project (optional)
 * - link: optional link
 */

if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('notification_manager.php');
header('Content-Type: application/json');

// Simple auth: require logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$type = isset($_POST['type']) ? trim($_POST['type']) : 'info';
$link = isset($_POST['link']) ? trim($_POST['link']) : '';
$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$broadcast = isset($_POST['broadcast']) && $_POST['broadcast'] == '1';

if (empty($title)) {
    echo json_encode(['success' => false, 'message' => 'Title is required']);
    exit;
}

$nm = get_notification_manager($conn);
$ok = false;
if ($broadcast) {
    $ok = $nm->notifyAll($title, $message, $type, $link);
} elseif ($user_id > 0) {
    $ok = $nm->notify($user_id, $title, $message, $type, $link);
} else {
    // default: notify current user
    $uid = intval($_SESSION['user_id']);
    $ok = $nm->notify($uid, $title, $message, $type, $link);
}

if ($ok) echo json_encode(['success' => true]);
else echo json_encode(['success' => false, 'message' => 'Failed to create notification']);

?>