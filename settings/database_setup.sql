-- Project Management & Monitoring System Database Schema
-- Created: March 2026

-- Create Database
CREATE DATABASE IF NOT EXISTS project_management_db;
USE project_management_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_role (role)
);

-- Archived Users Table (stores snapshots of user records when archived)
CREATE TABLE IF NOT EXISTS archived_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_user_id INT NULL,
    username VARCHAR(50),
    email VARCHAR(100),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    department VARCHAR(50),
    role VARCHAR(50),
    status VARCHAR(20),
    data JSON NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_by INT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    INDEX idx_archived_at (archived_at),
    INDEX idx_original_user (original_user_id),
    FOREIGN KEY (archived_by) REFERENCES users(id)
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    progress INT DEFAULT 0,
    team_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_progress (progress)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    project_id INT,
    assigned_to INT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'todo',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to)
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_team_user (team_id, user_id)
);

-- System Monitoring Table
CREATE TABLE IF NOT EXISTS system_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 2),
    unit VARCHAR(20),
    threshold_warning DECIMAL(10, 2),
    threshold_critical DECIMAL(10, 2),
    status VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric (metric_name),
    INDEX idx_recorded (recorded_at)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    report_type VARCHAR(50),
    content LONGTEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_type (report_type),
    INDEX idx_created (created_at)
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT,
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_setting (user_id, setting_key)
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- ===========================
-- SAMPLE DATA INSERTION
-- ===========================

-- Insert Sample Users (only if they don't already exist)
INSERT IGNORE INTO users (username, email, password, full_name, phone, department, role, status) VALUES
('john_doe', 'john@example.com', SHA2('password123', 256), 'John Doe', '+1 234 567 8900', 'Backend', 'developer', 'active'),
('sarah_smith', 'sarah@example.com', SHA2('password123', 256), 'Sarah Smith', '+1 234 567 8901', 'Management', 'manager', 'active'),
('mike_johnson', 'mike@example.com', SHA2('password123', 256), 'Mike Johnson', '+1 234 567 8902', 'QA', 'qa_engineer', 'active'),
('emily_davis', 'emily@example.com', SHA2('password123', 256), 'Emily Davis', '+1 234 567 8903', 'Design', 'designer', 'active'),
('alex_chen', 'alex@example.com', SHA2('password123', 256), 'Alex Chen', '+1 234 567 8904', 'Infrastructure', 'devops', 'active');

-- Insert Sample Teams (only if they don't already exist)
INSERT IGNORE INTO teams (name, description) VALUES
('Frontend Team', 'Responsible for UI/UX development'),
('Backend Team', 'Handles server-side development'),
('QA Team', 'Testing and quality assurance'),
('Design Team', 'UI/UX design and branding'),
('DevOps Team', 'Infrastructure and deployment');

-- Insert Sample Projects (only if they don't already exist)
INSERT IGNORE INTO projects (name, description, status, start_date, end_date, progress, created_by) VALUES
('Website Redesign', 'Complete redesign of company website', 'active', '2026-01-15', '2026-03-20', 75, 1),
('Mobile App Development', 'iOS and Android mobile application', 'active', '2026-02-01', '2026-04-15', 60, 1),
('API Integration', 'Integration of third-party APIs', 'active', '2026-02-10', '2026-03-25', 90, 1),
('Database Migration', 'Migration to modern NoSQL', 'on-hold', '2026-03-01', '2026-05-10', 30, 1),
('Testing & QA', 'Comprehensive testing for v2.0', 'completed', '2026-01-10', '2026-03-08', 100, 1);

-- Insert Sample Tasks (only if they don't already exist)
INSERT IGNORE INTO tasks (title, description, project_id, assigned_to, priority, status, due_date) VALUES
('Update Database Schema', 'Modify schema to support new features', 1, 1, 'high', 'in-progress', '2026-03-15'),
('Code Review - PR #123', 'Review API endpoints', 2, 2, 'medium', 'completed', '2026-03-10'),
('Write Unit Tests', 'Tests for authentication module', 1, 3, 'medium', 'in-progress', '2026-03-18'),
('Design System UI', 'Create reusable UI components', 3, 4, 'high', 'in-progress', '2026-03-22'),
('Documentation Update', 'Update API documentation', 2, 5, 'low', 'todo', '2026-03-25');

-- Insert Sample System Monitoring Data (only if they don't already exist)
INSERT IGNORE INTO system_monitoring (metric_name, metric_value, unit, threshold_warning, threshold_critical, status) VALUES
('CPU Usage', 65.50, 'percent', 80, 95, 'normal'),
('RAM Usage', 75.20, 'percent', 80, 90, 'warning'),
('Disk Space', 45.30, 'percent', 85, 95, 'normal'),
('Network I/O', 35.10, 'percent', 80, 95, 'normal'),
('Database Response', 12, 'ms', 100, 200, 'normal');

-- Create Indexes for Better Performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_activity_user ON activity_log(user_id);

-- Confirm Database Creation
SELECT 'Database setup completed successfully!' AS Status;
