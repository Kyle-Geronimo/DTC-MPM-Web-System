<?php
/**
 * Update Project API
 * Accepts POST data to update a project by id or name
 */

if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');
require_once('validator.php');
require_once('audit_logger.php');
header('Content-Type: application/json');

// Ensure DB connection is available
if (!isset($conn) || !($conn instanceof mysqli)) {
    respond_error('Database connection failed', ERR_DATABASE, 500);
}

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in.', ERR_AUTH, 401);
}

$response = ['success' => false];

try {
    if (empty($_POST['id']) && empty($_POST['name'])) {
        throw new Exception('Missing project identifier');
    }

    // Collect fields
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    $name = isset($_POST['name']) ? $_POST['name'] : null;
    $description = isset($_POST['description']) ? $_POST['description'] : null;
    $start_date = isset($_POST['start_date']) && $_POST['start_date'] !== '' ? strtotime($_POST['start_date']) : null;
    $end_date = isset($_POST['end_date']) && $_POST['end_date'] !== '' ? strtotime($_POST['end_date']) : null;
    $status = isset($_POST['status']) ? $_POST['status'] : null;
    $progress = isset($_POST['progress']) ? intval($_POST['progress']) : null;
    $budget = isset($_POST['budget']) && $_POST['budget'] !== '' ? $_POST['budget'] : null;
    $spent = isset($_POST['spent']) && $_POST['spent'] !== '' ? $_POST['spent'] : null;

    // Build dynamic update
    $fields = [];
    $params = [];
    $types = '';

    if ($name !== null) { $fields[] = 'name = ?'; $params[] = $name; $types .= 's'; }
    if ($description !== null) { $fields[] = 'description = ?'; $params[] = $description; $types .= 's'; }
    if ($start_date !== null) { $fields[] = 'start_date = ?'; $params[] = $start_date; $types .= 'i'; }
    if ($end_date !== null) { $fields[] = 'end_date = ?'; $params[] = $end_date; $types .= 'i'; }
    if ($status !== null) { $fields[] = 'status = ?'; $params[] = $status; $types .= 's'; }
    if ($progress !== null) { $fields[] = 'progress = ?'; $params[] = $progress; $types .= 'i'; }
    if ($budget !== null) { $fields[] = 'budget = ?'; $params[] = $budget; $types .= 'd'; }
    if ($spent !== null) { $fields[] = 'spent = ?'; $params[] = $spent; $types .= 'd'; }

    if (empty($fields)) {
        throw new Exception('No fields to update');
    }

    $sql = 'UPDATE projects SET ' . implode(', ', $fields) . ' WHERE ';
    if ($id) {
        $sql .= 'id = ? LIMIT 1';
        $params[] = $id; $types .= 's';
    } else {
        $sql .= 'name = ? LIMIT 1';
        $params[] = $name; $types .= 's';
    }

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception($conn->error);

    // bind params dynamically
    $bind_names[] = $types;
    for ($i=0; $i<count($params); $i++) {
        $bind_name = 'bind' . $i;
        $$bind_name = $params[$i];
        $bind_names[] = &$$bind_name;
    }
    call_user_func_array([$stmt, 'bind_param'], $bind_names);

    $ok = $stmt->execute();
    if (!$ok) throw new Exception($stmt->error ?: 'Failed to update');

    if ($stmt->affected_rows === 0) {
        // No rows changed, but may still be success
    }

    $response['success'] = true;
    $response['message'] = 'Project updated';

    // Audit log
    $audit = get_audit_logger($conn);
    $audit->log('update', 'project', $id ?: $name, null, array_filter([
        'name' => $name, 'status' => $status, 'progress' => $progress
    ], function($v) { return $v !== null; }));

    // Save report entry for this update (best-effort)
    try {
        require_once(__DIR__ . '/report_helper.php');
        save_report($conn, 'Project Updated: ' . ($id ?: $name), 'project', [
            'id' => $id,
            'changes' => array_filter(['name' => $name, 'status' => $status, 'progress' => $progress], function($v){return $v !== null;})
        ]);
    } catch (Exception $e) {
        error_log('update_project: save_report failed: ' . $e->getMessage());
    }

    $stmt->close();
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();

?>
