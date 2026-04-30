# Messaging System Implementation Guide

## Overview
A complete group chat messaging system has been integrated into your Project Management Dashboard. Users can chat within team-specific group chats accessible from any page via a floating chat bubble.

---

## Features Implemented

### 1. **Chat Bubble UI**
- Floating chat bubble (bottom-right corner) on all pages except index.html
- Unread message badge showing total unread messages
- Smooth animations and responsive design
- Works on mobile and desktop

### 2. **Group Chat Functionality**
- **Automatic Group Creation**: When a team is created, a group chat is automatically created for that team
- **Member Sync**: Team members are automatically added to the group chat
- **Member Management**: When team members are added/removed, they're automatically synced with the group chat
- **Team Deletion**: When a team is deleted, its group chat is automatically deleted

### 3. **Real-time Messaging**
- Send messages to team group chats
- View message history (up to 50 recent messages)
- User avatars and names in chat
- Timestamps for all messages
- Message read status tracking
- Auto-refresh of message list every 5 seconds

### 4. **Chat Interface**
- **Group List**: Shows all team chats the user is a member of
- **Message Display**: Shows conversation history with proper formatting
- **Input Field**: Type and send messages with Enter key or button click
- **Unread Indicators**: Visual indicators for chats with unread messages

---

## Database Tables Created

Run the following SQL to create the necessary tables:

```sql
-- Located in: settings/messaging_schema.sql
```

**Tables:**
1. `chat_groups` - Team-linked group chats
2. `chat_group_members` - Tracks which users can access which group chats
3. `chat_messages` - Stores all messages
4. `message_read_status` - Tracks message read status per user

**Installation:**
1. Open phpMyAdmin
2. Navigate to your `project_management_db` database
3. Go to the SQL tab
4. Copy and paste the contents of `settings/messaging_schema.sql`
5. Execute the SQL

Alternatively, use MySQL CLI:
```bash
mysql -u root project_management_db < settings/messaging_schema.sql
```

---

## Backend API Endpoints

### 1. **Create Group Chat**
- **File**: `settings/create_group_chat.php`
- **Method**: POST
- **Purpose**: Creates a group chat for a team
- **Called by**: `add_team.php` (automatically when team is created)

### 2. **Get Chat Groups**
- **File**: `settings/get_chat_groups.php`
- **Method**: GET
- **Purpose**: Retrieves all chat groups for the current user
- **Returns**: List of groups with unread counts

### 3. **Get Messages**
- **File**: `settings/get_messages.php`
- **Method**: GET
- **Parameters**: `group_id`, `limit` (default 50), `offset` (default 0)
- **Purpose**: Retrieves messages from a specific group chat
- **Returns**: Array of messages with user info and timestamps

### 4. **Send Message**
- **File**: `settings/send_message.php`
- **Method**: POST
- **Parameters**: `group_id`, `message`
- **Purpose**: Sends a message to a group chat
- **Validation**: Max 2000 characters, requires authenticated session

### 5. **Manage Group Members**
- **File**: `settings/manage_group_members.php`
- **Method**: POST
- **Parameters**: `action` (add/remove), `group_id`, `user_id`
- **Purpose**: Adds or removes members from a group chat

---

## Frontend Files

### JavaScript
- **`js/chat.js`**: Main chat system class
  - `ChatSystem` class handles all chat functionality
  - Auto-initializes on page load (except index.html)
  - Manages UI rendering and message loading
  - Handles real-time updates

### CSS
- **`css/chat.css`**: Complete styling for chat UI
  - Chat bubble styles
  - Modal/popup styles
  - Message display styles
  - Responsive design for mobile/tablet

### HTML Integration
Updated pages to include chat:
- `page/admin.html`
- `page/dashboard.html`
- `page/front_panel.html`
- `page/projects.html`
- `page/reports.html`
- `page/settings.html`
- `page/tasks.html`
- `page/team.html`

---

## Modified Backend Files

### 1. **settings/add_team.php**
- Added automatic group chat creation when a team is created
- Adds all team members to the new group chat

### 2. **settings/update_team.php**
- Syncs group chat members with team members
- Removes members from chat if removed from team
- Adds new members to chat when they're added to team

### 3. **settings/add_member.php**
- Automatically adds new team members to the group chat
- Creates the group chat if it doesn't exist yet

### 4. **js/app_core.js**
- Added user initialization function
- Fetches current user info for display in chat

---

## How It Works

### Workflow: Creating a Team and Chatting

1. **Admin/User Creates Team**
   - Team is created in `teams` table
   - Backend automatically creates group chat in `chat_groups`
   - All selected team members are added to `chat_group_members`

2. **User Opens Any Page**
   - `chat.js` initializes (except on index.html)
   - Chat bubble appears in bottom-right corner
   - Fetches all available chat groups for user

3. **User Opens a Chat**
   - Clicks on a group from the list
   - Last 50 messages are loaded and displayed
   - Message list auto-refreshes every 5 seconds

4. **User Sends a Message**
   - Types message (max 2000 characters)
   - Presses Enter or clicks send button
   - Message is inserted into `chat_messages`
   - User is marked as having read the message
   - Message list is refreshed

5. **Member Removed from Team**
   - Member is deleted from `team_members`
   - Update hook removes member from `chat_group_members`
   - User can no longer see that group chat

---

## Important Notes

### Security
- All endpoints require authenticated session (`$_SESSION['user_id']`)
- Users can only access chats they're members of
- Messages are linked to authenticated users
- XSS protection via HTML escaping

### Performance
- Group list refreshes every 30 seconds
- Message list refreshes every 5 seconds (when group is open)
- Unread counts calculated efficiently in SQL
- Scrollback limited to 50 messages per load

### No Image/File Transfers
- As requested, image and file transfers are NOT included
- Only text messages in this implementation
- Can be added in future versions if needed

### Mobile Responsive
- Chat UI is fully responsive
- Works on small screens and tablets
- Modal expands to full screen on mobile

---

## Testing the System

1. **Create a Team**
   - Go to Team page
   - Click "Create Team"
   - Add team name and select members
   - Click "Create Team"

2. **Open Chat**
   - Chat bubble appears on any dashboard page
   - Click bubble to open
   - Select the newly created team from the list
   - Send a test message

3. **Test Member Management**
   - Edit the team
   - Remove a member
   - That member will no longer see the group chat
   - Add a member
   - New member will be able to see the group chat

4. **Test Unread Notifications**
   - Open chat on one page
   - Open another chat group without reading messages
   - Badge will show unread count on chat bubble

---

## Troubleshooting

### Chat Bubble Not Appearing
- Ensure you're not on index.html
- Check browser console for JavaScript errors
- Verify page includes `chat.js` and `chat.css`

### Messages Not Loading
- Verify database tables exist (run messaging_schema.sql)
- Check user has proper authentication session
- Verify user is member of the group chat
- Check for PHP errors in settings/get_messages.php

### Group Chat Not Creating
- Ensure messaging_schema.sql was executed
- Check team creation response for errors
- Verify database permissions

### Can't Send Messages
- Verify message is not empty
- Verify message is under 2000 characters
- Check authentication session is valid
- Verify user is member of the group

---

## Future Enhancements

Possible additions:
- Direct messages between users (in addition to group chats)
- File upload support
- Image sharing
- Message editing/deletion
- Message reactions/emojis
- Typing indicators
- Message notifications
- Search/filter messages
- Pinned messages
- Message formatting (bold, italic, code blocks)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check PHP error logs for backend issues
4. Verify database connection and table structure
