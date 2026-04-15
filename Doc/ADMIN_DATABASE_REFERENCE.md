# Admin Panel Database Structure Reference

## Overview

This document describes the database tables used by the Admin Panel (`admin.html`) in the Project Management System.

---

## Database Tables Summary (20 Tables)

### Core Tables (11)
| Table Name | Purpose | Used In Admin Tab |
|------------|---------|-------------------|
| `users` | User accounts and authentication | Overview, Users Tab |
| `archived_users` | Audit trail - deleted/archived users | Users Tab, Activity Tab |
| `projects` | Project information and tracking | Overview, Projects Tab |
| `tasks` | Task assignments and tracking | Overview |
| `teams` | Team/department organization | Projects Tab |
| `team_members` | User-team relationships | Projects Tab |
| `activity_log` | System activity audit trail | Activity Tab, Overview |
| `password_reset_tokens` | Password reset requests | Password Resets Tab |
| `system_monitoring` | System performance metrics | Overview |
| `alerts` | System alerts and notifications | Overview, Alerts Tab |
| `reports` | Generated reports | Overview, Reports Tab |

### Communication Tables (5)
| Table Name | Purpose | Used In Admin Tab |
|------------|---------|-------------------|
| `chat_groups` | Team-linked group chats | Messaging Tab |
| `chat_group_members` | Group chat memberships | Messaging Tab |
| `chat_messages` | Group chat message storage | Messaging Tab |
| `message_read_status` | Message read tracking | Messaging Tab |
| `direct_messages` | Private person-to-person messages | Messages Tab |
| `notifications` | User notifications and alerts | Overview, Notifications Tab |

### File Management Tables (2)
| Table Name | Purpose | Used In Admin Tab |
|------------|---------|-------------------|
| `files` | Document and file storage with metadata | Files Tab |
| `file_subscriptions` | File access tracking and downloads | Files Tab |

### Configuration Table (1)
| Table Name | Purpose | Used In Admin Tab |
|------------|---------|-------------------|
| `settings` | User and system configuration | Settings Tab |

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

### � Files Tab

**Purpose:** Manage uploaded files and documents

**Tables Used:**
- `files` - File metadata and storage information
- `file_subscriptions` - File access and download tracking
- `users` - File owner information
- `projects` - Associated projects
- `tasks` - Associated tasks

**Key Operations:**
- View all uploaded files with metadata
- Track file downloads and access
- Manage file visibility and permissions
- Delete files (soft delete for audit trail)
- View file version history

---

### 💬 Messaging Tab

**Purpose:** Manage group chats and direct messages

**Tables Used:**
- `chat_groups` - Team chat rooms
- `chat_group_members` - Group memberships
- `chat_messages` - Message storage
- `message_read_status` - Read receipts
- `direct_messages` - Private messages
- `notifications` - Message notifications
- `users` - Message participants

**Key Operations:**
- View all chat groups
- Monitor message activity
- View user chat participation
- Track message delivery and read status

---

### 🗄️ Database Tab

**Purpose:** View database table statistics and schema info

**Tables Used:**
- `information_schema.TABLES` - MySQL metadata
- All 20 system tables

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

-- Get detailed schema info
SHOW TABLES;
DESCRIBE [table_name];
SHOW INDEX FROM [table_name];
```

---

## Table Relationships

```
users (Core)
  ├─→ archived_users (original_user_id, archived_by)
  ├─→ projects (created_by)
  ├─→ tasks (assigned_to)
  ├─→ team_members (user_id)
  ├─→ activity_log (user_id)
  ├─→ reports (created_by)
  ├─→ settings (user_id)
  ├─→ files (uploaded_by)
  ├─→ chat_group_members (user_id)
  ├─→ chat_messages (user_id)
  ├─→ message_read_status (user_id)
  ├─→ direct_messages (sender_id, receiver_id)
  └─→ notifications (user_id)

projects
  ├─→ tasks (project_id)
  ├─→ team_members (via teams)
  ├─→ files (project_id)
  ├─→ chat_groups (via teams)
  └─→ reports (via creation)

teams
  ├─→ team_members (team_id)
  ├─→ chat_groups (team_id) - ONE TO ONE
  └─→ projects (team_id)

chat_groups
  ├─→ chat_group_members (group_id)
  ├─→ chat_messages (group_id)
  └─→ teams (team_id) - ONE TO ONE

chat_messages
  ├─→ message_read_status (message_id)
  ├─→ chat_group_members (via group_id)
  ├─→ files (chat_message_id) - attachments
  └─→ users (user_id)

direct_messages
  ├─→ users (sender_id, receiver_id)
  └─→ files (message_id) - attachments

files
  ├─→ users (uploaded_by)
  ├─→ projects (project_id)
  ├─→ tasks (task_id)
  ├─→ chat_messages (chat_message_id)
  └─→ file_subscriptions (file_id)

file_subscriptions
  ├─→ files (file_id)
  └─→ users (user_id)
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

## Installation & Setup

**For complete installation instructions**, see: [`Doc/MYSQL_DATABASE_SCHEMA.md`](MYSQL_DATABASE_SCHEMA.md)

To create all 20 tables, run these SQL files:

```bash
# Main database schema (19 tables)
mysql -u root project_management_db < settings/database_setup.sql

# Messaging system (4 tables)
mysql -u root project_management_db < settings/messaging_schema.sql

# Additional schemas as needed
mysql -u root project_management_db < settings/password_reset_tokens.sql
mysql -u root project_management_db < settings/admin_database_structure.sql
```

Or in MySQL:

```sql
USE project_management_db;
SOURCE /path/to/settings/database_setup.sql;
SOURCE /path/to/settings/messaging_schema.sql;
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

### Archive Old Files (soft delete)
```sql
UPDATE files 
SET deleted_at = NOW() 
WHERE DATE_ADD(created_at, INTERVAL 90 DAY) < NOW() 
AND deleted_at IS NULL;
```

### Get User Login History
```sql
SELECT u.full_name, a.created_at
FROM activity_log a
JOIN users u ON a.user_id = u.id
WHERE a.action = 'login'
ORDER BY a.created_at DESC;
```

### Get Most Active Chat Groups
```sql
SELECT g.name, COUNT(m.id) as message_count
FROM chat_groups g
LEFT JOIN chat_messages m ON g.id = m.group_id
GROUP BY g.id
ORDER BY message_count DESC;
```

---

## Security Notes

1. **Passwords**: Always stored as SHA256 hashes using secure functions
2. **Activity Logging**: All admin actions automatically logged to activity_log
3. **Password Resets**: Require admin approval before changing passwords
4. **Token Expiration**: Reset tokens expire after 1 hour
5. **File Access**: Tracked in file_subscriptions for audit compliance
6. **Foreign Keys**: Use ON DELETE CASCADE/SET NULL with care for data integrity
7. **Soft Deletes**: Files use deleted_at instead of hard deletes for compliance
8. **Indexes**: Added on frequently queried columns for performance optimization
9. **Message Privacy**: Direct messages isolated, group messages team-scoped
10. **Data Retention**: Configure cleanup jobs for archived_users and old activity logs

---

## Version History

- **v1.0** (March 11, 2026) - Initial structure with password reset approval system
