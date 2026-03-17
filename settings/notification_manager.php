<?php
/**
 * Notification Manager
 * Creates, retrieves, and manages in-app notifications.
 */

if (defined('NOTIFICATION_MANAGER_LOADED')) return;
define('NOTIFICATION_MANAGER_LOADED', true);

class NotificationManager {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->ensureTable();
    }

    private function ensureTable() {
        $this->conn->query("
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL DEFAULT 'info',
                title VARCHAR(200) NOT NULL,
                message TEXT,
                link VARCHAR(500),
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_read (user_id, is_read),
                INDEX idx_created (created_at)
            )
        ");
    }

    /**
     * Create a notification for a specific user
     *
     * @param int    $userId  Target user ID
     * @param string $title   Notification title
     * @param string $message Notification body
     * @param string $type    Type: info, success, warning, error, task, project
     * @param string $link    Optional link to navigate to
     */
    public function notify($userId, $title, $message = '', $type = 'info', $link = '') {
        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)"
            );
            if ($stmt) {
                $stmt->bind_param("issss", $userId, $type, $title, $message, $link);
                $stmt->execute();
                $stmt->close();
                return true;
            }
        } catch (Exception $e) {
            error_log("NotificationManager error: " . $e->getMessage());
        }
        return false;
    }

    /**
     * Notify all users (broadcast)
     */
    public function notifyAll($title, $message = '', $type = 'info', $link = '') {
        try {
            $result = $this->conn->query("SELECT id FROM users WHERE status = 'active'");
            while ($row = $result->fetch_assoc()) {
                $this->notify($row['id'], $title, $message, $type, $link);
            }
            return true;
        } catch (Exception $e) {
            error_log("NotificationManager broadcast error: " . $e->getMessage());
        }
        return false;
    }

    /**
     * Notify all users with a specific role
     */
    public function notifyRole($role, $title, $message = '', $type = 'info', $link = '') {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE role = ? AND status = 'active'");
            $stmt->bind_param("s", $role);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $this->notify($row['id'], $title, $message, $type, $link);
            }
            $stmt->close();
            return true;
        } catch (Exception $e) {
            error_log("NotificationManager role notify error: " . $e->getMessage());
        }
        return false;
    }

    /**
     * Get notifications for a user
     */
    public function getForUser($userId, $limit = 20, $unreadOnly = false) {
        $sql = "SELECT * FROM notifications WHERE user_id = ?";
        if ($unreadOnly) {
            $sql .= " AND is_read = 0";
        }
        $sql .= " ORDER BY created_at DESC LIMIT ?";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $userId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $notifications = [];
        while ($row = $result->fetch_assoc()) {
            $row['time_ago'] = $this->timeAgo($row['created_at']);
            $notifications[] = $row;
        }
        $stmt->close();
        return $notifications;
    }

    /**
     * Get unread count for a user
     */
    public function getUnreadCount($userId) {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return intval($row['count']);
    }

    /**
     * Mark a notification as read
     */
    public function markRead($notificationId, $userId) {
        $stmt = $this->conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $notificationId, $userId);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        return $affected > 0;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllRead($userId) {
        $stmt = $this->conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        return $affected;
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    public function cleanup($days = 30) {
        $stmt = $this->conn->prepare("DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND is_read = 1");
        $stmt->bind_param("i", $days);
        $stmt->execute();
        $stmt->close();
    }

    /**
     * Human-readable time ago
     */
    private function timeAgo($datetime) {
        $now = new DateTime();
        $past = new DateTime($datetime);
        $diff = $now->diff($past);

        if ($diff->y > 0) return $diff->y . 'y ago';
        if ($diff->m > 0) return $diff->m . 'mo ago';
        if ($diff->d > 0) return $diff->d . 'd ago';
        if ($diff->h > 0) return $diff->h . 'h ago';
        if ($diff->i > 0) return $diff->i . 'm ago';
        return 'Just now';
    }
}

/**
 * Get a singleton NotificationManager instance
 */
function get_notification_manager($conn) {
    static $instance = null;
    if ($instance === null) {
        $instance = new NotificationManager($conn);
    }
    return $instance;
}
?>
