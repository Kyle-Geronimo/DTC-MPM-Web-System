<?php
/**
 * Save (create or update) an Emulator Program.
 * POST JSON: { id?, name, description, runtime, source_code, is_public }
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

if (!is_array($data)) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body.']);
    exit;
}

$ALLOWED_RUNTIMES = ['python', 'javascript', 'x86_disk_image'];

$id          = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
$name        = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$runtime     = $data['runtime'] ?? '';
$sourceCode  = $data['source_code'] ?? '';
$isPublic    = !empty($data['is_public']) ? 1 : 0;
$userId      = (int) $_SESSION['user_id'];

// Validate required fields
if ($name === '') { echo json_encode(['success' => false, 'message' => 'Name is required.']); exit; }
if (!in_array($runtime, $ALLOWED_RUNTIMES, true)) { echo json_encode(['success' => false, 'message' => 'Invalid runtime.']); exit; }
if (strlen($name) > 150) { echo json_encode(['success' => false, 'message' => 'Name too long (max 150 characters).']); exit; }

if ($id) {
    // ── UPDATE ─────────────────────────────────────────────────
    $check = $conn->prepare("SELECT id FROM emulator_programs WHERE id = ? AND user_id = ?");
    $check->bind_param('ii', $id, $userId);
    $check->execute();
    $exists = $check->get_result()->fetch_assoc();
    $check->close();

    if (!$exists) {
        echo json_encode(['success' => false, 'message' => 'Program not found or access denied.']);
        exit;
    }

    $stmt = $conn->prepare(
        "UPDATE emulator_programs
         SET name=?, description=?, runtime=?, source_code=?, is_public=?, updated_at=NOW()
         WHERE id=? AND user_id=?"
    );
    $stmt->bind_param('ssssiis', $name, $description, $runtime, $sourceCode, $isPublic, $id, $userId);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Program updated successfully.', 'id' => $id]);

} else {
    // ── INSERT ─────────────────────────────────────────────────
    $stmt = $conn->prepare(
        "INSERT INTO emulator_programs (user_id, name, description, runtime, source_code, is_public, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())"
    );
    $stmt->bind_param('issssi', $userId, $name, $description, $runtime, $sourceCode, $isPublic);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Program created successfully.', 'id' => $newId]);
}
