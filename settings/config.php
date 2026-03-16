<?php
/**
 * Application Configuration
 * This file contains all configuration settings
 */

// ==========================================
// DATABASE CONFIGURATION
// ==========================================
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'project_management_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// ==========================================
// APPLICATION CONFIGURATION
// ==========================================
define('APP_NAME', 'Project Management Dashboard');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost/ProjectDashboard');

// ==========================================
// SECURITY CONFIGURATION
// ==========================================
define('DEBUG_MODE', true);
define('SESSION_TIMEOUT', 30);
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);

// ==========================================
// EMAIL CONFIGURATION
// ==========================================
define('SMTP_HOST', 'smtp.mailtrap.io');
define('SMTP_PORT', 2525);
define('SMTP_USER', 'your_email@example.com');
define('SMTP_PASS', 'your_password');
define('FROM_EMAIL', 'noreply@projectdashboard.local');

// ==========================================
// PAGINATION
// ==========================================
define('ITEMS_PER_PAGE', 20);

// ==========================================
// FILE UPLOAD
// ==========================================
define('MAX_FILE_SIZE', 5);
define('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,pdf,doc,docx');
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// ==========================================
// TIME ZONE
// ==========================================
date_default_timezone_set('UTC');
?>
