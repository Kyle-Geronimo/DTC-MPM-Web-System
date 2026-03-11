<?php
/**
 * Reset Password Handler
 * Processes password reset with valid token
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
    'message' => ''
);

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

// Get POST data
$token = isset($_POST['token']) ? trim($_POST['token']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';
$confirmPassword = isset($_POST['confirm_password']) ? trim($_POST['confirm_password']) : '';

// Validate inputs
if (empty($token)) {
    $response['message'] = 'Reset token is required';
    echo json_encode($response);
    exit;
}

if (empty($password) || empty($confirmPassword)) {
    $response['message'] = 'Password fields are required';
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
    // Check if token is valid and not expired
    $stmt = $conn->prepare("SELECT email, expires_at, used FROM password_reset_tokens WHERE token = ? LIMIT 1");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $response['message'] = 'Invalid reset token. Please request a new password reset link.';
        echo json_encode($response);
        $stmt->close();
        exit;
    }
    
    $resetData = $result->fetch_assoc();
    $stmt->close();
    
    // Check if token has been used
    if ($resetData['used'] == 1) {
        $response['message'] = 'This reset link has already been used. Please request a new one.';
        echo json_encode($response);
        exit;
    }
    
    // Check if token has expired
    if (strtotime($resetData['expires_at']) < time()) {
        $response['message'] = 'This reset link has expired. Please request a new one.';
        echo json_encode($response);
        exit;
    }
    
    $email = $resetData['email'];
    
    // Hash new password using SHA256 (matching registration and login)
    $hashedPassword = hash('sha256', $password);
    
    // Update user password
    $updateStmt = $conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?");
    $updateStmt->bind_param("ss", $hashedPassword, $email);
    
    if ($updateStmt->execute()) {
        $updateStmt->close();
        
        // Mark token as used
        $markUsedStmt = $conn->prepare("UPDATE password_reset_tokens SET used = 1 WHERE token = ?");
        $markUsedStmt->bind_param("s", $token);
        $markUsedStmt->execute();
        $markUsedStmt->close();
        
        // Log the password reset activity
        $getUserStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $getUserStmt->bind_param("s", $email);
        $getUserStmt->execute();
        $userResult = $getUserStmt->get_result();
        
        if ($userResult->num_rows > 0) {
            $user = $userResult->fetch_assoc();
            $userId = $user['id'];
            
            $logStmt = $conn->prepare("INSERT INTO activity_log (user_id, action, entity_type, description) VALUES (?, 'password_reset', 'user', 'Password reset successfully')");
            $logStmt->bind_param("i", $userId);
            $logStmt->execute();
            $logStmt->close();
        }
        $getUserStmt->close();
        
        // Success response
        $response['success'] = true;
        $response['message'] = 'Your password has been reset successfully! You can now sign in with your new password.';
        
    } else {
        $response['message'] = 'Failed to update password. Please try again.';
    }
    
} catch (Exception $e) {
    $response['message'] = 'An error occurred. Please try again later.';
    error_log('Reset password error: ' . $e->getMessage());
}

echo json_encode($response);
$conn->close();
?>
