<?php
/**
 * Get Storage Files API
 * Returns files the current user can access (own + public),
 * with optional category and keyword filters.
 */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

$userId   = (int) $_SESSION['user_id'];
$category = trim($_GET['category']  ?? '');
$search   = trim($_GET['search']    ?? '');
$folderId = $_GET['folder_id'] ?? '';
// 'root' = files with no folder; a number = specific folder; '' = all files

$sql    = "SELECT id, folder_id, user_id, original_name, file_type, file_size,
                  category, description, is_public, download_count, uploaded_at
           FROM storage_files
           WHERE (user_id = ? OR is_public = 1)";
$types  = 'i';
$params = [$userId];

if ($folderId === 'root') {
    $sql .= " AND folder_id IS NULL";
} elseif ($folderId !== '' && ctype_digit((string)$folderId)) {
    $fid = (int)$folderId;
    $sql .= " AND folder_id = ?";
    $types  .= 'i';
    $params[] = $fid;
}

if ($category !== '') {
    $sql    .= " AND category = ?";
    $types  .= 's';
    $params[] = $category;
}

if ($search !== '') {
    $like     = '%' . $conn->real_escape_string($search) . '%';
    $sql    .= " AND (original_name LIKE ? OR description LIKE ?)";
    $types  .= 'ss';
    $params[] = $like;
    $params[] = $like;
}

$sql .= " ORDER BY uploaded_at DESC LIMIT 200";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database prepare failed. Has the schema been imported? ' . $conn->error]);
    exit;
}
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$files = [];
while ($row = $result->fetch_assoc()) {
    $files[] = [
        'id'             => (int) $row['id'],
        'folder_id'      => $row['folder_id'] !== null ? (int)$row['folder_id'] : null,
        'user_id'        => (int) $row['user_id'],
        'original_name'  => $row['original_name'],
        'file_type'      => $row['file_type'],
        'file_size'      => (int) $row['file_size'],
        'category'       => $row['category'],
        'description'    => $row['description'],
        'is_public'      => (bool) $row['is_public'],
        'download_count' => (int) $row['download_count'],
        'uploaded_at'    => $row['uploaded_at'],
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'files' => $files, 'count' => count($files)]);
