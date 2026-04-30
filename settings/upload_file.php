<?php
/**
 * File Upload Handler
 * Validates and stores an uploaded file, then records its
 * metadata in the storage_files table.
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

// ── Configuration ──────────────────────────────────────────────
$uploadBaseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
$maxFileBytes  = 52428800; // 50 MB
$allowedMime   = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed', 'application/x-zip',
];

// ── Validate upload ────────────────────────────────────────────
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit.',
        UPLOAD_ERR_FORM_SIZE  => 'File exceeds form upload limit.',
        UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded.',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION  => 'Upload blocked by a server extension.',
    ];
    $code = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
    echo json_encode(['success' => false, 'message' => $uploadErrors[$code] ?? 'Unknown upload error.']);
    exit;
}

$file = $_FILES['file'];

if ($file['size'] > $maxFileBytes) {
    echo json_encode(['success' => false, 'message' => 'File exceeds the 50 MB size limit.']);
    exit;
}

// Server-side MIME detection — never trust the browser-supplied type
$detectedMime = mime_content_type($file['tmp_name']);
if (!in_array($detectedMime, $allowedMime, true)) {
    echo json_encode(['success' => false, 'message' => 'File type not permitted: ' . htmlspecialchars($detectedMime, ENT_QUOTES, 'UTF-8')]);
    exit;
}

// ── Build safe destination path ────────────────────────────────
$ext        = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$storedName = bin2hex(random_bytes(16)) . ($ext !== '' ? '.' . $ext : '');
$subDir     = date('Y') . DIRECTORY_SEPARATOR . date('m') . DIRECTORY_SEPARATOR;
$fullDir    = $uploadBaseDir . $subDir;

if (!is_dir($fullDir) && !mkdir($fullDir, 0750, true)) {
    echo json_encode(['success' => false, 'message' => 'Could not create upload directory.']);
    exit;
}

$destPath = $fullDir . $storedName;
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    echo json_encode(['success' => false, 'message' => 'Failed to save file to disk.']);
    exit;
}

// ── Sanitize optional metadata ─────────────────────────────────
$category     = htmlspecialchars(trim($_POST['category']    ?? 'General'), ENT_QUOTES, 'UTF-8');
$description  = htmlspecialchars(trim($_POST['description'] ?? ''),        ENT_QUOTES, 'UTF-8');
$isPublic     = !empty($_POST['is_public']) ? 1 : 0;

// Folder must be provided — uploads to root are not allowed
if (!isset($_POST['folder_id']) || ($_POST['folder_id'] ?? '') === '') {
    respond_error('Folder selection is required.', ERR_VALIDATION, 400);
}
$folderId     = (int) $_POST['folder_id'];

// Verify folder exists — allow uploads into any existing folder (ownership not enforced)
$check = $conn->prepare('SELECT id FROM storage_folders WHERE id = ?');
if (!$check) { respond_error('Database error validating folder.', ERR_DATABASE, 500); }
$check->bind_param('i', $folderId);
$check->execute();
$res = $check->get_result();
if (!$res || $res->num_rows === 0) {
    respond_error('Selected folder does not exist.', ERR_VALIDATION, 400);
}
$check->close();
$relativePath = 'uploads/' . str_replace(DIRECTORY_SEPARATOR, '/', $subDir) . $storedName;
$userId       = (int) $_SESSION['user_id'];
$fileSize     = (int) $file['size'];

// ── Persist metadata ───────────────────────────────────────────
$stmt = $conn->prepare(
    "INSERT INTO storage_files
        (folder_id, user_id, original_name, stored_name, file_path, file_type, file_size, category, description, is_public)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
if (!$stmt) {
    @unlink($destPath);
    echo json_encode(['success' => false, 'message' => 'Database prepare failed. Has the schema been imported? ' . $conn->error]);
    exit;
}
$stmt->bind_param(
    'iissssisis',
    $folderId,
    $userId,
    $file['name'],
    $storedName,
    $relativePath,
    $detectedMime,
    $fileSize,
    $category,
    $description,
    $isPublic
);

if (!$stmt->execute()) {
    @unlink($destPath); // roll back physical file on DB failure
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    $stmt->close();
    exit;
}

$newId = $conn->insert_id;
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'message' => 'File uploaded successfully.', 'id' => $newId]);
