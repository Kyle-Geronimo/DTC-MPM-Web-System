-- Password Reset Tokens Table
-- This table stores temporary password reset tokens

USE project_management_db;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used TINYINT(1) DEFAULT 0,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
);
