-- ================================================
-- Schema Updates for New Features
-- Run after database_setup.sql
-- ================================================

USE project_management_db;

-- ================================================
-- NOTIFICATIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    title VARCHAR(200) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
);

-- ================================================
-- AUDIT LOG TABLE (enhanced)
-- ================================================
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
);

-- ================================================
-- USER SESSIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_activity (last_activity)
);

-- ================================================
-- EMAIL QUEUE TABLE
-- ================================================
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
);

-- ================================================
-- ADD last_login COLUMN TO users IF NOT EXISTS
-- ================================================
-- (MySQL doesn't support IF NOT EXISTS for columns, use a procedure)
DROP PROCEDURE IF EXISTS add_last_login_column;
DELIMITER //
CREATE PROCEDURE add_last_login_column()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;
    END IF;
END //
DELIMITER ;
CALL add_last_login_column();
DROP PROCEDURE IF EXISTS add_last_login_column;

-- ================================================
-- ADD estimated_hours COLUMN TO tasks IF NOT EXISTS
-- ================================================
DROP PROCEDURE IF EXISTS add_estimated_hours_column;
DELIMITER //
CREATE PROCEDURE add_estimated_hours_column()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tasks'
        AND COLUMN_NAME = 'estimated_hours'
    ) THEN
        ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(5,1) DEFAULT 0;
    END IF;
END //
DELIMITER ;
CALL add_estimated_hours_column();
DROP PROCEDURE IF EXISTS add_estimated_hours_column;

-- ================================================
-- ADD budget/spent COLUMNS TO projects IF NOT EXISTS
-- ================================================
DROP PROCEDURE IF EXISTS add_project_budget_columns;
DELIMITER //
CREATE PROCEDURE add_project_budget_columns()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'projects'
        AND COLUMN_NAME = 'budget'
    ) THEN
        ALTER TABLE projects ADD COLUMN budget DECIMAL(12,2) DEFAULT NULL;
    END IF;
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'projects'
        AND COLUMN_NAME = 'spent'
    ) THEN
        ALTER TABLE projects ADD COLUMN spent DECIMAL(12,2) DEFAULT NULL;
    END IF;
END //
DELIMITER ;
CALL add_project_budget_columns();
DROP PROCEDURE IF EXISTS add_project_budget_columns;
