<?php
/**
 * Ensure DB schema and sample data are installed.
 * WARNING: For local development only. This will execute the SQL in database_setup.sql
 * Usage: visit this file in browser with ?confirm=1 to run once.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_connect.php';
header('Content-Type: text/plain');

if (!isset($_GET['confirm']) || $_GET['confirm'] !== '1') {
    echo "This helper will create the database schema and sample data from database_setup.sql\n";
    echo "To run it, call: ensure_schema.php?confirm=1\n";
    exit;
}

$sqlFile = __DIR__ . '/database_setup.sql';
if (!file_exists($sqlFile)) {
    echo "SQL file not found: $sqlFile\n";
    exit;
}

$sql = file_get_contents($sqlFile);
if ($sql === false) {
    echo "Failed to read SQL file\n";
    exit;
}

// Split and run via multi_query
try {
    if (!isset($conn)) {
        throw new Exception('Database connection not available');
    }

    // Turn off foreign key checks while running
    $conn->query("SET FOREIGN_KEY_CHECKS=0;");
    if ($conn->multi_query($sql)) {
        // consume results
        do {
            if ($res = $conn->store_result()) {
                $res->free();
            }
        } while ($conn->more_results() && $conn->next_result());
        echo "Schema executed.\n";
    } else {
        echo "multi_query failed: " . $conn->error . "\n";
    }
    $conn->query("SET FOREIGN_KEY_CHECKS=1;");
    echo "Done.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

if (isset($conn) && $conn instanceof mysqli) $conn->close();

?>
