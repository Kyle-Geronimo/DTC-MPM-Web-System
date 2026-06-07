<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');
header('Content-Type: application/json');
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

$body   = json_decode(file_get_contents('php://input'), true);
$id     = (int) ($body['id'] ?? 0);
$userId = (int) $_SESSION['user_id'];

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Invalid folder ID.']);
    exit;
}

// Verify ownership — only the creator can delete
$check = $conn->prepare("SELECT id FROM storage_folders WHERE id = ? AND user_id = ?");
$check->bind_param('ii', $id, $userId);
$check->execute();
if (!$check->get_result()->fetch_assoc()) {
    $check->close();
    echo json_encode(['success' => false, 'message' => 'Folder not found or not yours.']);
    exit;
}
$check->close();

// Move files inside back to root (folder_id = NULL)
$unlink = $conn->prepare("UPDATE storage_files SET folder_id = NULL WHERE folder_id = ?");
$unlink->bind_param('i', $id);
$unlink->execute();
$unlink->close();

// Delete folder
$del = $conn->prepare("DELETE FROM storage_folders WHERE id = ? AND user_id = ?");
$del->bind_param('ii', $id, $userId);
if (!$del->execute()) {
    echo json_encode(['success' => false, 'message' => 'Delete failed: ' . $del->error]);
    $del->close(); exit;
}
$del->close();
$conn->close();
echo json_encode(['success' => true, 'message' => 'Folder deleted. Files moved to root.']);
