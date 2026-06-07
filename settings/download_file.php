<?php
/**
 * Secure File Download Handler
 * Validates ownership/public flag, increments download counter,
 * then streams the file. Files are never served directly.
 */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    exit('Unauthorised.');
}

$id     = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$userId = (int) $_SESSION['user_id'];

if (!$id) {
    http_response_code(400);
    exit('Invalid file ID.');
}

$stmt = $conn->prepare(
    "SELECT original_name, file_path, file_type, file_size
     FROM storage_files
     WHERE id = ? AND (user_id = ? OR is_public = 1)"
);
$stmt->bind_param('ii', $id, $userId);
$stmt->execute();
$file = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$file) {
    http_response_code(404);
    exit('File not found.');
}

// Resolve physical path and prevent directory traversal
$realBase = realpath(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads');
$fullPath = realpath(dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $file['file_path']));

if ($fullPath === false || $realBase === false || strpos($fullPath, $realBase) !== 0 || !is_file($fullPath)) {
    http_response_code(404);
    exit('File missing on disk.');
}

// Increment download counter (skip for inline preview so count stays accurate)
$inline = isset($_GET['inline']) && $_GET['inline'] === '1';
if (!$inline) {
    $upd = $conn->prepare("UPDATE storage_files SET download_count = download_count + 1 WHERE id = ?");
    $upd->bind_param('i', $id);
    $upd->execute();
    $upd->close();
}
$conn->close();

// Stream file to browser
$safeFilename = rawurlencode($file['original_name']);
$disposition  = $inline ? 'inline' : 'attachment';
header('Content-Type: '        . $file['file_type']);
header('Content-Disposition: ' . $disposition . '; filename="' . $file['original_name'] . '"; filename*=UTF-8\'\'' . $safeFilename);
header('Content-Length: '      . $file['file_size']);
header('Cache-Control: private, no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

while (ob_get_level()) ob_end_clean();
readfile($fullPath);
exit;
