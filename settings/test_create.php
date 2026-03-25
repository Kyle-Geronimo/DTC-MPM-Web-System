<?php
/**
 * Test Create Project - Debugging
 */
session_start();
error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: application/json');

$debug = [];

// Check session
$debug['session_status'] = session_status();
$debug['session_id'] = session_id();
$debug['logged_in'] = isset($_SESSION['logged_in']) ? $_SESSION['logged_in'] : 'NOT SET';
$debug['user_id'] = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'NOT SET';
$debug['session_data'] = $_SESSION;

// Check database connection
try {
    require_once('config.php');
    require_once('db_connect.php');
    
    $debug['db_config'] = [
        'host' => DB_HOST,
        'name' => DB_NAME,
        'user' => DB_USER
    ];
    
    $debug['connection'] = $conn ? 'SUCCESS' : 'FAILED';
    
    if ($conn) {
        // Test query
        $result = $conn->query("SELECT COUNT(*) as count FROM projects");
        if ($result) {
            $row = $result->fetch_assoc();
            $debug['projects_count'] = $row['count'];
        } else {
            $debug['query_error'] = $conn->error;
        }
    }
} catch (Exception $e) {
    $debug['exception'] = $e->getMessage();
}

// Check POST data
$debug['request_method'] = $_SERVER['REQUEST_METHOD'];
$debug['post_data'] = $_POST;

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
