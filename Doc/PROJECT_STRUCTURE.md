# 📊 Project Structure

```
ProjectDashboard/
├── index.html                      # Welcome/Landing page
├── README.md                       # This file
├── LICENSE                         # Project license
├── .htaccess                       # Apache server configuration
│
├── page/                           # User-facing pages (HTML/PHP)
│   ├── Authentication:
│   │   ├── login.php              # User login interface
│   │   ├── login_preview.html     # Login preview/test page
│   │   ├── register.php           # User registration form
│   │   ├── forgot_password.php    # Password recovery request
│   │   └── reset_password.php     # Password reset form
│   │
│   ├── Main Pages:
│   │   ├── front_panel.html       # Main dashboard
│   │   ├── front_panel.html       # Main dashboard and monitoring hub
│   │   ├── admin.html             # Admin panel interface
│   │   ├── projects.html          # Project management
│   │   ├── tasks.html             # Task management
│   │   ├── team.html              # Team directory
│   │   ├── reports.html           # Reports & analytics
│   │   ├── settings.html          # User settings
│   │   └── QUICKSTART.html        # Quick start guide
│
├── settings/                       # Backend handlers & configuration
│   ├── Configuration:
│   │   ├── config.php             # Application configuration
│   │   ├── config.template.php    # Configuration template
│   │   ├── db_connect.php         # Database connection
│   │   └── error_handler.php      # Error handling
│   │
│   ├── Authentication:
│   │   ├── authenticate.php       # Login authentication
│   │   ├── forgot_password_handler.php
│   │   ├── reset_password_handler.php
│   │   ├── register_handler.php   # Registration processing
│   │   ├── logout.php             # Logout handler
│   │   └── session_manager.php    # Session management
│   │
│   ├── Data Management:
│   │   ├── get_projects.php       # Fetch projects
│   │   ├── get_tasks.php          # Fetch tasks
│   │   ├── get_teams.php          # Fetch teams
│   │   ├── get_team_members.php   # Fetch team members
│   │   ├── get_user.php           # Fetch user data
│   │   ├── get_all_users.php      # Fetch all users
│   │   ├── get_stats.php          # Fetch statistics
│   │   └── get_notifications.php  # Fetch notifications
│   │
│   ├── Project Management:
│   │   ├── create_project.php     # Create new project
│   │   ├── update_project.php     # Update project
│   │   ├── delete_project.php     # Delete project
│   │   └── get_project.php        # Get project details
│   │
│   ├── Task Management:
│   │   ├── assign_task.php        # Assign task
│   │   ├── update_task.php        # Update task
│   │   ├── delete_task.php        # Delete task
│   │   └── get_tasks.php          # Fetch tasks
│   │
│   ├── Team Management:
│   │   ├── add_team.php           # Create new team
│   │   ├── add_member.php         # Add team member
│   │   ├── update_team.php        # Update team
│   │   ├── delete_team.php        # Delete team
│   │   ├── get_teams.php          # Fetch teams
│   │   ├── get_team_members.php   # Fetch members
│   │   ├── get_team_members_by_id.php
│   │   └── get_team_stats.php     # Team statistics
│   │
│   ├── Admin & Utilities:
│   │   ├── admin_api.php          # Admin REST API
│   │   ├── session_check.php      # Session validation
│   │   ├── audit_logger.php       # Activity logging
│   │   ├── email_service.php      # Email notifications
│   │   ├── notification_manager.php
│   │   ├── mark_notification_read.php
│   │   ├── realtime_updates.php   # Real-time data updates
│   │   ├── schedule_meeting.php   # Meeting scheduling
│   │   ├── export_handler.php     # Data export
│   │   ├── create_alert.php       # Create system alerts
│   │   ├── validator.php          # Input validation
│   │   ├── update_system.php      # System updates
│   │   ├── update_account.php     # Account settings
│   │   ├── update_notifications.php
│   │   ├── update_password.php    # Password change
│   │   └── generate_report.php    # Generate custom reports
│   │
│   ├── Messaging & Communication:
│   │   ├── send_message.php       # Send group messages
│   │   ├── send_direct_message.php # Send direct messages
│   │   ├── get_messages.php       # Retrieve group messages
│   │   ├── get_direct_messages.php # Retrieve direct messages
│   │   ├── create_group_chat.php  # Create chat groups
│   │   ├── get_chat_groups.php    # Fetch chat groups
│   │   ├── get_team_group_chat.php # Get team group chats
│   │   ├── manage_group_members.php # Manage group members
│   │   └── messaging_schema.sql   # Messaging database schema
│   │
│   ├── Database Schema:
│   │   ├── project_management_db.sql  # Main database schema
│   │   ├── admin_database_structure.sql
│   │   ├── password_reset_tokens.sql
│   │   ├── schema_updates.sql
│   │   ├── settings_schema_update.sql
│   │   └── update_password_reset_tokens.sql
│   │
│   ├── Development Tools:
│   │   ├── test_db.php            # Database connection test
│   │   ├── test_create.php        # Feature testing
│   │   ├── DEV_view_reset_tokens.php
│   │   ├── ensure_schema.php      # Schema verification
│   │   └── fix_teams_schema.php   # Schema repairs
│
├── css/                            # Stylesheets
│   ├── welcome.css                # Welcome page
│   ├── front-panel.css            # Front panel styles
│   ├── login.css                  # Login page
│   ├── register.css               # Registration page
│   ├── forgot_password.css        # Password recovery
│   ├── dashboard.css              # Dashboard
│   ├── dashboard_new.css          # New dashboard styles
│   ├── projects.css               # Projects page
│   ├── tasks.css                  # Tasks page
│   ├── team.css                   # Team page
│   ├── reports.css                # Reports page
│   ├── settings.css               # Settings page
│   ├── chat.css                   # Chat/messaging styles
│   ├── admin.css                  # Admin panel
│   ├── common.css                 # Shared styles
│   └── dark-mode.css              # Dark theme
│
├── js/                             # JavaScript files
│   ├── app_core.js                # Core application logic
│   ├── front_panel.js             # Front panel functionality
│   ├── admin.js                   # Admin panel logic
│   ├── projects.js                # Projects page logic
│   ├── dashboard.js               # Dashboard logic
│   ├── dashboard_new.js           # New dashboard logic
│   ├── tasks.js                   # Tasks functionality
│   ├── team.js                    # Team page logic
│   ├── chat.js                    # Chat/messaging logic
│   ├── register.js                # Registration logic
│   └── settings.js                # Settings functionality
│
└── Documentation:
    ├── PROJECT_STRUCTURE.md       # Project structure overview
    ├── FEATURES.md                # Feature list and descriptions
    ├── GETTING_STARTED.md         # Quick start and first-time setup
    ├── TROUBLESHOOTING.md         # Troubleshooting guide
    ├── PRODUCTION_CHECKLIST.md    # Production deployment checklist
    ├── PROGRESS_REPORT.md         # Security features and completed work
    ├── MYSQL_DATABASE_SCHEMA.md   # Complete MySQL DDL & Schema Guide
    ├── PASSWORD_RESET_GUIDE.md    # Password reset implementation
    ├── MESSAGING_IMPLEMENTATION.md # Messaging system guide
    ├── MESSAGING_SETUP.md         # Messaging setup instructions
    └── INDEX.md                   # File index
```

## File Organization

- **page/**: All user-facing HTML/PHP pages
- **settings/**: Backend API endpoints and configuration
- **css/**: Responsive stylesheets with dark mode support
- **js/**: Client-side functionality and interactions
- **Doc/**: Complete documentation and guides
- **Database/**: Database schema and setup files
- **uploads/**: File storage directory for user uploads

## Key Features by Category

**Frontend**: Responsive HTML/CSS/JavaScript interfaces
**Backend**: 50+ PHP API endpoints for all operations
**Database**: 20 tables with full relationships and constraints
**Security**: Authentication, validation, audit logging
**Communication**: Real-time messaging and notifications
**Analytics**: Reports, statistics, and performance monitoring
