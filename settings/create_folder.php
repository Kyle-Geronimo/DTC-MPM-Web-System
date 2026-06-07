<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');
header('Content-Type: application/json');
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

$body = json_decode(file_get_contents('php://input'), true);
$name        = trim($body['name']        ?? '');
$description = trim($body['description'] ?? '');
$isPublic    = !empty($body['is_public']) ? 1 : 0;
$userId      = (int) $_SESSION['user_id'];

if ($name === '') {
    echo json_encode(['success' => false, 'message' => 'Folder name is required.']);
    exit;
}
if (mb_strlen($name) > 255) {
    echo json_encode(['success' => false, 'message' => 'Folder name too long.']);
    exit;
}

$stmt = $conn->prepare(
    "INSERT INTO storage_folders (user_id, name, description, is_public) VALUES (?, ?, ?, ?)"
);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'DB error: ' . $conn->error]);
    exit;
}
$stmt->bind_param('issi', $userId, $name, $description, $isPublic);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to create folder: ' . $stmt->error]);
    $stmt->close(); exit;
}
$newId = $conn->insert_id;
$stmt->close();
$conn->close();
echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Folder created.']);
