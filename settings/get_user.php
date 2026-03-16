<?php
/**
 * Get Current User API
 * Returns the logged-in user's profile info as JSON.
 * Falls back to a default "Admin" if no session exists.
 */
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'success'  => true,
        'username' => $_SESSION['username'] ?? 'User',
        'full_name'=> $_SESSION['full_name'] ?? $_SESSION['username'] ?? 'User',
        'email'    => $_SESSION['email'] ?? '',
        'role'     => $_SESSION['role'] ?? ''
    ]);
} else {
    // Fallback so the UI still renders a name
    echo json_encode([
        'success'  => true,
        'username' => 'Admin',
        'full_name'=> 'Admin User',
        'email'    => '',
        'role'     => 'Administrator'
    ]);
}
