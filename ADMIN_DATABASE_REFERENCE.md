# Admin Panel Database Structure Reference

## Overview

This document describes the database tables used by the Admin Panel (`admin.html`) in the Project Management System.

---

## Database Tables Summary

| Table Name | Purpose | Used In Admin Tab |
|------------|---------|-------------------|
| `users` | User accounts and authentication | Overview, Users Tab |
| `projects` | Project information | Overview, Projects Tab |
| `tasks` | Task assignments and tracking | Overview |
| `teams` | Team/department organization | Projects Tab |
| `team_members` | User-team relationships | Projects Tab |
| `activity_log` | System activity audit trail | Activity Tab, Overview |
| `password_reset_tokens` | Password reset requests | Password Resets Tab |
| `system_monitoring` | System performance metrics | Overview (if implemented) |
| `alerts` | System alerts and notifications | Overview |
| `reports` | Generated reports | Overview |
| `settings` | User and system settings | Settings Tab |

---

## Admin Panel Tabs and Their Database Tables

### 📈 Overview Tab

**Purpose:** Dashboard showing system statistics and recent activity

**Tables Used:**
- `users` - Count total users
- `projects` - Count active projects  
- `tasks` - Count total tasks
- `activity_log` - Count active users today, show recent activity

**Key Queries:**
```sql
-- Total Users
SELECT COUNT(*) as count FROM users;

-- Active Projects
SELECT COUNT(*) as count FROM projects WHERE status = 'active';

-- Total Tasks
SELECT COUNT(*) as count FROM tasks;

-- Active Today
SELECT COUNT(DISTINCT user_id) as count 
FROM activity_log 
WHERE DATE(created_at) = CURDATE();

-- Recent Activity
SELECT a.id, a.action, a.entity_type, a.description, 
       u.full_name, a.created_at
FROM activity_log a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 50;
```

---

### 👥 Users Tab

**Purpose:** Manage user accounts

**Tables Used:**
- `users` - All user data

**Key Queries:**
```sql
-- List all users
SELECT id, username, email, full_name, role, status, created_at
FROM users
ORDER BY created_at DESC;

-- Search users
SELECT * FROM users
WHERE full_name LIKE '%search%' 
   OR email LIKE '%search%'
   OR username LIKE '%search%';

-- Update user status
UPDATE users 
SET status = 'inactive' 
WHERE id = ?;

-- Delete user
DELETE FROM users WHERE id = ?;
```

---

### 📁 Projects Tab

**Purpose:** Manage projects and teams

**Tables Used:**
- `projects` - Project data
- `users` - Project creators
- `teams` - Team information

**Key Queries:**
```sql
-- List all projects
SELECT p.id, p.name, p.status, p.progress, 
       p.start_date, p.end_date,
       u.full_name as created_by_name
FROM projects p
LEFT JOIN users u ON p.created_by = u.id
ORDER BY p.created_at DESC;

-- Project statistics
SELECT 
    status,
    COUNT(*) as project_count,
    AVG(progress) as avg_progress
FROM projects
GROUP BY status;
```

---

### 📋 Activity Tab

**Purpose:** View and search system activity logs

**Tables Used:**
- `activity_log` - All system activities
- `users` - User information

**Key Queries:**
```sql
-- Recent activity
SELECT a.id, a.action, a.entity_type, a.description,
       u.full_name as user_name, a.created_at
FROM activity_log a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 100;

-- Filter by action
SELECT * FROM activity_log
WHERE action = 'login'
ORDER BY created_at DESC;

-- Today's activity
SELECT * FROM activity_log
WHERE DATE(created_at) = CURDATE()
ORDER BY created_at DESC;
```

---

### 🔐 Password Resets Tab

**Purpose:** Approve or reject password reset requests

**Tables Used:**
- `password_reset_tokens` - Reset requests
- `users` - User information for display and password updates
- `activity_log` - Log approval/rejection actions

**Key Queries:**
```sql
-- List all reset requests
SELECT pr.id, pr.email, u.full_name, pr.token,
       pr.approval_status, pr.created_at, pr.expires_at,
       CASE 
           WHEN pr.expires_at < NOW() THEN 'expired'
           WHEN pr.approval_status = 'pending' THEN 'pending'
           ELSE pr.approval_status
       END as status
FROM password_reset_tokens pr
LEFT JOIN users u ON pr.email = u.email
WHERE pr.used = 0
ORDER BY pr.created_at DESC;

-- Approve reset request
UPDATE users 
SET password = ? 
WHERE email = ?;

UPDATE password_reset_tokens
SET approval_status = 'approved',
    admin_id = ?,
    used = 1,
    used_at = NOW()
WHERE id = ?;

-- Reject reset request
UPDATE password_reset_tokens
SET approval_status = 'rejected',
    admin_id = ?
WHERE id = ?;
```

---

