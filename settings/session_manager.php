<?php
/**
 * Enhanced Session Manager
 * Handles secure session configuration, timeouts, CSRF tokens, and session tracking.
 * Include this instead of session_check.php on protected pages.
 */

// Prevent double-inclusion
if (defined('SESSION_MANAGER_LOADED')) return;
define('SESSION_MANAGER_LOADED', true);

require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/helpers.php');

// ==========================================
// SECURE SESSION CONFIGURATION
// ==========================================

// Set secure session parameters before starting
ini_set('session.use_strict_mode', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.gc_maxlifetime', SESSION_TIMEOUT * 60);

if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    ini_set('session.cookie_secure', 1);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ==========================================
// SESSION TIMEOUT CHECK
// ==========================================

$timeout_seconds = defined('SESSION_TIMEOUT') ? SESSION_TIMEOUT * 60 : 1800;

if (isset($_SESSION['last_activity'])) {
    $idle_time = time() - $_SESSION['last_activity'];
    if ($idle_time > $timeout_seconds) {
        // Session expired
        $expired_user = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        session_unset();
        session_destroy();

        // If this is an AJAX request, return JSON
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'session_expired' => true,
                'message' => 'Your session has expired. Please log in again.'
            ]);
            exit;
        }

        header('Location: ' . APP_URL . '/page/login.php?timeout=1');
        exit;
    }
}

// Update last activity
$_SESSION['last_activity'] = time();

// ==========================================
// SESSION FINGERPRINT (prevent hijacking)
// ==========================================

$fingerprint = generateSessionFingerprint();

if (isset($_SESSION['fingerprint'])) {
    if ($_SESSION['fingerprint'] !== $fingerprint) {
        session_unset();
        session_destroy();
        header('Location: ' . APP_URL . '/page/login.php?error=session_invalid');
        exit;
    }
} else {
    $_SESSION['fingerprint'] = $fingerprint;
}

// ==========================================
// AUTHENTICATION CHECK
// ==========================================

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'session_expired' => true,
            'message' => 'Please log in to continue.'
        ]);
        exit;
    }
    header('Location: ' . APP_URL . '/page/login.php');
    exit;
}

// ==========================================
// REGENERATE SESSION ID PERIODICALLY
// ==========================================

$regen_interval = 300; // 5 minutes
if (!isset($_SESSION['last_regen']) || (time() - $_SESSION['last_regen']) > $regen_interval) {
    session_regenerate_id(true);
    $_SESSION['last_regen'] = time();
}

// ==========================================
// CSRF TOKEN MANAGEMENT
// ==========================================

/**
 * Generate or retrieve the current CSRF token
 */
function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Return an HTML hidden input with the CSRF token
 */
function csrf_field() {
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(csrf_token()) . '">';
}

/**
 * Validate CSRF token from request
 */
function csrf_validate($token = null) {
    if ($token === null) {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    }
    if (empty($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

// ==========================================
// HELPER: Current user array
// ==========================================

function get_current_user_info() {
    return [
        'id'         => $_SESSION['user_id'] ?? null,
        'username'   => $_SESSION['username'] ?? '',
        'email'      => $_SESSION['email'] ?? '',
        'full_name'  => $_SESSION['full_name'] ?? '',
        'role'       => $_SESSION['role'] ?? '',
        'department' => $_SESSION['department'] ?? ''
    ];
}

// Make $current_user available for backward compatibility
$current_user = get_current_user_info();
?>
