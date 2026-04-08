<?php
/**
 * File Export Handler
 * Generates CSV (Excel-compatible) and basic HTML-to-PDF exports for reports and data.
 * No external libraries required.
 */

session_start();
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/db_connect.php');
/** @var mysqli $conn */
require_once(__DIR__ . '/error_handler.php');
/** @var mysqli $conn */
if (!isset($conn)) { $conn = null; }

// Require login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in to export data.', ERR_AUTH, 401);
}

$type = isset($_GET['type']) ? $_GET['type'] : '';
$format = isset($_GET['format']) ? strtolower($_GET['format']) : 'csv';

if (empty($type)) {
    respond_error('Export type is required.', ERR_VALIDATION);
}

safe_execute(function () use ($conn, $type, $format) {
    switch ($type) {
        case 'projects':
            $data = fetchProjects($conn);
            $filename = 'projects_export_' . date('Y-m-d');
            $columns = ['ID', 'Name', 'Status', 'Progress', 'Start Date', 'End Date', 'Created By', 'Created At'];
            break;

        case 'tasks':
            $data = fetchTasks($conn);
            $filename = 'tasks_export_' . date('Y-m-d');
            $columns = ['ID', 'Title', 'Project', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Est. Hours', 'Created At'];
            break;

        case 'team':
            $data = fetchTeamMembers($conn);
            $filename = 'team_export_' . date('Y-m-d');
            $columns = ['Name', 'Email', 'Department', 'Role', 'Status', 'Team', 'Joined'];
            break;

        case 'activity':
            $data = fetchActivityLog($conn);
            $filename = 'activity_log_' . date('Y-m-d');
            $columns = ['Date', 'User', 'Action', 'Entity Type', 'Description'];
            break;

        case 'audit':
            $data = fetchAuditLog($conn);
            $filename = 'audit_log_' . date('Y-m-d');
            $columns = ['Date', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
            break;

        default:
            respond_error('Invalid export type.', ERR_VALIDATION);
    }

    if ($format === 'pdf') {
        exportPdf($data, $columns, $filename);
    } else {
        exportCsv($data, $columns, $filename);
    }
});

// ==========================================
// DATA FETCHERS
// ==========================================

function fetchProjects($conn) {
    $result = $conn->query(
        "SELECT p.id, p.name, p.status, p.progress, p.start_date, p.end_date, u.full_name as created_by, p.created_at
         FROM projects p
         LEFT JOIN users u ON p.created_by = u.id
         ORDER BY p.created_at DESC"
    );
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            $row['id'],
            $row['name'],
            ucfirst($row['status']),
            $row['progress'] . '%',
            $row['start_date'],
            $row['end_date'],
            $row['created_by'] ?: 'N/A',
            $row['created_at']
        ];
    }
    return $rows;
}

function fetchTasks($conn) {
    $result = $conn->query(
        "SELECT t.id, t.title, p.name as project_name, u.full_name as assigned_name,
                t.priority, t.status, t.due_date, t.estimated_hours, t.created_at
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         ORDER BY t.created_at DESC"
    );
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            $row['id'],
            $row['title'],
            $row['project_name'] ?: 'N/A',
            $row['assigned_name'] ?: 'Unassigned',
            ucfirst($row['priority']),
            ucfirst($row['status']),
            $row['due_date'],
            $row['estimated_hours'] ?: '0',
            $row['created_at']
        ];
    }
    return $rows;
}

function fetchTeamMembers($conn) {
    $result = $conn->query(
        "SELECT u.full_name, u.email, u.department, u.role, u.status,
                GROUP_CONCAT(te.name SEPARATOR ', ') as teams,
                u.created_at
         FROM users u
         LEFT JOIN team_members tm ON u.id = tm.user_id
         LEFT JOIN teams te ON tm.team_id = te.id
         GROUP BY u.id
         ORDER BY u.full_name"
    );
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            $row['full_name'],
            $row['email'],
            $row['department'] ?: 'N/A',
            ucfirst($row['role']),
            ucfirst($row['status']),
            $row['teams'] ?: 'No Team',
            $row['created_at']
        ];
    }
    return $rows;
}

function fetchActivityLog($conn) {
    $result = $conn->query(
        "SELECT al.created_at, u.full_name, al.action, al.entity_type, al.description
         FROM activity_log al
         LEFT JOIN users u ON al.user_id = u.id
         ORDER BY al.created_at DESC
         LIMIT 500"
    );
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            $row['created_at'],
            $row['full_name'] ?: 'System',
            ucfirst($row['action']),
            ucfirst($row['entity_type'] ?: 'N/A'),
            $row['description']
        ];
    }
    return $rows;
}

function fetchAuditLog($conn) {
    // Check if audit_log table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'audit_log'");
    if ($tableCheck->num_rows === 0) {
        return [];
    }
    $result = $conn->query(
        "SELECT al.created_at, u.full_name, al.action, al.entity_type, al.entity_id, al.ip_address
         FROM audit_log al
         LEFT JOIN users u ON al.user_id = u.id
         ORDER BY al.created_at DESC
         LIMIT 500"
    );
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            $row['created_at'],
            $row['full_name'] ?: 'System',
            ucfirst($row['action']),
            ucfirst($row['entity_type'] ?: 'N/A'),
            $row['entity_id'] ?: 'N/A',
            $row['ip_address'] ?: 'N/A'
        ];
    }
    return $rows;
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

function exportCsv($data, $columns, $filename) {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    // UTF-8 BOM for Excel compatibility
    echo "\xEF\xBB\xBF";

    $output = fopen('php://output', 'w');
    fputcsv($output, $columns);

    foreach ($data as $row) {
        fputcsv($output, $row);
    }

    fclose($output);
    exit;
}

function exportPdf($data, $columns, $filename) {
    // Generate an HTML document styled for printing / Save As PDF
    header('Content-Type: text/html; charset=UTF-8');
    header('Content-Disposition: inline; filename="' . $filename . '.html"');

    $title = ucfirst(str_replace('_', ' ', explode('_export', $filename)[0])) . ' Report';
    $date = date('F j, Y g:i A');
    $count = count($data);

    $html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>
    <title>$title</title>
    <style>
        @page { margin: 1cm; size: landscape; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1f2937; padding: 20px; }
        .report-header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #800000; }
        .report-header h1 { color: #660000; font-size: 22px; margin-bottom: 4px; }
        .report-header .meta { color: #6b7280; font-size: 12px; }
        .print-btn { display: inline-block; background: #800000; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
        .print-btn:hover { background: #660000; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #660000; color: white; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #eff6ff; }
        .footer { margin-top: 20px; text-align: center; color: #9ca3af; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    </style></head><body>
    <button class='print-btn no-print' onclick='window.print()'>Print / Save as PDF</button>
    <div class='report-header'>
        <h1>$title</h1>
        <div class='meta'>Generated: $date | Total Records: $count</div>
    </div>
    <table><thead><tr>";

    foreach ($columns as $col) {
        $html .= "<th>" . htmlspecialchars($col) . "</th>";
    }
    $html .= "</tr></thead><tbody>";

    foreach ($data as $row) {
        $html .= "<tr>";
        foreach ($row as $cell) {
            $html .= "<td>" . htmlspecialchars($cell) . "</td>";
        }
        $html .= "</tr>";
    }

    $html .= "</tbody></table>
    <div class='footer'>This report was generated by " . (defined('APP_NAME') ? APP_NAME : 'Project Dashboard') . "</div>
    </body></html>";

    echo $html;
    exit;
}
?>
