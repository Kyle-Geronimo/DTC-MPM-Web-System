<?php
/**
 * Authentication Handler
 * Processes login requests and manages user sessions
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
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';
$remember = isset($_POST['remember']) ? $_POST['remember'] : false;

// Validate inputs
if (empty($email) || empty($password)) {
    $response['message'] = 'Email and password are required';
    echo json_encode($response);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Invalid email format';
    echo json_encode($response);
    exit;
}

try {
    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, username, email, password, full_name, role, status, department FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if user exists
    if ($result->num_rows === 0) {
        $response['message'] = 'Invalid email or password';
        echo json_encode($response);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Check if account is active
    if ($user['status'] !== 'active') {
        $response['message'] = 'Your account is inactive. Please contact administrator.';
        echo json_encode($response);
        exit;
    }
    
    // Verify password (using SHA2-256 as per database setup)
    $hashedPassword = hash('sha256', $password);
    
    if ($hashedPassword !== $user['password']) {
        $response['message'] = 'Invalid email or password';
        echo json_encode($response);
        exit;
    }
    
    // Login successful - Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['department'] = $user['department'];
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();
    
    // Set remember me cookie if checked (7 days)
    if ($remember) {
        $cookieToken = bin2hex(random_bytes(32));
        setcookie('remember_token', $cookieToken, time() + (86400 * 7), '/');
        // Note: In production, store this token in database for validation
    }
    
    // Log the login activity
    $logStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, description) VALUES (?, 'login', 'user', 'User logged in successfully')");
    $logStmt->bind_param("i", $user['id']);
    $logStmt->execute();
    $logStmt->close();
    
    $stmt->close();
    
    // Success response
    $response['success'] = true;
    $response['message'] = 'Login successful! Redirecting...';
    $response['redirect'] = APP_URL . '/page/dashboard.html';
    $response['user'] = array(
        'name' => $user['full_name'],
        'role' => $user['role']
    );
    
} catch (Exception $e) {
    $response['message'] = 'An error occurred. Please try again later.';
    // In production, log the error instead of displaying it
    // error_log($e->getMessage());
}

echo json_encode($response);
$conn->close();
?>
