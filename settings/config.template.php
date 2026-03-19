<?php
/**
 * Configuration Template
 * Copy this file to config.php and update with your settings
 * DO NOT share config.php publicly - add it to .gitignore
 */

// ==========================================
// DATABASE CONFIGURATION
// ==========================================

// Database Host
define('DB_HOST', 'localhost');

// Database Port (default: 3306)
define('DB_PORT', 3306);

// Database Name
define('DB_NAME', 'project_management_db');

// Database User
define('DB_USER', 'root');

// Database Password
define('DB_PASS', '');

// ==========================================
// APPLICATION CONFIGURATION
// ==========================================

// Application Name
define('APP_NAME', 'Project Management Dashboard');

// Application Version
define('APP_VERSION', '1.0.0');

// Application URL
define('APP_URL', 'http://localhost/ProjectDashboard');

// ==========================================
// SECURITY CONFIGURATION
// ==========================================

// Enable/Disable debug mode
define('DEBUG_MODE', true);

// Session timeout (in minutes)
define('SESSION_TIMEOUT', 30);

// Password minimum length
define('PASSWORD_MIN_LENGTH', 8);

// Maximum login attempts
define('MAX_LOGIN_ATTEMPTS', 5);

// ==========================================
// EMAIL CONFIGURATION
// ==========================================

// SMTP Server
define('SMTP_HOST', 'smtp.mailtrap.io');

// SMTP Port
define('SMTP_PORT', 2525);

// SMTP Username
define('SMTP_USER', 'your_email@example.com');

// SMTP Password
define('SMTP_PASS', 'your_password');

// From Email
define('FROM_EMAIL', 'noreply@dashboard.com');

// ==========================================
// PAGINATION
// ==========================================

// Items per page
define('ITEMS_PER_PAGE', 20);

// ==========================================
// FILE UPLOAD
// ==========================================

// Maximum upload size (in MB)
define('MAX_FILE_SIZE', 5);

// Allowed file types
define('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,pdf,doc,docx');

// Upload directory
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// ==========================================
// TIME ZONE
// ==========================================

// Set default timezone
date_default_timezone_set('UTC');

// ==========================================
// ERROR HANDLING
// ==========================================

// Display errors (development only)
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ERROR);
    ini_set('display_errors', 0);
}

// ==========================================
// CONSTANTS
// ==========================================

// User Roles
define('ROLE_ADMIN', 'admin');
define('ROLE_MANAGER', 'manager');
define('ROLE_USER', 'user');
define('ROLE_VIEWER', 'viewer');

// Task Status
define('TASK_STATUS_TODO', 'todo');
define('TASK_STATUS_IN_PROGRESS', 'in_progress');
define('TASK_STATUS_COMPLETED', 'completed');
define('TASK_STATUS_ON_HOLD', 'on_hold');

// Project Status
define('PROJECT_STATUS_ACTIVE', 'active');
define('PROJECT_STATUS_COMPLETED', 'completed');
define('PROJECT_STATUS_ON_HOLD', 'on_hold');
define('PROJECT_STATUS_ARCHIVED', 'archived');

// Priority Levels
define('PRIORITY_LOW', 'low');
define('PRIORITY_MEDIUM', 'medium');
define('PRIORITY_HIGH', 'high');
define('PRIORITY_CRITICAL', 'critical');

// ==========================================
// API CONFIGURATION
// ==========================================

// API Base URL
define('API_BASE_URL', 'https://api.example.com');

// API Key (for third-party services)
define('API_KEY', 'your_api_key_here');

// ==========================================
// FUNCTION: Get Database Connection
// ==========================================

/**
 * Returns MySQLi connection instance
 * @return mysqli
 */
function getDatabaseConnection() {
    static $connection;
    
    if (!isset($connection)) {
        $connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
        
        if ($connection->connect_error) {
            die("Connection failed: " . $connection->connect_error);
        }
        
        $connection->set_charset("utf8mb4");
    }
    
    return $connection;
}

// ==========================================
// FUNCTION: Log Activity
// ==========================================

/**
 * Log user activities
 * @param string $action
 * @param string $entity_type
 * @param int $entity_id
 * @param string $description
 */
function logActivity($action, $entity_type, $entity_id, $description = '') {
    // Implementation for activity logging
    // This is a placeholder
}

// ==========================================
// FUNCTION: Send Email
// ==========================================

/**
 * Send email notification
 * @param string $to
 * @param string $subject
 * @param string $message
 */
function sendEmail($to, $subject, $message) {
    // Implementation for email sending
    // This is a placeholder
}

?>
