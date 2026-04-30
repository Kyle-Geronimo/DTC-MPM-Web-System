<?php
/**
 * Delete Storage File Handler
 * Removes the DB record and physical file. Owner-only.
 */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Method not allowed.', ERR_VALIDATION, 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$id   = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Invalid file ID.']);
    exit;
}

$userId = (int) $_SESSION['user_id'];

// Fetch record — owner only may delete
$stmt = $conn->prepare("SELECT file_path FROM storage_files WHERE id = ? AND user_id = ?");
$stmt->bind_param('ii', $id, $userId);
$stmt->execute();
$file = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$file) {
    echo json_encode(['success' => false, 'message' => 'File not found or access denied.']);
    exit;
}

// Resolve and validate physical path (prevent directory traversal)
$realBase = realpath(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads');
$fullPath = realpath(dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $file['file_path']));

if ($fullPath !== false && $realBase !== false && strpos($fullPath, $realBase) === 0 && is_file($fullPath)) {
    @unlink($fullPath);
}

$del = $conn->prepare("DELETE FROM storage_files WHERE id = ? AND user_id = ?");
$del->bind_param('ii', $id, $userId);
$del->execute();
$affected = $del->affected_rows;
$del->close();
$conn->close();

if ($affected > 0) {
    echo json_encode(['success' => true, 'message' => 'File deleted successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Could not delete the file record.']);
}
