<?php
/**
 * report_helper.php
 * Small helper to persist report records to `reports` table.
 */
if (session_status() === PHP_SESSION_NONE) session_start();

/**
 * Save a report record.
 * $content may be any serializable data (array/object/strings).
 */
function save_report($conn, $title, $report_type = 'custom', $content = null, $created_by = null) {
    if (!isset($conn) || !($conn instanceof mysqli)) return false;

    $content_json = is_string($content) ? $content : json_encode($content);

    if ($created_by === null && isset($_SESSION['user_id'])) {
        $created_by = intval($_SESSION['user_id']);
    }

    // Use prepared statement. created_by may be NULL.
    $stmt = $conn->prepare("INSERT INTO reports (title, report_type, content, created_by, created_at) VALUES (?, ?, ?, ?, NOW())");
    if (!$stmt) return false;

    if ($created_by !== null) {
        $stmt->bind_param('sssi', $title, $report_type, $content_json, $created_by);
    } else {
        // bind NULL for created_by using a PHP variable set to null and 'i' type; use workaround by sending 0 and then set created_by to NULL in SQL
        $nullInt = null;
        $stmt->bind_param('sssi', $title, $report_type, $content_json, $nullInt);
    }

    $ok = $stmt->execute();
    $stmt->close();
    return $ok;
}

?>
