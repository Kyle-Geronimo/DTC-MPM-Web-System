<?php
/**
 * Authentication Handler
 * Processes login requests and manages user sessions
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Include configuration and database connection
require_once('config.php');
require_once('db_connect.php');
/** @var mysqli $conn */
require_once('error_handler.php');
require_once('validator.php');
use Validator;
require_once('audit_logger.php');
require_once('notification_manager.php');

// Set header for JSON response
header('Content-Type: application/json');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION, 405);
}

// Validate inputs
$v = new Validator($_POST);
$v->required('email', 'Email')
  ->email('email', 'Email')
  ->required('password', 'Password');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

$email = $v->get('email');
$password = $v->get('password');
$remember = isset($_POST['remember']) ? $_POST['remember'] : false;

$audit = get_audit_logger($conn);

try {
    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, username, email, password, full_name, role, status, department FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if user exists
    if ($result->num_rows === 0) {
        $audit->log('login_failed', 'user', null, null, ['email' => $email, 'reason' => 'not_found']);
        respond_error('Invalid email or password', ERR_AUTH, 401);
    }
    
    $user = $result->fetch_assoc();
    
    // Check if account is active
    if ($user['status'] !== 'active') {
        $audit->log('login_failed', 'user', (string)$user['id'], null, ['reason' => 'inactive']);
        respond_error('Your account is inactive. Please contact administrator.', ERR_AUTH, 403);
    }
    
    // Verify password (using SHA2-256 as per database setup)
    $hashedPassword = hash('sha256', $password);
    
    if (!hash_equals($user['password'], $hashedPassword)) {
        $audit->log('login_failed', 'user', (string)$user['id'], null, ['reason' => 'bad_password']);
        respond_error('Invalid email or password', ERR_AUTH, 401);
    }
    
    // Regenerate session ID on login to prevent fixation
    session_regenerate_id(true);
    
    // Login successful - Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['department'] = $user['department'];
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    $_SESSION['last_regen'] = time();
    // Session fingerprint for hijacking prevention
    $_SESSION['fingerprint'] = md5(
        ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') .
        ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')
    );
    // Generate CSRF token
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    
    // Set remember me cookie if checked (7 days) and persist token to DB
    if ($remember) {
        $cookieToken = bin2hex(random_bytes(32));
        $cookieExpires = time() + (86400 * 7);
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        setcookie('remember_token', $cookieToken, [
            'expires' => $cookieExpires,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => $secure
        ]);

        // Store a hashed token in the database for validation (rotate-able)
        $tokenHash = hash('sha256', $cookieToken);
        try {
            // Create table if it doesn't exist
            $conn->query("CREATE TABLE IF NOT EXISTS remember_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token_hash VARCHAR(128) NOT NULL,
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                expires_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_user (user_id),
                INDEX idx_token (token_hash)
            )");

            $insert = $conn->prepare("INSERT INTO remember_tokens (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : '';
            $expiresAt = date('Y-m-d H:i:s', $cookieExpires);
            if ($insert) {
                $insert->bind_param("issss", $user['id'], $tokenHash, $ip, $ua, $expiresAt);
                $insert->execute();
                $insert->close();
            }
        } catch (Exception $e) {
            // Non-critical: don't fail login if token storage fails
        }
    }
    
    // Update last_login timestamp
    $updateLogin = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $updateLogin->bind_param("i", $user['id']);
    $updateLogin->execute();
    $updateLogin->close();
    
    // Track session in database
    $sessionId = session_id();
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : '';
    try {
        $conn->query("CREATE TABLE IF NOT EXISTS user_sessions (
            id VARCHAR(128) PRIMARY KEY,
            user_id INT NOT NULL,
            ip_address VARCHAR(45),
            user_agent VARCHAR(500),
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_activity (last_activity)
        )");
        $sessStmt = $conn->prepare("INSERT INTO user_sessions (id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE last_activity = NOW()");
        $sessStmt->bind_param("siss", $sessionId, $user['id'], $ip, $ua);
        $sessStmt->execute();
        $sessStmt->close();
    } catch (Exception $e) {
        // Non-critical
    }
    
    // Audit log
    $audit->log('login', 'user', (string)$user['id'], null, ['email' => $user['email']]);
    
    // Create welcome-back notification
    $nm = get_notification_manager($conn);
    $nm->notify($user['id'], 'Welcome back!', 'You logged in successfully.', 'info');
    
    $stmt->close();
    
    // Success response
    respond_success([
        'redirect' => APP_URL . '/page/front_panel.html',
        'user' => [
            'name' => $user['full_name'],
            'role' => $user['role']
        ],
        'csrf_token' => $_SESSION['csrf_token']
    ], 'Login successful! Redirecting...');
    
} catch (Exception $e) {
    error_log("Authentication error: " . $e->getMessage());
    respond_error('An error occurred. Please try again later.', ERR_SERVER, 500);
}
?>
