<?php
/**
 * Email Service
 * Handles sending emails and managing the email queue.
 * Uses PHP mail() with fallback queue for failed sends.
 */

if (defined('EMAIL_SERVICE_LOADED')) return;
define('EMAIL_SERVICE_LOADED', true);

require_once(__DIR__ . '/config.php');

class EmailService {
    private $conn;
    private $fromEmail;
    private $fromName;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->fromEmail = defined('FROM_EMAIL') ? FROM_EMAIL : 'noreply@projectdashboard.local';
        $this->fromName = defined('APP_NAME') ? APP_NAME : 'Project Dashboard';
        $this->ensureTable();
    }

    private function ensureTable() {
        $this->conn->query("
            CREATE TABLE IF NOT EXISTS email_queue (
                id INT AUTO_INCREMENT PRIMARY KEY,
                to_email VARCHAR(255) NOT NULL,
                to_name VARCHAR(100),
                subject VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
                attempts INT DEFAULT 0,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sent_at TIMESTAMP NULL,
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            )
        ");
    }

    /**
     * Send an email immediately (or queue it on failure)
     */
    public function send($toEmail, $subject, $body, $toName = '') {
        // Queue it first
        $queueId = $this->queue($toEmail, $subject, $body, $toName);

        // Try to send
        $sent = $this->doSend($toEmail, $toName, $subject, $body);

        if ($sent) {
            $this->markSent($queueId);
            return true;
        } else {
            $this->markFailed($queueId, 'PHP mail() returned false');
            return false;
        }
    }

    /**
     * Queue an email for later sending
     */
    public function queue($toEmail, $subject, $body, $toName = '') {
        $stmt = $this->conn->prepare(
            "INSERT INTO email_queue (to_email, to_name, subject, body) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("ssss", $toEmail, $toName, $subject, $body);
        $stmt->execute();
        $id = $stmt->insert_id;
        $stmt->close();
        return $id;
    }

    /**
     * Process the email queue (call from cron or manually)
     */
    public function processQueue($limit = 10) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM email_queue WHERE status = 'pending' AND attempts < 3 ORDER BY created_at ASC LIMIT ?"
        );
        $stmt->bind_param("i", $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $processed = 0;

        while ($row = $result->fetch_assoc()) {
            $sent = $this->doSend($row['to_email'], $row['to_name'], $row['subject'], $row['body']);
            if ($sent) {
                $this->markSent($row['id']);
                $processed++;
            } else {
                $this->markFailed($row['id'], 'Send attempt failed');
            }
        }
        $stmt->close();
        return $processed;
    }

    /**
     * Actually send the email
     */
    private function doSend($toEmail, $toName, $subject, $body) {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $headers .= "Reply-To: {$this->fromEmail}\r\n";
        $headers .= "X-Mailer: ProjectDashboard/1.0\r\n";

        $to = !empty($toName) ? "$toName <$toEmail>" : $toEmail;

        return @mail($to, $subject, $body, $headers);
    }

    private function markSent($id) {
        $stmt = $this->conn->prepare("UPDATE email_queue SET status = 'sent', sent_at = NOW() WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
    }

    private function markFailed($id, $error) {
        $stmt = $this->conn->prepare(
            "UPDATE email_queue SET status = IF(attempts >= 2, 'failed', 'pending'), attempts = attempts + 1, error_message = ? WHERE id = ?"
        );
        $stmt->bind_param("si", $error, $id);
        $stmt->execute();
        $stmt->close();
    }

    // ==========================================
    // EMAIL TEMPLATES
    // ==========================================

    /**
     * Build the standard email wrapper
     */
    private function wrapTemplate($content) {
        return "
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .email-container { max-width: 600px; margin: 0 auto; background: #fff; }
                .email-header { background: linear-gradient(135deg, #800000 0%, #660000 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
                .email-header h1 { margin: 0; font-size: 22px; }
                .email-body { padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; }
                .email-footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
                .btn { display: inline-block; background: #800000; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 600; }
                .info-box { background: #E0CCCC; border: 1px solid #D4A0A0; border-radius: 6px; padding: 16px; margin: 16px 0; }
            </style>
        </head>
        <body>
            <div class='email-container'>
                <div class='email-header'>
                    <h1>{$this->fromName}</h1>
                </div>
                <div class='email-body'>
                    $content
                </div>
                <div class='email-footer'>
                    <p>This is an automated email. Please do not reply.</p>
                    <p>&copy; " . date('Y') . " {$this->fromName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    /**
     * Send welcome email to new user
     */
    public function sendWelcome($toEmail, $fullName) {
        $content = "
            <h2>Welcome to {$this->fromName}!</h2>
            <p>Hello " . htmlspecialchars($fullName) . ",</p>
            <p>Your account has been created successfully. You can now log in and start managing your projects.</p>
            <div class='info-box'>
                <strong>Getting Started:</strong>
                <ul>
                    <li>Log in with your email and password</li>
                    <li>Create your first project</li>
                    <li>Assign tasks to team members</li>
                    <li>Track progress on the dashboard</li>
                </ul>
            </div>
            <a href='" . APP_URL . "/page/login.php' class='btn'>Log In Now</a>
        ";
        return $this->send($toEmail, "Welcome to {$this->fromName}", $this->wrapTemplate($content), $fullName);
    }

    /**
     * Send task assignment notification email
     */
    public function sendTaskAssigned($toEmail, $fullName, $taskTitle, $dueDate, $priority) {
        $content = "
            <h2>New Task Assigned</h2>
            <p>Hello " . htmlspecialchars($fullName) . ",</p>
            <p>A new task has been assigned to you:</p>
            <div class='info-box'>
                <strong>" . htmlspecialchars($taskTitle) . "</strong><br>
                <small>Priority: " . ucfirst(htmlspecialchars($priority)) . " | Due: " . htmlspecialchars($dueDate) . "</small>
            </div>
            <a href='" . APP_URL . "/page/tasks.html' class='btn'>View Tasks</a>
        ";
        return $this->send($toEmail, "New Task: " . $taskTitle, $this->wrapTemplate($content), $fullName);
    }

    /**
     * Send project created notification email
     */
    public function sendProjectCreated($toEmail, $fullName, $projectName) {
        $content = "
            <h2>New Project Created</h2>
            <p>Hello " . htmlspecialchars($fullName) . ",</p>
            <p>A new project has been created:</p>
            <div class='info-box'>
                <strong>" . htmlspecialchars($projectName) . "</strong>
            </div>
            <a href='" . APP_URL . "/page/projects.html' class='btn'>View Projects</a>
        ";
        return $this->send($toEmail, "New Project: " . $projectName, $this->wrapTemplate($content), $fullName);
    }

    /**
     * Send password reset confirmation email
     */
    public function sendPasswordResetConfirmation($toEmail, $fullName) {
        $content = "
            <h2>Password Reset Successful</h2>
            <p>Hello " . htmlspecialchars($fullName) . ",</p>
            <p>Your password has been reset successfully. You can now log in with your new password.</p>
            <div class='info-box'>
                <strong>Security Notice:</strong> If you did not request this change, please contact your administrator immediately.
            </div>
            <a href='" . APP_URL . "/page/login.php' class='btn'>Log In</a>
        ";
        return $this->send($toEmail, "Password Reset Confirmation", $this->wrapTemplate($content), $fullName);
    }
}

/**
 * Get a singleton EmailService instance
 */
function get_email_service($conn) {
    static $instance = null;
    if ($instance === null) {
        $instance = new EmailService($conn);
    }
    return $instance;
}
?>
