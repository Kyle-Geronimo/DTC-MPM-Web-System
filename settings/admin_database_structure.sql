-- =====================================================
-- ADMIN PANEL DATABASE STRUCTURE
-- Project Management & Monitoring System
-- Created: March 11, 2026
-- =====================================================

CREATE DATABASE IF NOT EXISTS project_management_db;
USE project_management_db;

-- =====================================================
-- 1. USERS TABLE
-- Stores user accounts and authentication data
-- Used in: Admin Overview, Users Tab
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,                    -- SHA256 hashed
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',                   -- user, admin, manager, developer, etc.
    status VARCHAR(20) DEFAULT 'active',               -- active, inactive, suspended
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_role (role),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. PROJECTS TABLE
-- Stores project information
-- Used in: Admin Overview, Projects Tab
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',               -- active, completed, on-hold, cancelled
    start_date DATE,
    end_date DATE,
    progress INT DEFAULT 0,                            -- 0-100
    team_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_progress (progress),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. TASKS TABLE
-- Stores project tasks and assignments
-- Used in: Admin Overview, Project Management
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    project_id INT,
    assigned_to INT,
    priority VARCHAR(20) DEFAULT 'medium',             -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'todo',                 -- todo, in-progress, completed, cancelled
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 4. TEAMS TABLE
-- Stores team/department information
-- Used in: Admin Projects Tab
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 5. TEAM_MEMBERS TABLE
-- Maps users to teams
-- Used in: Admin Team Management
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50),                                   -- team lead, member, etc.
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id),
    INDEX idx_team (team_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 6. ACTIVITY_LOG TABLE
-- Stores all system activity and audit trail
-- Used in: Admin Activity Tab, Recent System Activity
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                                        -- NULL for system activities
    action VARCHAR(100),                                -- login, logout, create, update, delete, etc.
    entity_type VARCHAR(50),                            -- user, project, task, etc.
    entity_id INT,
    description TEXT,                                   -- Detailed description of the action
    ip_address VARCHAR(45),                             -- IPv4 or IPv6
    user_agent TEXT,                                    -- Browser/client information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 7. PASSWORD_RESET_TOKENS TABLE
-- Stores password reset requests requiring admin approval
-- Used in: Admin Password Resets Tab
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,                        -- Unique reset token
    new_password_hash VARCHAR(255),                     -- SHA256 hashed new password
    approval_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    admin_id INT,                                       -- Admin who approved/rejected
    expires_at DATETIME NOT NULL,                       -- Token expiration (1 hour)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used TINYINT(1) DEFAULT 0,                         -- 0 = not used, 1 = used
    used_at DATETIME,                                   -- When password was actually changed
    
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires (expires_at),
    INDEX idx_status (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 8. SYSTEM_MONITORING TABLE
-- Stores system metrics and performance data
-- Used in: Admin Monitoring/Overview
-- =====================================================
CREATE TABLE IF NOT EXISTS system_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,                  -- CPU Usage, RAM Usage, Disk Space, etc.
    metric_value DECIMAL(10, 2),
    unit VARCHAR(20),                                   -- percent, MB, ms, etc.
    threshold_warning DECIMAL(10, 2),
    threshold_critical DECIMAL(10, 2),
    status VARCHAR(20),                                 -- normal, warning, critical
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric (metric_name),
    INDEX idx_recorded (recorded_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 9. ALERTS TABLE
-- Stores system alerts and notifications
-- Used in: Admin Overview/Alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,                    -- system, security, task, deadline, etc.
    subject VARCHAR(200) NOT NULL,
    message TEXT,
    severity VARCHAR(20),                               -- info, warning, critical
    status VARCHAR(20) DEFAULT 'active',                -- active, resolved, dismissed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT,                                    -- Admin user who resolved
    
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_type (alert_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 10. REPORTS TABLE
-- Stores generated reports
-- Used in: Admin Reports Tab
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    report_type VARCHAR(50),                            -- user_activity, project_summary, etc.
    content LONGTEXT,                                   -- JSON or HTML report content
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (report_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 11. SETTINGS TABLE
-- Stores user and system settings
-- Used in: Admin Settings Tab
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                                        -- NULL for global settings
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_setting (user_id, setting_key),
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- ADMIN PANEL VIEWS
-- Useful views for the admin panel
-- =====================================================

-- View: User Statistics
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
    role,
    COUNT(*) as total_users,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
FROM users
GROUP BY role;

-- View: Project Progress Summary
CREATE OR REPLACE VIEW admin_project_stats AS
SELECT 
    status,
    COUNT(*) as total_projects,
    AVG(progress) as avg_progress,
    SUM(CASE WHEN progress = 100 THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN progress < 100 AND status = 'active' THEN 1 ELSE 0 END) as in_progress_count
FROM projects
GROUP BY status;

-- View: Recent Activity Summary (Last 24 hours)
CREATE OR REPLACE VIEW admin_recent_activity AS
SELECT 
    a.id,
    a.action,
    a.entity_type,
    a.description,
    u.full_name as user_name,
    u.email as user_email,
    a.created_at
FROM activity_log a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY a.created_at DESC
LIMIT 100;

-- View: Pending Password Reset Requests
CREATE OR REPLACE VIEW admin_pending_resets AS
SELECT 
    pr.id,
    pr.email,
    u.full_name,
    pr.token,
    pr.approval_status,
    pr.created_at,
    pr.expires_at,
    CASE 
        WHEN pr.expires_at < NOW() THEN 'expired'
        WHEN pr.approval_status = 'pending' THEN 'pending'
        ELSE pr.approval_status
    END as status
FROM password_reset_tokens pr
LEFT JOIN users u ON pr.email = u.email
WHERE pr.used = 0
ORDER BY pr.created_at DESC;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, full_name, role, status) VALUES
('admin', 'admin@projectdashboard.local', SHA2('admin123', 256), 'System Administrator', 'admin', 'active');

-- Insert sample activity logs
INSERT IGNORE INTO activity_log (user_id, action, entity_type, description) VALUES
(1, 'login', 'system', 'User logged in successfully'),
(1, 'create', 'user', 'New user registered successfully'),
(1, 'update', 'project', 'Project status updated'),
(NULL, 'system', 'system', 'System maintenance completed');

-- =====================================================
-- ADMIN PANEL QUERIES REFERENCE
-- =====================================================

/*
-- Get Dashboard Statistics
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
    (SELECT COUNT(*) FROM tasks) as total_tasks,
    (SELECT COUNT(DISTINCT user_id) FROM activity_log WHERE DATE(created_at) = CURDATE()) as active_today;

-- Get All Users with Pagination
SELECT id, username, email, full_name, role, status, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;

-- Get All Projects
SELECT 
    p.id, 
    p.name, 
    p.status, 
    p.progress, 
    p.start_date, 
    p.end_date,
    u.full_name as created_by_name
FROM projects p
LEFT JOIN users u ON p.created_by = u.id
ORDER BY p.created_at DESC;

-- Get Recent Activity
SELECT 
    a.id,
    a.action,
    a.entity_type,
    a.description,
    u.full_name,
    a.created_at
FROM activity_log a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 50;

-- Get Password Reset Requests
SELECT 
    pr.id,
    pr.email,
    u.full_name,
    pr.token,
    pr.approval_status,
    pr.created_at,
    pr.expires_at,
    pr.used_at
FROM password_reset_tokens pr
LEFT JOIN users u ON pr.email = u.email
WHERE pr.used = 0
ORDER BY pr.created_at DESC;

-- Get Database Table Info
SELECT 
    TABLE_NAME as 'table',
    TABLE_ROWS as 'rows',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'size_mb'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'project_management_db'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
*/
