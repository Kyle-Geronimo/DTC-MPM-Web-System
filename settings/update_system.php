<?php
/**
 * Update System Settings
 * Handles system-wide and user preference settings
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
$setting = isset($input['setting']) ? $input['setting'] : '';
$value = isset($input['value']) ? $input['value'] : '';

if (empty($setting)) {
    echo json_encode(['success' => false, 'message' => 'Setting name required']);
    exit;
}

try {
    // Ensure user_preferences table exists
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

    // Convert boolean values to string
    if (is_bool($value)) {
        $value = $value ? '1' : '0';
    }

    // Check if preference exists
    $stmt = $conn->prepare("SELECT pref_id FROM user_preferences WHERE user_id = ? AND pref_key = ?");
    $stmt->bind_param("is", $user_id, $setting);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update existing preference
        $stmt = $conn->prepare("UPDATE user_preferences SET pref_value = ? WHERE user_id = ? AND pref_key = ?");
        $stmt->bind_param("sis", $value, $user_id, $setting);
    } else {
        // Insert new preference
        $stmt = $conn->prepare("INSERT INTO user_preferences (user_id, pref_key, pref_value) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $user_id, $setting, $value);
    }

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Setting updated',
            'setting' => $setting,
            'value' => $value
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update setting']);
    }

} catch (Exception $e) {
    error_log("System setting update error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
