<?php
/**
 * Logout Handler
 * Destroys user session and redirects to login page
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Include configuration and database connection for logging
require_once('config.php');
require_once('db_connect.php');
require_once('audit_logger.php');

// Log the logout activity if user is logged in
if (isset($_SESSION['user_id'])) {
    try {
        $audit = get_audit_logger($conn);
        $audit->log('logout', 'user', (string)$_SESSION['user_id']);

        // Remove session from user_sessions table
        $sessionId = session_id();
        $deleteStmt = $conn->prepare("DELETE FROM user_sessions WHERE id = ?");
        if ($deleteStmt) {
            $deleteStmt->bind_param("s", $sessionId);
            $deleteStmt->execute();
            $deleteStmt->close();
        }
    } catch (Exception $e) {
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
