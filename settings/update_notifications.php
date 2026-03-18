<?php
/**
 * Update Notification Preferences
 * Handles saving user notification settings
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
$preference = isset($input['preference']) ? $input['preference'] : '';
$enabled = isset($input['enabled']) ? (bool)$input['enabled'] : false;

if (empty($preference)) {
    echo json_encode(['success' => false, 'message' => 'Preference name required']);
    exit;
}

try {
    // Check if user_preferences table exists, if not create it
    $conn->query("CREATE TABLE IF NOT EXISTS user_preferences (
        pref_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        pref_key VARCHAR(100) NOT NULL,
        pref_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_pref (user_id, pref_key),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Convert preference title to key
    $pref_key = 'notify_' . strtolower(str_replace(' ', '_', $preference));

    // Check if preference exists
    $stmt = $conn->prepare("SELECT pref_id FROM user_preferences WHERE user_id = ? AND pref_key = ?");
    $stmt->bind_param("is", $user_id, $pref_key);
    $stmt->execute();
    $result = $stmt->get_result();

    $pref_value = $enabled ? '1' : '0';

    if ($result->num_rows > 0) {
        // Update existing preference
        $stmt = $conn->prepare("UPDATE user_preferences SET pref_value = ? WHERE user_id = ? AND pref_key = ?");
        $stmt->bind_param("sis", $pref_value, $user_id, $pref_key);
    } else {
        // Insert new preference
        $stmt = $conn->prepare("INSERT INTO user_preferences (user_id, pref_key, pref_value) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $user_id, $pref_key, $pref_value);
    }

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Notification preference updated'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update preference']);
    }

} catch (Exception $e) {
    error_log("Notification preference error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