### ⚙️ Settings Tab

**Purpose:** Manage system and user settings

**Tables Used:**
- `settings` - Configuration settings

**Key Queries:**
```sql
-- Get all settings
SELECT * FROM settings
ORDER BY setting_key;

-- Get user-specific settings
SELECT * FROM settings
WHERE user_id = ?;

-- Update setting
INSERT INTO settings (user_id, setting_key, setting_value)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE setting_value = ?;
```

---

### 🗄️ Database Tab

**Purpose:** View database table statistics

**Tables Used:**
- `information_schema.TABLES` - MySQL metadata

**Key Queries:**
```sql
-- Get all table info
SELECT 
    TABLE_NAME as 'table',
    TABLE_ROWS as 'rows',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'size_mb'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'project_management_db'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

---

## Table Relationships

```
users
  ├─→ projects (created_by)
  ├─→ tasks (assigned_to)
  ├─→ team_members (user_id)
  ├─→ activity_log (user_id)
  ├─→ reports (created_by)
  └─→ settings (user_id)

projects
  ├─→ tasks (project_id)
  └─→ teams (team_id)

teams
  └─→ team_members (team_id)

password_reset_tokens
  └─→ users (admin_id - who approved)
```

---

## Database Schema Details

### Core Tables

#### 1. `users`
Stores all user accounts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `username` | VARCHAR(50) | Unique username |
| `email` | VARCHAR(100) | Unique email |
| `password` | VARCHAR(255) | SHA256 hashed password |
| `full_name` | VARCHAR(100) | User's full name |
| `role` | VARCHAR(50) | User role (admin, user, etc.) |
| `status` | VARCHAR(20) | active, inactive, suspended |
| `created_at` | TIMESTAMP | Registration date |

#### 2. `projects`
Stores project information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `name` | VARCHAR(100) | Project name |
| `status` | VARCHAR(50) | active, completed, on-hold |
| `progress` | INT | 0-100 percentage |
| `start_date` | DATE | Project start date |
| `end_date` | DATE | Project end date |
| `created_by` | INT | Foreign key to users |

#### 3. `activity_log`
Audit trail of all system activities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `user_id` | INT | User who performed action |
| `action` | VARCHAR(100) | Action type (login, create, etc.) |
| `entity_type` | VARCHAR(50) | Type of entity affected |
| `description` | TEXT | Detailed description |
| `created_at` | TIMESTAMP | When action occurred |

#### 4. `password_reset_tokens`
Password reset requests requiring admin approval.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `email` | VARCHAR(100) | User's email |
| `token` | VARCHAR(255) | Unique reset token |
| `new_password_hash` | VARCHAR(255) | SHA256 hashed new password |
| `approval_status` | ENUM | pending, approved, rejected |
| `admin_id` | INT | Admin who approved/rejected |
| `expires_at` | DATETIME | Token expiration (1 hour) |
| `used` | TINYINT(1) | 0 = unused, 1 = used |
| `used_at` | DATETIME | When password was changed |

---

## API Endpoints Used by Admin Panel

The admin panel uses `admin_api.php` which provides these endpoints:

| Action | Purpose | Tables Used |
|--------|---------|-------------|
| `overview` | Get dashboard statistics | users, projects, tasks, activity_log |
| `users` | List all users | users |
| `projects` | List all projects | projects, users |
| `activity` | Get activity logs | activity_log, users |
| `password_resets` | Get reset requests | password_reset_tokens, users |
| `approve_reset` | Approve password reset | password_reset_tokens, users, activity_log |
| `reject_reset` | Reject password reset | password_reset_tokens |
| `database_info` | Get table statistics | information_schema.TABLES |

---

## Installation

To create all these tables, run:

```bash
mysql -u root < ADMIN_DATABASE_STRUCTURE.sql
```

Or in MySQL:

```sql
SOURCE /path/to/ADMIN_DATABASE_STRUCTURE.sql;
```

---

## Maintenance Queries

### Clean Up Old Activity Logs (older than 90 days)
```sql
DELETE FROM activity_log 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Clean Up Expired Password Reset Tokens
```sql
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() AND used = 0;
```

### Get User Login History
```sql
SELECT u.full_name, a.created_at
FROM activity_log a
JOIN users u ON a.user_id = u.id
WHERE a.action = 'login'
ORDER BY a.created_at DESC;
```

---

## Security Notes

1. **Passwords**: Always stored as SHA256 hashes
2. **Activity Logging**: All admin actions should be logged
3. **Password Resets**: Require admin approval before changing passwords
4. **Token Expiration**: Reset tokens expire after 1 hour
5. **Foreign Keys**: Use ON DELETE CASCADE/SET NULL appropriately
6. **Indexes**: Added on frequently queried columns for performance

---

## Version History

- **v1.0** (March 11, 2026) - Initial structure with password reset approval system
