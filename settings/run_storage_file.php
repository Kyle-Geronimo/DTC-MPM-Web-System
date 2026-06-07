<?php
/**
 * Serves a storage file's content to the emulator.
 *
 * GET ?id=<storage_id>&mode=content  — returns JSON {success, name, runtime, content}
 * GET ?id=<storage_id>&mode=binary   — streams the file as octet-stream (disk images)
 *
 * Runtime is inferred from the file's original extension.
 */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Content-Type: application/json');
    respond_error('Please log in.', ERR_AUTH, 401);
}

$id     = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$mode   = $_GET['mode'] ?? 'content';
$userId = (int) $_SESSION['user_id'];

if (!$id) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid file ID.']);
    exit;
}

if (!in_array($mode, ['content', 'binary'], true)) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid mode.']);
    exit;
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
$conn->close();

if (!$file) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'File not found.']);
    exit;
}

// Infer emulator runtime from extension
$ext     = strtolower(pathinfo($file['original_name'], PATHINFO_EXTENSION));
$runtime = null;
if ($ext === 'py')                          $runtime = 'python';
elseif ($ext === 'js')                      $runtime = 'javascript';
elseif (in_array($ext, ['img','iso','bin'], true)) $runtime = 'x86_disk_image';

if ($runtime === null) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'This file type cannot be run in the emulator (.py, .js, .img, .iso, .bin only).']);
    exit;
}

// Resolve physical path and check for directory traversal
$realBase = realpath(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads');
$fullPath = realpath(dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $file['file_path']));

if ($fullPath === false || $realBase === false || strpos($fullPath, $realBase) !== 0 || !is_file($fullPath)) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'File not found on disk.']);
    exit;
}

// ── Mode: binary (disk images) ────────────────────────────────────────────
if ($mode === 'binary') {
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . addslashes($file['original_name']) . '"');
    header('Content-Length: ' . $file['file_size']);
    header('Cache-Control: no-store, no-cache');
    header('X-Content-Type-Options: nosniff');
    readfile($fullPath);
    exit;
}

// ── Mode: content (text scripts) ─────────────────────────────────────────
// Enforce a 2 MB safety limit for text files sent to the browser runtime
if ($file['file_size'] > 2 * 1024 * 1024) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'File is too large to load as a script (max 2 MB).']);
    exit;
}

$content = file_get_contents($fullPath);
if ($content === false) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Could not read file.']);
    exit;
}

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'name'    => $file['original_name'],
    'runtime' => $runtime,
    'content' => $content,
]);
