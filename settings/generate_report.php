<?php
/**
 * generate_report.php
 * Lightweight server-side generator for custom reports.
 * Accepts POST: type (projects|tasks|team|activity|audit), from, to, notes
 * Returns JSON { success: true, report: { title, generated, description, metrics: {...}, rows: [...] } }
 */

session_start();
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/db_connect.php');
require_once(__DIR__ . '/error_handler.php');
require_once(__DIR__ . '/report_helper.php');

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

// Defensive: ensure DB connection is available
if (!isset($conn) || !($conn instanceof mysqli)) {
    error_log('generate_report.php: missing or invalid $conn');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit;
}

$type = isset($_POST['type']) ? $_POST['type'] : '';
$from = isset($_POST['from']) ? $_POST['from'] : '';
$to = isset($_POST['to']) ? $_POST['to'] : '';
$notes = isset($_POST['notes']) ? $_POST['notes'] : '';

if (empty($type)) {
    echo json_encode(['success' => false, 'message' => 'Report type required']);
    exit;
}

try {
    $report = [
        'title' => ucfirst($type) . ' Report',
        'generated' => date('Y-m-d H:i:s'),
        'description' => $notes ?: ucfirst($type) . " report generated on " . date('Y-m-d'),
        'metrics' => [],
        'rows' => []
    ];

    switch ($type) {
        case 'projects':
            $q = "SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed, AVG(progress) as avg_progress FROM projects";
            if ($from || $to) {
                $conds = [];
                if ($from) $conds[] = "created_at >= '" . $conn->real_escape_string($from) . " 00:00:00'";
                if ($to) $conds[] = "created_at <= '" . $conn->real_escape_string($to) . " 23:59:59'";
                if ($conds) $q .= ' WHERE ' . implode(' AND ', $conds);
            }
            $res = $conn->query($q);
            $row = $res ? $res->fetch_assoc() : null;
            $report['metrics'] = [
                'Total Projects' => (int)($row['total'] ?? 0),
                'Completed' => (int)($row['completed'] ?? 0),
                'Average Progress' => round(floatval($row['avg_progress'] ?? 0),2) . '%'
            ];

            // rows: top 10 projects by progress
            $r = $conn->query("SELECT id, name, status, progress FROM projects ORDER BY progress DESC LIMIT 10");
            if ($r) {
                while ($rr = $r->fetch_assoc()) {
                    $report['rows'][] = $rr;
                }
            }
            break;

        case 'tasks':
            $q = "SELECT COUNT(*) as total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as completed FROM tasks";
            // optional filters: from/to already supported; add status/priority/assignee
            $status = isset($_POST['status']) ? trim($_POST['status']) : '';
            $priority = isset($_POST['priority']) ? trim($_POST['priority']) : '';
            $assignee = isset($_POST['assignee']) ? intval($_POST['assignee']) : 0;

            if ($from || $to || $status || $priority || $assignee) {
                $conds = [];
                if ($from) $conds[] = "created_at >= '" . $conn->real_escape_string($from) . " 00:00:00'";
                if ($to) $conds[] = "created_at <= '" . $conn->real_escape_string($to) . " 23:59:59'";
                if ($status) $conds[] = "status = '" . $conn->real_escape_string($status) . "'";
                if ($priority) $conds[] = "priority = '" . $conn->real_escape_string($priority) . "'";
                if ($assignee) $conds[] = "assigned_to = " . intval($assignee);
                if ($conds) $q .= ' WHERE ' . implode(' AND ', $conds);
            }
            $res = $conn->query($q);
            $row = $res ? $res->fetch_assoc() : null;
            $report['metrics'] = [
                'Total Tasks' => (int)($row['total'] ?? 0),
                'Completed Tasks' => (int)($row['completed'] ?? 0)
            ];
            // fetch task rows honoring same filters
            $base = "FROM tasks t LEFT JOIN projects p ON t.project_id = p.id";
            $where = [];
            if ($from) $where[] = "t.created_at >= '" . $conn->real_escape_string($from) . " 00:00:00'";
            if ($to) $where[] = "t.created_at <= '" . $conn->real_escape_string($to) . " 23:59:59'";
            if ($status) $where[] = "t.status = '" . $conn->real_escape_string($status) . "'";
            if ($priority) $where[] = "t.priority = '" . $conn->real_escape_string($priority) . "'";
            if ($assignee) $where[] = "t.assigned_to = " . intval($assignee);
            $whereSql = $where ? (' WHERE ' . implode(' AND ', $where)) : '';
            $r = $conn->query("SELECT t.id, t.title, t.status, t.priority, t.assigned_to, p.name as project_name " . $base . $whereSql . " ORDER BY t.created_at DESC LIMIT 15");
            if ($r) {
                while ($rr = $r->fetch_assoc()) $report['rows'][] = $rr;
            }
            break;

        case 'team':
            $q = "SELECT COUNT(*) as members FROM users";
            $res = $conn->query($q);
            $row = $res ? $res->fetch_assoc() : null;
            $report['metrics'] = [
                'Members' => (int)($row['members'] ?? 0)
            ];
            $r = $conn->query("SELECT id, full_name, email, role FROM users ORDER BY full_name LIMIT 20");
            if ($r) {
                while ($rr = $r->fetch_assoc()) $report['rows'][] = $rr;
            }
            break;

        case 'activity':
            $q = "SELECT COUNT(*) as total FROM activity_log";
            $res = $conn->query($q);
            $row = $res ? $res->fetch_assoc() : null;
            $report['metrics'] = ['Total Events' => (int)($row['total'] ?? 0)];
            $r = $conn->query("SELECT al.created_at, u.full_name, al.action, al.entity_type FROM activity_log al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 50");
            if ($r) {
                while ($rr = $r->fetch_assoc()) $report['rows'][] = $rr;
            }
            break;

        case 'audit':
            $tableCheck = $conn->query("SHOW TABLES LIKE 'audit_log'");
            if ($tableCheck->num_rows === 0) {
                $report['metrics'] = ['Audit Records' => 0];
                $report['rows'] = [];
            } else {
                $r = $conn->query("SELECT COUNT(*) as c FROM audit_log");
                $row = $r ? $r->fetch_assoc() : null;
                $report['metrics'] = ['Audit Records' => (int)($row['c'] ?? 0)];
                $r2 = $conn->query("SELECT created_at, action, entity_type, entity_id FROM audit_log ORDER BY created_at DESC LIMIT 50");
                if ($r2) {
                    while ($rr = $r2->fetch_assoc()) $report['rows'][] = $rr;
                }
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid report type']);
            exit;
    }

    echo json_encode(['success' => true, 'report' => $report]);

    // Persist generated report into `reports` table (best-effort)
    try {
        $saveContent = [
            'description' => $report['description'],
            'metrics' => $report['metrics'],
            'rows' => $report['rows']
        ];
        save_report($conn, $report['title'], $type, $saveContent);
    } catch (Exception $e) {
        error_log('generate_report: failed to save report: ' . $e->getMessage());
    }
    exit;

} catch (Exception $e) {
    error_log('generate_report error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error generating report']);
    exit;
}
