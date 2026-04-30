<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');
header('Content-Type: application/json');
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

$userId = (int) $_SESSION['user_id'];

// Ensure every user has a personal folder. If missing, create one.
$ensure = $conn->prepare('SELECT id FROM storage_folders WHERE user_id = ? LIMIT 1');
if ($ensure) {
    $ensure->bind_param('i', $userId);
    $ensure->execute();
    $er = $ensure->get_result();
    if ($er && $er->num_rows === 0) {
        $ins = $conn->prepare('INSERT INTO storage_folders (user_id, name, description, is_public, created_at) VALUES (?, ?, ?, 0, NOW())');
        if ($ins) {
            $defaultName = 'My Files';
            $defaultDesc = 'Personal folder';
            $ins->bind_param('iss', $userId, $defaultName, $defaultDesc);
            $ins->execute();
            $ins->close();
        }
    }
    $ensure->close();
}

$stmt = $conn->prepare(
    "SELECT f.id, f.user_id, f.name, f.description, f.is_public, f.created_at,
            COUNT(sf.id) AS file_count
     FROM storage_folders f
     LEFT JOIN storage_files sf ON sf.folder_id = f.id AND (sf.user_id = ? OR sf.is_public = 1)
     WHERE (f.user_id = ? OR f.is_public = 1)
     GROUP BY f.id
     ORDER BY f.name ASC"
);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'DB error: ' . $conn->error]);
    exit;
}
$stmt->bind_param('ii', $userId, $userId);
$stmt->execute();
$result = $stmt->get_result();

$folders = [];
while ($row = $result->fetch_assoc()) {
    $folders[] = [
        'id'          => (int) $row['id'],
        'user_id'     => (int) $row['user_id'],
        'name'        => $row['name'],
        'description' => $row['description'],
        'is_public'   => (bool) $row['is_public'],
        'file_count'  => (int) $row['file_count'],
        'created_at'  => $row['created_at'],
    ];
}
$stmt->close();
$conn->close();
echo json_encode(['success' => true, 'folders' => $folders]);
