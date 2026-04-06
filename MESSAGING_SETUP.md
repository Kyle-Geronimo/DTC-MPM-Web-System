# Messaging System Setup Instructions

## Quick Setup Guide

Follow these steps to enable the messaging system on your Project Dashboard.

### Step 1: Create Database Tables

The messaging system requires 4 new database tables. You can create them in two ways:

#### Option A: Using phpMyAdmin (Recommended for beginners)
1. Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
2. Click on your database `project_management_db` in the left sidebar
3. Click the "SQL" tab at the top
4. Copy the entire contents of `settings/messaging_schema.sql`
5. Paste into the SQL editor
6. Click "Go" to execute

#### Option B: Using Command Line
If you have MySQL CLI installed:

```bash
cd c:\xampp\htdocs\ProjectDashboard
mysql -u root project_management_db < settings/messaging_schema.sql
```

Or from within MySQL:
```sql
USE project_management_db;
SOURCE C:/xampp/htdocs/ProjectDashboard/settings/messaging_schema.sql;
```

### Step 2: Verify Installation

After creating the tables, verify they exist:

In phpMyAdmin:
1. Click on `project_management_db`
2. Click "Structure" tab
3. Look for these new tables:
   - `chat_groups`
   - `chat_group_members`
   - `chat_messages`
   - `message_read_status`

Or in MySQL:
```sql
SHOW TABLES LIKE 'chat_%';
SHOW TABLES LIKE 'message_%';
```

You should see all 4 tables listed.

### Step 3: Test the System

1. **Log into Dashboard**
   - Go to `http://localhost/ProjectDashboard/page/front_panel.html`
   - You should see a chat bubble (💬) in the bottom-right corner

2. **Create a Team**
   - Go to Team page
   - Click "Create New Team"
   - Fill in team name
   - Select at least 2 team members
   - Click "Create Team"
   - A group chat will automatically be created

3. **Send a Test Message**
   - Click the chat bubble
   - Select the team you just created
   - Type a test message
   - Press Enter to send
   - Message should appear in the chat

4. **Verify Member Sync**
   - Go back to Team page
   - Edit the team you created
   - Remove one member
   - That member can no longer see the group chat
   - Add a new member
   - New member can now see the group chat

### Step 4: Check for Errors

If you encounter issues, check:

**Browser Console:**
- Open DevTools (F12)
- Check the "Console" tab for JavaScript errors
- Look for messages like "Error loading chat groups"

**PHP Errors:**
- Open `settings/config.php`
- Ensure `DEBUG_MODE` is enabled
- Check PHP error logs in XAMPP logs directory
- Look for messages in browser Network tab

**Database:**
- Verify all 4 tables exist and have correct structure
- Check that foreign key relationships are intact
- Ensure user has proper permissions

---

## Verification Checklist

After setup, verify the following:

- [ ] All 4 messaging tables exist in database
- [ ] Chat bubble appears on dashboard pages (not on index.html)
- [ ] Chat bubble doesn't appear on login/register pages
- [ ] Can create a team and see group chat created
- [ ] Can send messages in team chat
- [ ] Can see message history
- [ ] Adding member to team adds them to chat
- [ ] Removing member from team removes them from chat
- [ ] Unread badge appears when there are unread messages

---

## Files You Should Have

**Backend:**
- ✅ `settings/messaging_schema.sql` - Database schema
- ✅ `settings/create_group_chat.php` - Creates group chats
- ✅ `settings/get_chat_groups.php` - Lists user's groups
- ✅ `settings/get_messages.php` - Gets messages from a group
- ✅ `settings/send_message.php` - Sends messages
- ✅ `settings/manage_group_members.php` - Manages members

**Frontend:**
- ✅ `js/chat.js` - Chat system logic
- ✅ `css/chat.css` - Chat styling
- ✅ HTML pages updated with chat includes

**Modified Files:**
- ✅ `settings/add_team.php` - Creates chat group on team creation
- ✅ `settings/update_team.php` - Syncs members
- ✅ `settings/add_member.php` - Adds member to chat
- ✅ `js/app_core.js` - User initialization

**Documentation:**
- ✅ `MESSAGING_IMPLEMENTATION.md` - Full implementation guide
- ✅ This file - Setup instructions

---

## Troubleshooting

### Issue: "Database connection failed" error
**Solution:** 
- Ensure the database exists: `CREATE DATABASE IF NOT EXISTS project_management_db;`
- Check `config.php` for correct credentials
- Verify MySQL is running

### Issue: "Access denied" when running SQL
**Solution:**
- Ensure you're logged into phpMyAdmin with admin credentials
- Or use correct MySQL username/password in CLI command

### Issue: Chat bubble not appearing
**Solution:**
- Refresh the page (Ctrl+F5 to clear cache)
- Check that you're not on index.html
- Verify JavaScript files loaded (F12 > Network tab)
- Check browser console for errors

### Issue: "Unread badge shows NaN"
**Solution:**
- This is usually a minor rendering issue
- Refresh the page
- Check that all 4 database tables exist

### Issue: Can't send messages - "Access denied"
**Solution:**
- Verify you're logged in with valid session
- Check that you're member of the group chat
- Verify `send_message.php` has no errors

---

## Next Steps

Once the messaging system is verified:

1. **Inform Users**
   - Let team members know about the new chat feature
   - Explain that group chats are created automatically with teams

2. **Training (Optional)**
   - Show how to open chat bubble
   - Show how to send messages
   - Show how member management works

3. **Monitor**
   - Check for any JavaScript errors in user browsers
   - Monitor database performance as messages accumulate
   - Consider archiving old messages if needed later

---

## Support & Maintenance

### Backup Your Data
Before making changes, backup your database:
```bash
mysqldump -u root project_management_db > backup.sql
```

### Monitor Database Size
Since messages are stored indefinitely, check table sizes:
```sql
SELECT 
    table_name, 
    ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'project_management_db'
AND table_name LIKE 'chat_%';
```

### Clean Up Old Messages (Optional)
If database grows too large, archive/delete old messages:
```sql
-- Delete messages older than 1 year
DELETE FROM chat_messages 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Or just count how many
SELECT COUNT(*) FROM chat_messages 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## Questions?

Refer to the complete implementation guide: `MESSAGING_IMPLEMENTATION.md`
