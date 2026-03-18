<?php
/**
 * Session Check
 * Include this file at the top of protected pages
 */

session_start();

// Include configuration
require_once('config.php');

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // User is not logged in, redirect to login page
    header('Location: ' . APP_URL . '/page/login.php');
    exit;
}

// Optional: Check session timeout (30 minutes)
$timeout_duration = 1800; // 30 minutes in seconds

if (isset($_SESSION['login_time'])) {
    $elapsed_time = time() - $_SESSION['login_time'];
    
    if ($elapsed_time > $timeout_duration) {
        // Session has timed out
        session_unset();
        session_destroy();
        header('Location: ' . APP_URL . '/page/login.php?timeout=1');
        exit;
    }
}

// Update last activity time
$_SESSION['login_time'] = time();

// Make user data available
$current_user = array(
    'id' => $_SESSION['user_id'],
    'username' => $_SESSION['username'],
    'email' => $_SESSION['email'],
    'full_name' => $_SESSION['full_name'],
    'role' => $_SESSION['role'],
    'department' => isset($_SESSION['department']) ? $_SESSION['department'] : ''
);
?>
