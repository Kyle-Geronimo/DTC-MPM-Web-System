<?php
/**
 * Get Current User API
 * Returns the logged-in user's profile info as JSON.
 * Falls back to a default "Admin" if no session exists.
 */
session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

// Ensure database connection is available
if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_SESSION['user_id'])) {
    try {
        // Get latest user data from database
        $stmt = $conn->prepare("SELECT username, email, full_name, role, phone, bio FROM users WHERE id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            echo json_encode([
                'success'  => true,
                'id'       => $_SESSION['user_id'],
                'username' => $user['username'] ?? 'User',
                'full_name'=> $user['full_name'] ?? $user['username'] ?? 'User',
                'email'    => $user['email'] ?? '',
                'role'     => $user['role'] ?? '',
                'phone'    => $user['phone'] ?? '',
                'bio'      => $user['bio'] ?? ''
            ]);
        } else {
            // User not found in database, use session data
            echo json_encode([
                'success'  => true,
                'username' => $_SESSION['username'] ?? 'User',
                'full_name'=> $_SESSION['full_name'] ?? $_SESSION['username'] ?? 'User',
                'email'    => $_SESSION['email'] ?? '',
                'role'     => $_SESSION['role'] ?? '',
                'phone'    => '',
                'bio'      => ''
            ]);
        }
    } catch (Exception $e) {
        // Database error, fall back to session data
        error_log("get_user.php error: " . $e->getMessage());
        echo json_encode([
            'success'  => true,
            'username' => $_SESSION['username'] ?? 'User',
            'full_name'=> $_SESSION['full_name'] ?? $_SESSION['username'] ?? 'User',
            'email'    => $_SESSION['email'] ?? '',
            'role'     => $_SESSION['role'] ?? '',
            'phone'    => '',
            'bio'      => ''
        ]);
    }
} else {
    // Fallback so the UI still renders a name
    echo json_encode([
        'success'  => true,
        'username' => 'Admin',
        'full_name'=> 'Admin User',
        'email'    => '',
        'role'     => 'Administrator',
        'phone'    => '',
        'bio'      => ''
    ]);
}

