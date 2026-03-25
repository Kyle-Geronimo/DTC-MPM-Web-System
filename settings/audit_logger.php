<?php
/**
 * Audit Logger
 * Tracks all user actions with detailed context for compliance and debugging.
 */

if (defined('AUDIT_LOGGER_LOADED')) return;
define('AUDIT_LOGGER_LOADED', true);

class AuditLogger {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->ensureTable();
    }

    /**
     * Ensure the audit_log table exists
     */
    private function ensureTable() {
        $this->conn->query("
            CREATE TABLE IF NOT EXISTS audit_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50),
                entity_id VARCHAR(100),
                old_values JSON,
                new_values JSON,
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user (user_id),
                INDEX idx_action (action),
                INDEX idx_entity (entity_type, entity_id),
                INDEX idx_created (created_at)
            )
        ");
    }

    /**
     * Log an action
     *
     * @param string $action      Action performed (e.g., 'create', 'update', 'delete', 'login')
     * @param string $entityType  Type of entity (e.g., 'project', 'task', 'user')
     * @param string $entityId    ID of the entity
     * @param array  $oldValues   Previous values (for updates)
     * @param array  $newValues   New values
     * @param int    $userId      User performing the action (null = current session user)
     */
    public function log($action, $entityType = null, $entityId = null, $oldValues = null, $newValues = null, $userId = null) {
        try {
            if ($userId === null) {
                $userId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;
            }

            $ip = $this->getClientIp();
            $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : '';
            $oldJson = $oldValues !== null ? json_encode($oldValues) : null;
            $newJson = $newValues !== null ? json_encode($newValues) : null;

            $stmt = $this->conn->prepare(
                "INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );

            if ($stmt) {
                $stmt->bind_param("isssssss", $userId, $action, $entityType, $entityId, $oldJson, $newJson, $ip, $ua);
                $stmt->execute();
                $stmt->close();
            }

            // Also insert into legacy activity_log for backward compatibility
            $this->legacyLog($userId, $action, $entityType, $entityId, $newValues);

        } catch (Exception $e) {
            error_log("AuditLogger error: " . $e->getMessage());
        }
    }

    /**
     * Write to legacy activity_log table
     */
    private function legacyLog($userId, $action, $entityType, $entityId, $newValues) {
        try {
            $description = ucfirst($action) . ' ' . ($entityType ?: 'item');
            if ($entityId) {
                $description .= " #$entityId";
            }
            if (is_array($newValues) && isset($newValues['name'])) {
                $description .= ": " . $newValues['name'];
            } elseif (is_array($newValues) && isset($newValues['title'])) {
                $description .= ": " . $newValues['title'];
            }

            $stmt = $this->conn->prepare(
                "INSERT INTO activity_log (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)"
            );
            if ($stmt) {
                $stmt->bind_param("issss", $userId, $action, $entityType, $entityId, $description);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
            // Silently fail — this is just for backwards compat
        }
    }

    /**
     * Get client IP address
     */
    private function getClientIp() {
        // Only trust REMOTE_ADDR to avoid spoofing
        return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    }

    /**
     * Get audit history for an entity
     */
    public function getEntityHistory($entityType, $entityId, $limit = 50) {
        $stmt = $this->conn->prepare(
            "SELECT al.*, u.full_name as user_name
             FROM audit_log al
             LEFT JOIN users u ON al.user_id = u.id
             WHERE al.entity_type = ? AND al.entity_id = ?
             ORDER BY al.created_at DESC
             LIMIT ?"
        );
        $stmt->bind_param("ssi", $entityType, $entityId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $history = [];
        while ($row = $result->fetch_assoc()) {
            $history[] = $row;
        }
        $stmt->close();
        return $history;
    }

    /**
     * Get user activity history
     */
    public function getUserHistory($userId, $limit = 50) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM audit_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
        );
        $stmt->bind_param("ii", $userId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $history = [];
        while ($row = $result->fetch_assoc()) {
            $history[] = $row;
        }
        $stmt->close();
        return $history;
    }

    /**
     * Get recent audit entries
     */
    public function getRecent($limit = 100) {
        $stmt = $this->conn->prepare(
            "SELECT al.*, u.full_name as user_name
             FROM audit_log al
             LEFT JOIN users u ON al.user_id = u.id
             ORDER BY al.created_at DESC
             LIMIT ?"
        );
        $stmt->bind_param("i", $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        $stmt->close();
        return $logs;
    }
}

/**
 * Get a singleton AuditLogger instance
 */
function get_audit_logger($conn) {
    static $instance = null;
    if ($instance === null) {
        $instance = new AuditLogger($conn);
    }
    return $instance;
}
?>
