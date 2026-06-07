<?php
/**
 * Stream a binary x86 disk image stored in emulator_programs.binary_data.
 * Also increments run_count.
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
    exit('Invalid program ID.');
}

$stmt = $conn->prepare(
    "SELECT id, name, runtime, binary_data, binary_size
     FROM emulator_programs
     WHERE id = ? AND (user_id = ? OR is_public = 1)"
);
$stmt->bind_param('ii', $id, $userId);
$stmt->execute();
$prog = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$prog) {
    http_response_code(404);
    exit('Program not found.');
}

if ($prog['runtime'] !== 'x86_disk_image') {
    http_response_code(400);
    exit('This program is not a disk image.');
}

if (empty($prog['binary_data'])) {
    http_response_code(404);
    exit('No binary data stored.');
}

// Increment run_count
$upd = $conn->prepare("UPDATE emulator_programs SET run_count = run_count + 1 WHERE id = ?");
$upd->bind_param('i', $id);
$upd->execute();
$upd->close();
$conn->close();

while (ob_get_level()) ob_end_clean();

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . addslashes($prog['name']) . '.img"');
if ($prog['binary_size']) {
    header('Content-Length: ' . (int) $prog['binary_size']);
}
header('Cache-Control: no-store, no-cache');
header('X-Content-Type-Options: nosniff');

echo $prog['binary_data'];
exit;
