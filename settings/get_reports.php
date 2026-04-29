<?php
// Returns recent saved reports
if (session_status() === PHP_SESSION_NONE) session_start();
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/db_connect.php');
header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 25;
if ($limit <= 0 || $limit > 200) $limit = 25;

$stmt = $conn->prepare("SELECT id, title, report_type, content, created_by, created_at FROM reports ORDER BY created_at DESC LIMIT ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'DB error']);
    exit;
}
$stmt->bind_param('i', $limit);
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($r = $res->fetch_assoc()) {
    // Attempt decode content
    $content = $r['content'];
    $decoded = json_decode($content, true);
    if ($decoded !== null) $r['content_parsed'] = $decoded;
    else $r['content_parsed'] = $content;
    $rows[] = $r;
}
$stmt->close();

echo json_encode(['success' => true, 'reports' => $rows]);
$conn->close();
?>
