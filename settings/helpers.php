<?php
/**
 * Helpers Utility Functions
 * Centralized helper functions to avoid code duplication across settings files
 */

if (defined('HELPERS_LOADED')) return;
define('HELPERS_LOADED', true);

// ==========================================
// TIME & DATE HELPERS
// ==========================================

/**
 * Convert datetime to human-readable "time ago" format
 * @param string $datetime DateTime string
 * @return string Human-readable time difference (e.g., "2h ago", "Just now")
 */
function timeAgo($datetime) {
    try {
        $now = new DateTime();
        $past = new DateTime($datetime);
        $diff = $now->diff($past);

        if ($diff->y > 0) return $diff->y . 'y ago';
        if ($diff->m > 0) return $diff->m . 'mo ago';
        if ($diff->d > 0) return $diff->d . 'd ago';
        if ($diff->h > 0) return $diff->h . 'h ago';
        if ($diff->i > 0) return $diff->i . 'm ago';
        return 'Just now';
    } catch (Exception $e) {
        return 'Unknown';
    }
}

// ==========================================
// NETWORK & SECURITY HELPERS
// ==========================================

/**
 * Get client IP address safely (avoid spoofing)
 * @return string Client IP address or '0.0.0.0' if unknown
 */
function getClientIp() {
    // Only trust REMOTE_ADDR to avoid spoofing
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
}

// ==========================================
// TABLE CREATION HELPERS
// ==========================================

/**
 * Ensure direct_messages table exists
 * @param mysqli $conn Database connection
 * @return bool Success status
 */
function ensureDirectMessagesTable($conn) {
    $create = "CREATE TABLE IF NOT EXISTS direct_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sender (sender_id),
        INDEX idx_receiver (receiver_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    return $conn->query($create) !== false;
}

/**
 * Ensure user_preferences table exists
 * @param mysqli $conn Database connection
 * @return bool Success status
 */
function ensureUserPreferencesTable($conn) {
    $create = "CREATE TABLE IF NOT EXISTS user_preferences (
        pref_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        pref_key VARCHAR(100) NOT NULL,
        pref_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_pref (user_id, pref_key),
        INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    return $conn->query($create) !== false;
}

// ==========================================
// SESSION HELPERS
// ==========================================

/**
 * Generate session fingerprint for hijacking prevention
 * @return string MD5 hash of user agent and IP
 */
function generateSessionFingerprint() {
    return md5(
        ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') .
        getClientIp()
    );
}

/**
 * Verify session fingerprint matches
 * @param string $storedFingerprint Previously stored fingerprint
 * @return bool True if fingerprint matches, false otherwise
 */
function verifySessionFingerprint($storedFingerprint) {
    return $storedFingerprint === generateSessionFingerprint();
}

/**
 * Check if user is authenticated via session
 * @param bool $ajaxResponse If true, return JSON; if false, redirect
 * @return bool True if authenticated, false/exit otherwise
 */
function requireLogin($ajaxResponse = false) {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        if ($ajaxResponse) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'session_expired' => true,
                'message' => 'Please log in to continue.'
            ]);
        } else {
            header('Location: ' . (defined('APP_URL') ? APP_URL : '/ProjectDashboard') . '/page/login.php');
        }
        exit;
    }
    return true;
}

?>
