# 🛠️ Troubleshooting

## Database Connection Issues
- Verify MySQL is running
- Check credentials in `db_connect.php`
- Run `test_db.php` to diagnose

## Login/Authentication Issues
- Clear browser cookies/cache
- Check `session_manager.php` session timeout
- Verify user exists in database

## Page Not Loading
- Ensure `.htaccess` is in root directory
- Check file permissions (755 for folders, 644 for files)
- Verify PHP is enabled on server

## Email Not Sending
- Configure mail settings in `config.php`
- Check `email_service.php` for SMTP settings
- Verify email provider credentials

## API Endpoints (Backend)

All API endpoints return JSON responses. Base path: `/settings/`

### Authentication
- `POST /authenticate.php` - Login
- `POST /register_handler.php` - Register
- `POST /forgot_password_handler.php` - Request password reset
- `POST /reset_password_handler.php` - Reset password
- `GET /logout.php` - Logout
- `GET /session_check.php` - Verify session

### Projects
- `GET /get_projects.php` - List projects
- `GET /get_project.php?id=X` - Get project details
- `POST /create_project.php` - Create project
- `POST /update_project.php` - Update project
- `POST /delete_project.php` - Delete project

### Tasks
- `GET /get_tasks.php` - List tasks
- `POST /assign_task.php` - Assign task
- `POST /update_task.php` - Update task
- `POST /delete_task.php` - Delete task

### Teams
- `GET /get_teams.php` - List teams
- `GET /get_team_members.php?team_id=X` - Get team members
- `POST /add_team.php` - Create team
- `POST /add_member.php` - Add member to team
- `POST /update_team.php` - Update team
- `POST /delete_team.php` - Delete team

### Users & Stats
- `GET /get_user.php` - Get user profile
- `GET /get_all_users.php` - List all users
- `GET /get_stats.php` - Get dashboard statistics
- `GET /get_team_stats.php` - Get team statistics
- `POST /update_account.php` - Update account
- `POST /update_password.php` - Change password

### Notifications
- `GET /get_notifications.php` - List notifications
- `POST /mark_notification_read.php` - Mark as read
- `POST /update_notifications.php` - Update settings

### Messaging & Communication
- `POST /send_message.php` - Send group message
- `POST /send_direct_message.php` - Send direct message
- `GET /get_messages.php` - Retrieve group messages
- `GET /get_direct_messages.php` - Retrieve direct messages
- `POST /create_group_chat.php` - Create chat group
- `GET /get_chat_groups.php` - Get user's chat groups
- `GET /get_team_group_chat.php` - Get team group chats
- `POST /manage_group_members.php` - Manage group members

### Advanced Operations
- `POST /export_handler.php` - Export data
- `POST /schedule_meeting.php` - Schedule meeting
- `POST /admin_api.php` - Admin operations
- `GET /realtime_updates.php` - Real-time data sync

## For More Help
- Check error logs in browser console (F12)
- Review server error logs
- Run development tools in `/settings/` folder
