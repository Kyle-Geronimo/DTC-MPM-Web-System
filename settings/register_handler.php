<?php
/**
 * Registration Handler
 * Processes new user registration and stores in database
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
require_once('email_service.php');
require_once('notification_manager.php');

// Set header for JSON response
header('Content-Type: application/json');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION, 405);
}

// Validate inputs with Validator
    /** @noinspection PhpUndefinedClassInspection */
    $v = new Validator($_POST);
$v->required('firstname', 'First name')
  ->maxLength('firstname', 50, 'First name')
  ->required('lastname', 'Last name')
  ->maxLength('lastname', 50, 'Last name')
  ->required('email', 'Email')
  ->email('email', 'Email')
  ->required('password', 'Password')
  ->passwordStrength('password')
  ->required('confirm_password', 'Confirm password')
  ->matches('confirm_password', 'password', 'Confirm password', 'Password');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

$firstname = Validator::sanitize($v->get('firstname'));
$lastname = Validator::sanitize($v->get('lastname'));
$email = $v->get('email');
$password = $v->get('password');
$company = Validator::sanitize($v->get('company'));

$audit = get_audit_logger($conn);

try {
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $stmt->close();
        respond_error('An account with this email already exists.', ERR_VALIDATION, 409);
    }
    $stmt->close();
    
    // Generate username from email (before @ symbol)
    $username = strtolower(preg_replace('/[^a-z0-9]/', '', explode('@', $email)[0]));
    
    // Check if username exists, if so, append random number
    $checkUsername = $conn->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
    $checkUsername->bind_param("s", $username);
    $checkUsername->execute();
    $usernameResult = $checkUsername->get_result();
    
    if ($usernameResult->num_rows > 0) {
        $username = $username . rand(100, 999);
    }
    $checkUsername->close();
    
    // Hash password using SHA256 (matching login authentication)
    $hashedPassword = hash('sha256', $password);
    
    // Prepare full name
    $fullName = $firstname . ' ' . $lastname;
    
    // Set default department from company or 'General'
    $department = !empty($company) ? $company : 'General';
    
    // Insert new user into database
    $insertStmt = $conn->prepare("INSERT INTO users (username, email, password, full_name, department, role, status) VALUES (?, ?, ?, ?, ?, 'user', 'active')");
    $insertStmt->bind_param("sssss", $username, $email, $hashedPassword, $fullName, $department);
    
    if ($insertStmt->execute()) {
        $userId = $insertStmt->insert_id;
        $insertStmt->close();
        
        // Audit log
        $audit->log('register', 'user', (string)$userId, null, [
            'email' => $email,
            'full_name' => $fullName,
            'department' => $department
        ]);
        
        // Send welcome email
        $emailService = get_email_service($conn);
        $emailService->sendWelcome($email, $fullName);
        
        // Notify admins about new registration
        $nm = get_notification_manager($conn);
        $nm->notifyRole('admin', 'New User Registered', "$fullName ($email) has registered.", 'info', 'admin.html');
        
        respond_success([
            'redirect' => APP_URL . '/page/login.php'
        ], 'Account created successfully! Please login.');
    } else {
        respond_error('Registration failed. Please try again.', ERR_DATABASE, 500);
    }
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    respond_error('An error occurred during registration. Please try again later.', ERR_SERVER, 500);
}
?>
