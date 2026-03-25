<?php
/**
 * Forgot Password Handler
 * Generates reset token and sends email with reset link
 */

// Disable error display (errors still logged)
ini_set('display_errors', '0');
error_reporting(E_ALL);

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
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$newPassword = isset($_POST['new_password']) ? trim($_POST['new_password']) : '';

// Validate email
if (empty($email)) {
    $response['message'] = 'Email address is required';
    echo json_encode($response);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Invalid email format';
    echo json_encode($response);
    exit;
}

// Validate password
if (empty($newPassword)) {
    $response['message'] = 'New password is required';
    echo json_encode($response);
    exit;
}

if (strlen($newPassword) < 6) {
    $response['message'] = 'Password must be at least 6 characters long';
    echo json_encode($response);
    exit;
}

try {
    // Check if email exists in database
    $stmt = $conn->prepare("SELECT id, full_name, email FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Email not found
        $response['message'] = 'Email address not found in our system.';
        echo json_encode($response);
        $stmt->close();
        exit;
    }
    
    $user = $result->fetch_assoc();
    $stmt->close();
    
    // Hash the new password
    $passwordHash = hash('sha256', $newPassword);
    
    // Generate unique reset token
    $token = bin2hex(random_bytes(32));
    
    // Set expiration time (1 hour from now)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Delete any existing tokens for this email
    $deleteStmt = $conn->prepare("DELETE FROM password_reset_tokens WHERE email = ?");
    $deleteStmt->bind_param("s", $email);
    $deleteStmt->execute();
    $deleteStmt->close();
    
    // Insert new reset token with password hash
    $insertStmt = $conn->prepare("INSERT INTO password_reset_tokens (email, token, new_password_hash, expires_at) VALUES (?, ?, ?, ?)");
    $insertStmt->bind_param("ssss", $email, $token, $passwordHash, $expiresAt);
    
    if ($insertStmt->execute()) {
        // Save insert ID before closing statement
        $requestId = $insertStmt->insert_id;
        $insertStmt->close();
        
        // Create reset link
        $resetLink = APP_URL . "/page/reset_password.php?token=" . $token;
        
        // Prepare email content
        $subject = "Password Reset Request - ProjectDashboard";
        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>📊 ProjectDashboard</h1>
                </div>
                <div class='content'>
                    <h2>Password Reset Request Submitted</h2>
                    <p>Hello " . htmlspecialchars($user['full_name']) . ",</p>
                    <p>We have received your password reset request for your ProjectDashboard account.</p>
                    <p><strong>Your request is pending admin approval.</strong></p>
                    <p>An administrator will review your request and approve or reject it. You will receive another email once your request has been processed.</p>
                    <p>If you didn't make this request, please contact your administrator immediately.</p>
                </div>
                <div class='footer'>
                    <p>This is an automated email from ProjectDashboard. Please do not reply.</p>
                    <p>&copy; 2026 ProjectDashboard. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // Email headers
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: ProjectDashboard <noreply@projectdashboard.local>" . "\r\n";
        
        // Send email (Note: for local development, you'll need to configure mail server)
        // For production, use PHPMailer or similar library
        $emailSent = @mail($email, $subject, $message, $headers);
        
        // For development/testing, log the reset link
        error_log("Password reset link for $email: $resetLink");
        
        // Always return success message
        $response['success'] = true;
        $response['message'] = 'Password reset request submitted successfully! An admin will review your request.';
        $response['debug_info'] = 'For development: Request ID ' . $requestId . ' created for ' . $email; // Remove in production
        
    } else {
        $response['message'] = 'Failed to generate reset token. Please try again.';
    }
    
} catch (Exception $e) {
    $response['message'] = 'An error occurred. Please try again later.';
    error_log('Forgot password error: ' . $e->getMessage());
}

echo json_encode($response);
$conn->close();
?>
