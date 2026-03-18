<?php
/**
 * Test DB connection helper
 * Returns JSON with connection status and basic counts.
 */
require_once __DIR__ . '/config.php';
// Try to include db_connect which sets $conn
try {
    require_once __DIR__ . '/db_connect.php';
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Failed to include db_connect.php', 'error' => $e->getMessage()]);
    exit;
}

header('Content-Type: application/json');

try {
    if (!isset($conn)) {
        throw new Exception('Database connection ($conn) not available.');
    }

    // Basic sanity queries (if tables exist)
    $counts = [];
    $tables = ['users','projects','tasks','activity_log'];
    foreach ($tables as $t) {
        $res = $conn->query("SELECT COUNT(*) AS c FROM `{$t}`");
        if ($res) {
            $row = $res->fetch_assoc();
            $counts[$t] = intval($row['c']);
        } else {
            $counts[$t] = null; // table may not exist
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Connected to database successfully',
        'db_host' => DB_HOST,
        'db_name' => DB_NAME,
        'counts' => $counts
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Connection test failed', 'error' => $e->getMessage()]);
}

if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}

?>
