# 📊 MySQL Database Schema & Structure Guide

**Project:** Digital Transformation Center - Project Management System
**Last Updated:** April 15, 2026
**Database Name:** `project_management_db`

---

## 📋 Table of Contents

1. [Database Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Data Models & Structure](#data-models--structure)
4. [MySQL Creation Statements](#mysql-creation-statements)
5. [File Storage System](#file-storage-system)
6. [Setup Instructions](#setup-instructions)

---

## Overview

This Project Management System uses **20 integrated tables** organized into logical groups:

### Table Organization

| Category | Tables | Purpose |
|----------|--------|---------|
| **Authentication & Users** | users, archived_users, password_reset_tokens | User accounts and security |
| **Core Management** | projects, tasks, teams, team_members | Projects, tasks, and team organization |
| **Communication** | chat_groups, chat_group_members, chat_messages, message_read_status, direct_messages, notifications | Messaging and notifications |
| **System Management** | system_monitoring, alerts, reports, settings, activity_log | System operations and logging |
| **File Management** | files, file_subscriptions | Document and file storage |

---

## Entity Relationship Diagram

### Core System Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USERS ECOSYSTEM                                 │
└─────────────────────────────────────────────────────────────────────┘

                          [USERS]
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ↓              ↓              ↓
         [PROJECTS]    [TEAM_MEMBERS]  [TASKS]
              │              │              │
              ├──────────────┼──────────────┤
              │              ↓              │
              └──→ [TEAMS] ←┘              │
                      │                    │
                      ├──→ [CHAT_GROUPS]  │
                      │        │          │
                      │        ↓          │
                      │ [CHAT_MESSAGES]   │
                      │        │          │
                      │        ↓          │
                      │ [MESSAGE_READ_STATUS]
                      │
                      └──→ [ACTIVITY_LOG]


┌─────────────────────────────────────────────────────────────────────┐
│                   NOTIFICATIONS & FILES                             │
└─────────────────────────────────────────────────────────────────────┘

     [USERS]  ←→  [NOTIFICATIONS]      [DIRECT_MESSAGES]
                        │                      │
                        └──────────────────────┘
                               │
                               ↓
                         [USERS] (sender/receiver)


                    [FILES]
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
    [USERS]      [PROJECTS]  [TASKS]
   (uploaded_by)  (attached)   (attached)


┌─────────────────────────────────────────────────────────────────────┐
│                  SYSTEM MONITORING & ALERTS                         │
└─────────────────────────────────────────────────────────────────────┘

  [SYSTEM_MONITORING]  →  [ALERTS]  ←  [ACTIVITY_LOG]
                                            │
                                            ↓
                                         [USERS]
```

---

## Data Models & Structure

### Authentication & User Management

#### **1. USERS Table**
Core user account information

```
┌──────────────────────────────────────────────────┐
│                    USERS                         │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ username (VARCHAR(50), UNIQUE, NOT NULL)        │
│ email (VARCHAR(100), UNIQUE, NOT NULL)          │
│ password (VARCHAR(255), NOT NULL - SHA256)      │
│ full_name (VARCHAR(100), NOT NULL)              │
│ phone (VARCHAR(20))                             │
│ department (VARCHAR(50))                        │
│ role (VARCHAR(50), DEFAULT: 'user')             │
│ status (VARCHAR(20), DEFAULT: 'active')         │
│ avatar_url (VARCHAR(255))                       │
│ last_login (DATETIME)                           │
│ login_count (INT, DEFAULT: 0)                   │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_status, idx_role
Foreign Keys: None
```

#### **2. ARCHIVED_USERS Table**
Snapshot records of deleted/archived users for audit trail

```
┌──────────────────────────────────────────────────┐
│               ARCHIVED_USERS                     │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ original_user_id (INT, FK→users.id)             │
│ username (VARCHAR(50))                          │
│ email (VARCHAR(100))                            │
│ full_name (VARCHAR(100))                        │
│ phone (VARCHAR(20))                             │
│ department (VARCHAR(50))                        │
│ role (VARCHAR(50))                              │
│ status (VARCHAR(20))                            │
│ data (JSON - full snapshot)                     │
│ archived_at (TIMESTAMP)                         │
│ archived_by (INT, FK→users.id)                  │
│ reason (VARCHAR(255))                           │
└──────────────────────────────────────────────────┘
Indexes: idx_archived_at, idx_original_user
```

#### **3. PASSWORD_RESET_TOKENS Table**
Temporary tokens for password recovery

```
┌──────────────────────────────────────────────────┐
│          PASSWORD_RESET_TOKENS                  │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ email (VARCHAR(100), NOT NULL)                  │
│ token (VARCHAR(255), NOT NULL, UNIQUE)          │
│ expires_at (DATETIME, NOT NULL)                 │
│ used (TINYINT, DEFAULT: 0)                      │
│ created_at (TIMESTAMP)                          │
└──────────────────────────────────────────────────┘
Indexes: idx_token, idx_email, idx_expires
```

### Project Management

#### **4. PROJECTS Table**
Project information and tracking

```
┌──────────────────────────────────────────────────┐
│                  PROJECTS                        │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ name (VARCHAR(100), NOT NULL)                   │
│ description (TEXT)                              │
│ status (VARCHAR(50), DEFAULT: 'active')         │
│ start_date (DATE)                               │
│ end_date (DATE)                                 │
│ progress (INT, DEFAULT: 0, 0-100)               │
│ budget (DECIMAL(15,2))                          │
│ spent (DECIMAL(15,2), DEFAULT: 0.00)            │
│ team_id (INT, FK→teams.id)                      │
│ created_by (INT, FK→users.id)                   │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_status, idx_progress, idx_team_id
```

#### **5. TASKS Table**
Task assignments and tracking

```
┌──────────────────────────────────────────────────┐
│                    TASKS                         │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ title (VARCHAR(150), NOT NULL)                  │
│ description (TEXT)                              │
│ project_id (INT, FK→projects.id)                │
│ assigned_to (INT, FK→users.id)                  │
│ priority (VARCHAR(20), DEFAULT: 'medium')       │
│ status (VARCHAR(50), DEFAULT: 'todo')           │
│ progress (INT, DEFAULT: 0)                      │
│ estimated_hours (DECIMAL(5,2))                  │
│ actual_hours (DECIMAL(5,2))                     │
│ due_date (DATE)                                 │
│ completed_date (DATETIME)                       │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_project_id, idx_assigned_to, idx_status, idx_priority
```

### Team Management

#### **6. TEAMS Table**
Team/department organization

```
┌──────────────────────────────────────────────────┐
│                    TEAMS                         │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ name (VARCHAR(100), NOT NULL)                   │
│ description (TEXT)                              │
│ team_lead (INT, FK→users.id, NULL)              │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_name, idx_team_lead
```

#### **7. TEAM_MEMBERS Table**
Many-to-many relationship between users and teams

```
┌──────────────────────────────────────────────────┐
│               TEAM_MEMBERS                       │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ team_id (INT, FK→teams.id, NOT NULL)            │
│ user_id (INT, FK→users.id, NOT NULL)            │
│ role (VARCHAR(50))                              │
│ joined_at (TIMESTAMP)                           │
└──────────────────────────────────────────────────┘
Indexes: idx_team_id, idx_user_id
Unique Key: (team_id, user_id)
```

### Communication & Messaging

#### **8. CHAT_GROUPS Table**
Group chat rooms linked to teams

```
┌──────────────────────────────────────────────────┐
│                CHAT_GROUPS                       │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ team_id (INT, FK→teams.id, UNIQUE)              │
│ name (VARCHAR(100), NOT NULL)                   │
│ description (TEXT)                              │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_team_id
Cascade: ON DELETE CASCADE
```

#### **9. CHAT_GROUP_MEMBERS Table**
Membership tracking for group chats

```
┌──────────────────────────────────────────────────┐
│            CHAT_GROUP_MEMBERS                    │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ group_id (INT, FK→chat_groups.id)               │
│ user_id (INT, FK→users.id)                      │
│ joined_at (TIMESTAMP)                           │
└──────────────────────────────────────────────────┘
Indexes: idx_group_id, idx_user_id
Unique Key: (group_id, user_id)
Cascade: ON DELETE CASCADE
```

#### **10. CHAT_MESSAGES Table**
Group chat message storage

```
┌──────────────────────────────────────────────────┐
│               CHAT_MESSAGES                      │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ group_id (INT, FK→chat_groups.id)               │
│ user_id (INT, FK→users.id)                      │
│ message (TEXT, NOT NULL)                        │
│ attachment_id (INT, FK→files.id, NULLABLE)      │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_group_id, idx_created_at, idx_user_id
Cascade: ON DELETE CASCADE
```

#### **11. MESSAGE_READ_STATUS Table**
Track which messages have been read by which users

```
┌──────────────────────────────────────────────────┐
│            MESSAGE_READ_STATUS                   │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ message_id (INT, FK→chat_messages.id)           │
│ user_id (INT, FK→users.id)                      │
│ read_at (TIMESTAMP)                             │
└──────────────────────────────────────────────────┘
Indexes: idx_message_id, idx_user_id
Unique Key: (message_id, user_id)
Cascade: ON DELETE CASCADE
```

#### **12. DIRECT_MESSAGES Table**
Private person-to-person messages

```
┌──────────────────────────────────────────────────┐
│              DIRECT_MESSAGES                     │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ sender_id (INT, FK→users.id, NOT NULL)          │
│ receiver_id (INT, FK→users.id, NOT NULL)        │
│ message (TEXT, NOT NULL)                        │
│ attachment_id (INT, FK→files.id, NULLABLE)      │
│ read_at (DATETIME, NULLABLE)                    │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP)                          │
└──────────────────────────────────────────────────┘
Indexes: idx_sender_id, idx_receiver_id, idx_created_at
```

#### **13. NOTIFICATIONS Table**
System notifications for users

```
┌──────────────────────────────────────────────────┐
│               NOTIFICATIONS                      │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ user_id (INT, FK→users.id, NOT NULL)            │
│ type (VARCHAR(50), NOT NULL)                    │
│ subject (VARCHAR(200), NOT NULL)                │
│ message (TEXT)                                  │
│ related_entity_type (VARCHAR(50))               │
│ related_entity_id (INT)                         │
│ is_read (TINYINT, DEFAULT: 0)                   │
│ created_at (TIMESTAMP)                          │
│ read_at (DATETIME, NULLABLE)                    │
└──────────────────────────────────────────────────┘
Indexes: idx_user_id, idx_created_at, idx_is_read
```

### System Management

#### **14. SYSTEM_MONITORING Table**
System performance and health metrics

```
┌──────────────────────────────────────────────────┐
│            SYSTEM_MONITORING                     │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ metric_name (VARCHAR(100), NOT NULL)            │
│ metric_value (DECIMAL(10,2))                    │
│ unit (VARCHAR(20))                              │
│ threshold_warning (DECIMAL(10,2))               │
│ threshold_critical (DECIMAL(10,2))              │
│ status (VARCHAR(20))                            │
│ recorded_at (TIMESTAMP)                         │
└──────────────────────────────────────────────────┘
Indexes: idx_metric_name, idx_recorded_at
```

#### **15. ALERTS Table**
System alerts and notifications

```
┌──────────────────────────────────────────────────┐
│                   ALERTS                         │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ alert_type (VARCHAR(50), NOT NULL)              │
│ subject (VARCHAR(200), NOT NULL)                │
│ message (TEXT)                                  │
│ severity (VARCHAR(20))  [low/med/high/critical] │
│ status (VARCHAR(20), DEFAULT: 'active')         │
│ created_at (TIMESTAMP)                          │
│ resolved_at (DATETIME, NULLABLE)                │
└──────────────────────────────────────────────────┘
Indexes: idx_severity, idx_status, idx_created_at
```

#### **16. REPORTS Table**
Generated system and project reports

```
┌──────────────────────────────────────────────────┐
│                   REPORTS                        │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ title (VARCHAR(150), NOT NULL)                  │
│ report_type (VARCHAR(50))                       │
│ content (LONGTEXT)                              │
│ created_by (INT, FK→users.id)                   │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_report_type, idx_created_at
```

#### **17. SETTINGS Table**
User and system configuration settings

```
┌──────────────────────────────────────────────────┐
│                 SETTINGS                         │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ user_id (INT, FK→users.id, NULLABLE)            │
│ setting_key (VARCHAR(100), NOT NULL)            │
│ setting_value (TEXT)                            │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
└──────────────────────────────────────────────────┘
Indexes: idx_user_id
Unique Key: (user_id, setting_key)
```

#### **18. ACTIVITY_LOG Table**
Audit trail of all system activities

```
┌──────────────────────────────────────────────────┐
│                ACTIVITY_LOG                      │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ user_id (INT, FK→users.id)                      │
│ action (VARCHAR(100))                           │
│ entity_type (VARCHAR(50))  [user/project/task]  │
│ entity_id (INT)                                 │
│ description (TEXT)                              │
│ ip_address (VARCHAR(45))                        │
│ user_agent (TEXT)                               │
│ created_at (TIMESTAMP)                          │
└──────────────────────────────────────────────────┘
Indexes: idx_user_id, idx_created_at, idx_entity_type
```

### File Management

#### **19. FILES Table** ⭐ **NEW**
Document and file storage with metadata

```
┌──────────────────────────────────────────────────┐
│                    FILES                         │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ filename (VARCHAR(255), NOT NULL)               │
│ original_filename (VARCHAR(255), NOT NULL)      │
│ file_path (VARCHAR(500), NOT NULL)              │
│ file_size (BIGINT) [in bytes]                   │
│ mime_type (VARCHAR(100))                        │
│ file_extension (VARCHAR(20))                    │
│ uploaded_by (INT, FK→users.id)                  │
│ project_id (INT, FK→projects.id, NULLABLE)      │
│ task_id (INT, FK→tasks.id, NULLABLE)            │
│ chat_message_id (INT, FK→chat_messages.id, NULLABLE) │
│ description (TEXT)                              │
│ status (VARCHAR(20), DEFAULT: 'active')         │
│ is_public (TINYINT, DEFAULT: 0)                 │
│ version (INT, DEFAULT: 1)                       │
│ created_at (TIMESTAMP)                          │
│ updated_at (TIMESTAMP, AUTO UPDATE)             │
│ deleted_at (DATETIME, NULLABLE - soft delete)   │
└──────────────────────────────────────────────────┘
Indexes: idx_uploaded_by, idx_project_id, idx_task_id, idx_created_at
Cascade: ON DELETE CASCADE for FK references
```

#### **20. FILE_SUBSCRIPTIONS Table** ⭐ **NEW**
Track file access and subscribers (who has downloaded/viewed)

```
┌──────────────────────────────────────────────────┐
│             FILE_SUBSCRIPTIONS                   │
├──────────────────────────────────────────────────┤
│ id (INT, PK, AI)                                │
│ file_id (INT, FK→files.id, NOT NULL)            │
│ user_id (INT, FK→users.id, NOT NULL)            │
│ access_type (VARCHAR(20)) [view/download/edit]  │
│ download_count (INT, DEFAULT: 0)                │
│ last_accessed_at (DATETIME)                     │
│ created_at (TIMESTAMP)                          │
└──────────────────────────────────────────────────┘
Indexes: idx_file_id, idx_user_id
Unique Key: (file_id, user_id)
```

---

## MySQL Creation Statements

### Complete Database and All Tables

```sql
-- ===========================
-- DATABASE CREATION
-- ===========================

CREATE DATABASE IF NOT EXISTS project_management_db;
USE project_management_db;

-- ===========================
-- AUTHENTICATION & USERS
-- ===========================

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
    last_login DATETIME,
    login_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_role (role),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    FOREIGN KEY (archived_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- PROJECT MANAGEMENT
-- ===========================

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    progress INT DEFAULT 0,
    budget DECIMAL(15,2),
    spent DECIMAL(15,2) DEFAULT 0.00,
    team_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_progress (progress),
    INDEX idx_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    project_id INT,
    assigned_to INT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'todo',
    progress INT DEFAULT 0,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    due_date DATE,
    completed_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TEAM MANAGEMENT
-- ===========================

CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    team_lead INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_lead) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_team_lead (team_lead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- MESSAGING & COMMUNICATION
-- ===========================

CREATE TABLE IF NOT EXISTS chat_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_user (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    attachment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_group_id (group_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_read_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user (message_id, user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS direct_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    attachment_id INT,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    is_read TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- SYSTEM MANAGEMENT
-- ===========================

CREATE TABLE IF NOT EXISTS system_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 2),
    unit VARCHAR(20),
    threshold_warning DECIMAL(10, 2),
    threshold_critical DECIMAL(10, 2),
    status VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT,
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    report_type VARCHAR(50),
    content LONGTEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_report_type (report_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_setting (user_id, setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_entity_type (entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- FILE MANAGEMENT
-- ===========================

CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT COMMENT 'Size in bytes',
    mime_type VARCHAR(100),
    file_extension VARCHAR(20),
    uploaded_by INT NOT NULL,
    project_id INT,
    task_id INT,
    chat_message_id INT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    is_public TINYINT DEFAULT 0,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME COMMENT 'Soft delete timestamp',
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (chat_message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_project_id (project_id),
    INDEX idx_task_id (task_id),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    user_id INT NOT NULL,
    access_type VARCHAR(20) COMMENT 'view, download, edit',
    download_count INT DEFAULT 0,
    last_accessed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_file_user (file_id, user_id),
    INDEX idx_file_id (file_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- SAMPLE DATA (Optional)
-- ===========================

-- Insert Sample Users
INSERT IGNORE INTO users (username, email, password, full_name, phone, department, role, status) VALUES
('admin', 'admin@example.com', SHA2('admin123', 256), 'System Administrator', '+1-555-0001', 'IT', 'admin', 'active'),
('john_doe', 'john@example.com', SHA2('password123', 256), 'John Doe', '+1-555-0002', 'Backend', 'developer', 'active'),
('sarah_smith', 'sarah@example.com', SHA2('password123', 256), 'Sarah Smith', '+1-555-0003', 'Management', 'manager', 'active'),
('mike_johnson', 'mike@example.com', SHA2('password123', 256), 'Mike Johnson', '+1-555-0004', 'QA', 'qa_engineer', 'active'),
('emily_davis', 'emily@example.com', SHA2('password123', 256), 'Emily Davis', '+1-555-0005', 'Design', 'designer', 'active');

-- Insert Sample Teams
INSERT IGNORE INTO teams (name, description, team_lead) VALUES
('Frontend Team', 'Responsible for UI/UX development', 5),
('Backend Team', 'Handles server-side development', 2),
('QA Team', 'Testing and quality assurance', 4),
('Design Team', 'UI/UX design and branding', 5),
('DevOps Team', 'Infrastructure and deployment', 1);

-- Insert Sample Projects
INSERT IGNORE INTO projects (name, description, status, start_date, end_date, progress, budget, spent, team_id, created_by) VALUES
('Website Redesign', 'Complete redesign of company website', 'active', '2026-01-15', '2026-03-20', 75, 50000.00, 37500.00, 1, 3),
('Mobile App Development', 'iOS and Android mobile application', 'active', '2026-02-01', '2026-04-15', 60, 100000.00, 60000.00, 2, 3),
('API Integration', 'Integration of third-party APIs', 'active', '2026-02-10', '2026-03-25', 90, 25000.00, 22500.00, 2, 3);

-- ===========================
-- PERFORMANCE INDEXES
-- ===========================

CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ===========================
-- Database Setup Complete
-- ===========================

SELECT 'Database setup completed successfully!' AS Status;
```

---

## File Storage System

### Directory Structure

```
ProjectDashboard/
├── uploads/                          # Main file storage directory
│   ├── projects/                     # Project-related files
│   │   ├── PROJ-001/                 # Project-specific folder
│   │   ├── PROJ-002/
│   │   └── ...
│   ├── tasks/                        # Task-related attachments
│   │   ├── TASK-001/
│   │   ├── TASK-002/
│   │   └── ...
│   ├── messages/                     # Chat message attachments
│   │   ├── GROUP-001/
│   │   ├── GROUP-002/
│   │   └── ...
│   ├── profiles/                     # User avatar/profile images
│   └── temp/                         # Temporary files (cleanup regularly)
```

### File Handling Best Practices

1. **File Naming**: Store with unique ID prefix:
   - Format: `{timestamp}_{random}_{original_filename}`
   - Example: `1713177600_a7f3k2_report.pdf`

2. **File Storage Variables** (in PHP):
   ```php
   $upload_dir = 'uploads/';
   $max_file_size = 52428800; // 50 MB
   $allowed_extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip'];
   ```

3. **Database Record** (for every uploaded file):
   ```php
   $stmt = $conn->prepare("INSERT INTO files (filename, original_filename, file_path, file_size, mime_type, file_extension, uploaded_by, project_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
   ```

4. **Soft Deletes**: Use `deleted_at` column instead of hard deletes for audit trail

---

## Setup Instructions

### Method 1: Using phpMyAdmin

1. Navigate to **phpMyAdmin** (usually `http://localhost/phpmyadmin`)
2. Click **"New"** to create a new database
3. Name it: `project_management_db`
4. Click **"Create"**
5. Select the new database
6. Go to **SQL** tab
7. Copy and paste the complete SQL script above (MySQL Creation Statements)
8. Click **"Go"**

### Method 2: Using Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Paste the entire SQL script from "MySQL Creation Statements" section
# Press Enter to execute
```

### Method 3: Using PHP Script

Create a file `setup_database.php` in the settings folder:

```php
<?php
include 'db_connect.php';

$sql_file = file_get_contents('database_setup.sql');
$queries = array_filter(array_map('trim', explode(';', $sql_file)));

foreach ($queries as $query) {
    if (!empty($query)) {
        if (!$conn->multi_query($query)) {
            die("Error executing: " . $conn->error);
        }
        while ($conn->next_result());
    }
}

echo "Database setup completed successfully!";
?>
```

### Verification

After setup, verify the installation:

```sql
-- Check all tables
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Count tables (should be 20)
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'project_management_db';
```

---

## Database Maintenance

### Regular Backup

```bash
# Backup entire database
mysqldump -u root -p project_management_db > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p project_management_db < backup_20260415.sql
```

### Regular Cleanup

```sql
-- Clear old reset tokens (older than 7 days)
DELETE FROM password_reset_tokens WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Soft-delete old files (mark as deleted but keep record)
UPDATE files SET deleted_at = NOW() WHERE DATE_ADD(created_at, INTERVAL 90 DAY) < NOW() AND deleted_at IS NULL;

-- Clear archived users older than 1 year
DELETE FROM archived_users WHERE archived_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Performance Optimization

```sql
-- Rebuild indexes
OPTIMIZE TABLE users;
OPTIMIZE TABLE projects;
OPTIMIZE TABLE tasks;
OPTIMIZE TABLE chat_messages;

-- Check table status
CHECK TABLE users;
REPAIR TABLE users;
```

---

## FAQ

**Q: Can I modify the file storage location?**
A: Yes, update the `$upload_dir` variable in your PHP config files and ensure the directory has proper permissions (755).

**Q: What's the maximum file size?**
A: Configured as 50MB by default. Adjust `$max_file_size` and MySQL `max_allowed_packet` setting.

**Q: How do I add new columns to existing tables?**
A: Use `ALTER TABLE` command, e.g., `ALTER TABLE users ADD COLUMN new_field VARCHAR(255);`

**Q: How often should I backup the database?**
A: At least daily for production systems. Use automated backup scripts or third-party tools.

---

**Document Version:** 2.0
**Last Updated:** April 15, 2026
**Maintained By:** Project Management System Admin
