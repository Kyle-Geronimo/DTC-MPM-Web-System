<?php
/**
 * Fix Teams Schema Helper
 * - Backs up current `teams` table to `teams_broken`
 * - Creates a new `teams` table with proper AUTO_INCREMENT primary key
 * - Copies rows from broken table, preserving numeric ids when present
 * - Attempts to reconcile `team_members` entries by matching name+description
 *
 * WARNING: run only on local development. Call with ?confirm=1 to execute.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_connect.php';
header('Content-Type: text/plain');

if (!isset($_GET['confirm']) || $_GET['confirm'] !== '1') {
    echo "This will attempt to repair the teams table. To run: fix_teams_schema.php?confirm=1\n";
    exit;
}

try {
    // Check teams table exists
    $res = $conn->query("SHOW TABLES LIKE 'teams'");
    if (!$res || $res->num_rows === 0) {
        echo "No `teams` table found.\n";
        exit;
    }

    // Backup original
    $backupName = 'teams_broken_' . time();
    echo "Renaming old table to {$backupName}\n";
    if (!$conn->query("RENAME TABLE teams TO {$backupName}")) {
        throw new Exception('Rename failed: ' . $conn->error);
    }

    // Create new teams table
    echo "Creating new teams table...\n";
    $createSql = "CREATE TABLE teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
    if (!$conn->query($createSql)) {
        throw new Exception('Create table failed: ' . $conn->error);
    }

    // Copy rows with numeric ids first (preserve them)
    echo "Copying rows with numeric ids (preserving ids)...\n";
    $copy1 = "INSERT INTO teams (id, name, description, created_at, updated_at) SELECT id, name, description, created_at, updated_at FROM {$backupName} WHERE id IS NOT NULL ORDER BY id ASC";
    if (!$conn->query($copy1)) {
        echo "Warning: copying with ids failed: " . $conn->error . "\n";
    }

    // Copy rows with NULL ids (let auto_increment generate ids)
    echo "Copying rows with NULL ids (generating new ids)...\n";
    $copy2 = "INSERT INTO teams (name, description, created_at, updated_at) SELECT name, description, created_at, updated_at FROM {$backupName} WHERE id IS NULL";
    if (!$conn->query($copy2)) {
        echo "Warning: copying null-id rows failed: " . $conn->error . "\n";
    }

    // Attempt to reconcile team_members rows that referenced old numeric ids (they should still match)
    echo "Attempting to reconcile team_members by name+description where possible...\n";
    // For team_members entries with team_id IS NULL, try to find team by name via joining backup table
    $reconcileSql = "UPDATE team_members tm
        JOIN {$backupName} b ON tm.team_id = b.id
        JOIN teams tnew ON ( (b.id IS NOT NULL AND tnew.id = b.id) OR (b.id IS NULL AND tnew.name = b.name AND (b.description = tnew.description OR (b.description IS NULL AND tnew.description IS NULL))) )
        SET tm.team_id = tnew.id
        WHERE tm.team_id IS NULL OR tm.team_id = b.id";
    // Run safely in try/catch
    if (!$conn->query($reconcileSql)) {
        echo "Reconcile query had errors (this is non-fatal): " . $conn->error . "\n";
    } else {
        echo "Reconcile completed.\n";
    }

    echo "Repair complete. Old table is {$backupName}.\n";

} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}

if (isset($conn) && $conn instanceof mysqli) $conn->close();

?>
