<?php
/**
 * Logout Handler
 * Destroys user session and redirects to login page
 */

session_start();

// Include configuration and database connection for logging
require_once('config.php');
require_once('db_connect.php');

// Log the logout activity if user is logged in
if (isset($_SESSION['user_id'])) {
    try {
        $stmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, description) VALUES (?, 'logout', 'user', 'User logged out')");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $stmt->close();
    } catch (Exception $e) {
        // Silently fail - don't prevent logout
        error_log("Logout logging error: " . $e->getMessage());
    }
}

// Unset all session variables
$_SESSION = array();

// Delete session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Delete remember me cookie
if (isset($_COOKIE['remember_token'])) {
    setcookie('remember_token', '', time() - 3600, '/');
}

// Destroy the session
session_destroy();

// Close database connection
$conn->close();

// Redirect to login page with logout message
header('Location: ' . APP_URL . '/page/login.php?logout=1');
exit;
?>
