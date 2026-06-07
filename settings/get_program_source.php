<?php
/**
 * Get Program Source Code for execution (script runtimes only).
 * Also increments run_count.
 */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

$id     = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$userId = (int) $_SESSION['user_id'];

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Invalid program ID.']);
    exit;
}

$stmt = $conn->prepare(
    "SELECT id, name, runtime, source_code, version, is_public
     FROM emulator_programs
     WHERE id = ? AND (user_id = ? OR is_public = 1)"
);
$stmt->bind_param('ii', $id, $userId);
$stmt->execute();
$prog = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$prog) {
    echo json_encode(['success' => false, 'message' => 'Program not found.']);
    exit;
}

if ($prog['runtime'] === 'x86_disk_image') {
    echo json_encode(['success' => false, 'message' => 'Use get_disk_image.php for binary programs.']);
    exit;
}

// Increment run_count
$upd = $conn->prepare("UPDATE emulator_programs SET run_count = run_count + 1 WHERE id = ?");
$upd->bind_param('i', $id);
$upd->execute();
$upd->close();
$conn->close();

echo json_encode([
    'success'     => true,
    'id'          => (int) $prog['id'],
    'name'        => $prog['name'],
    'runtime'     => $prog['runtime'],
    'source_code' => $prog['source_code'],
    'version'     => $prog['version'],
    'is_public'   => (bool) $prog['is_public'],
]);
