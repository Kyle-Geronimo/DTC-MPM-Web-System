<?php
/**
 * Get Emulator Programs List (metadata only — no source/binary)
 */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

$userId  = (int) $_SESSION['user_id'];
$runtime = $_GET['runtime'] ?? '';
$search  = trim($_GET['search'] ?? '');

$ALLOWED_RUNTIMES = ['python', 'javascript', 'x86_disk_image'];
if ($runtime !== '' && !in_array($runtime, $ALLOWED_RUNTIMES, true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid runtime filter.']);
    exit;
}

// Build query dynamically
$where   = ['(user_id = ? OR is_public = 1)'];
$types   = 'i';
$binds   = [$userId];

if ($runtime !== '') {
    $where[] = 'runtime = ?';
    $types   .= 's';
    $binds[] = $runtime;
}

if ($search !== '') {
    $where[] = '(name LIKE ? OR description LIKE ?)';
    $types   .= 'ss';
    $like     = '%' . $search . '%';
    $binds[] = $like;
    $binds[] = $like;
}

$sql  = 'SELECT id, user_id, name, description, runtime, version, is_public, run_count, created_at, updated_at'
      . ' FROM emulator_programs'
      . ' WHERE ' . implode(' AND ', $where)
      . ' ORDER BY updated_at DESC'
      . ' LIMIT 200';

$stmt = $conn->prepare($sql);
// Dynamic bind_param using splat
$stmt->bind_param($types, ...$binds);
$stmt->execute();
$result   = $stmt->get_result();
$programs = [];
while ($row = $result->fetch_assoc()) {
    $row['is_public'] = (bool) $row['is_public'];
    $row['run_count'] = (int) $row['run_count'];
    $programs[] = $row;
}
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'programs' => $programs]);
