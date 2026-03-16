<?php
/**
 * Registration Handler
 * Processes new user registration and stores in database
 */

session_start();

// Include configuration and database connection
require_once('config.php');
require_once('db_connect.php');

// Set header for JSON response
header('Content-Type: application/json');

// Initialize response array
$response = array(
    'success' => false,
    'message' => '',
    'redirect' => ''
);

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

// Get POST data
$firstname = isset($_POST['firstname']) ? trim($_POST['firstname']) : '';
$lastname = isset($_POST['lastname']) ? trim($_POST['lastname']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';
$confirmPassword = isset($_POST['confirm_password']) ? trim($_POST['confirm_password']) : '';
$company = isset($_POST['company']) ? trim($_POST['company']) : '';

// Validate inputs
if (empty($firstname) || empty($lastname) || empty($email) || empty($password)) {
    $response['message'] = 'All required fields must be filled';
    echo json_encode($response);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Invalid email format';
    echo json_encode($response);
    exit;
}

// Validate password length
if (strlen($password) < 8) {
    $response['message'] = 'Password must be at least 8 characters long';
    echo json_encode($response);
    exit;
}

// Check if passwords match
if ($password !== $confirmPassword) {
    $response['message'] = 'Passwords do not match';
    echo json_encode($response);
    exit;
}

try {
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $response['message'] = 'An account with this email already exists';
        echo json_encode($response);
        $stmt->close();
        exit;
    }
    $stmt->close();
    
    // Generate username from email (before @ symbol)
    $username = strtolower(explode('@', $email)[0]);
    
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
        
        // Log the registration activity
        $logStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, description) VALUES (?, 'register', 'user', 'New user registered successfully')");
        $logStmt->bind_param("i", $userId);
        $logStmt->execute();
        $logStmt->close();
        
        $insertStmt->close();
        
        // Success response
        $response['success'] = true;
        $response['message'] = 'Account created successfully! Please login.';
        $response['redirect'] = APP_URL . '/page/login.php';
        
    } else {
        $response['message'] = 'Registration failed. Please try again.';
    }
    
} catch (Exception $e) {
    $response['message'] = 'An error occurred during registration. Please try again later.';
    $response['error_details'] = $e->getMessage(); // Debug only - remove in production
    // In production, log the error instead of displaying it
    error_log($e->getMessage());
}

echo json_encode($response);
$conn->close();
?>
