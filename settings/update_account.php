<?php
/**
 * Update Account Settings
 * Handles updating user profile information
 */

session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

// Ensure database connection is available
if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$user_id = $_SESSION['user_id'];
$email = isset($input['email']) ? trim($input['email']) : '';
$full_name = isset($input['full_name']) ? trim($input['full_name']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$bio = isset($input['bio']) ? trim($input['bio']) : '';

// Validate required fields
if (empty($email) || empty($full_name)) {
    echo json_encode(['success' => false, 'message' => 'Email and name are required']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

try {
    // Check if email is already taken by another user
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->bind_param("si", $email, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already in use']);
        exit;
    }

    // Update user account
    $stmt = $conn->prepare("UPDATE users SET email = ?, full_name = ?, phone = ?, bio = ?, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param("ssssi", $email, $full_name, $phone, $bio, $user_id);
    
    if ($stmt->execute()) {
        // Update session data
        $_SESSION['full_name'] = $full_name;
        $_SESSION['email'] = $email;
        
        echo json_encode([
            'success' => true,
            'message' => 'Account settings updated successfully',
            'data' => [
                'email' => $email,
                'full_name' => $full_name,
                'phone' => $phone,
                'bio' => $bio
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update account']);
    }
    
} catch (Exception $e) {
    error_log("Account update error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
