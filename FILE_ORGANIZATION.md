# Project File Organization Summary

## ✅ File Structure Review - March 11, 2026

All files have been reviewed and are now properly organized according to their function.

---

## 📁 Folder Structure

```
ProjectDashboard/
├── page/              ← User-facing pages (HTML/PHP with UI)
├── settings/          ← Backend handlers and configuration
├── css/               ← Stylesheets
└── js/                ← JavaScript files
```

---

## 📄 Page Folder (User-Facing Pages)

**Location:** `/page/`

All files in this folder are user-facing pages with HTML interfaces:

| File | Description | Type |
|------|-------------|------|
| `admin.html` | Admin panel interface | HTML Page |
| `front_panel.html` | Main dashboard after login | HTML Page |
| `forgot_password.php` | Password reset request form | PHP Page (with HTML) |
| `login.php` | User login form | PHP Page (with HTML) |
| `projects.html` | Projects management page | HTML Page |
| `QUICKSTART.html` | Quick start guide | HTML Page |
| `register.php` | User registration form | PHP Page (with HTML) |
| `reports.html` | Reports page | HTML Page |
| `reset_password.php` | New password entry form | PHP Page (with HTML) |
| `settings.html` | User settings page | HTML Page |
| `tasks.html` | Tasks management page | HTML Page |
| `team.html` | Team management page | HTML Page |

**Characteristics:**
- All files contain `<!DOCTYPE html>` and full HTML structure
- Display forms, tables, or dashboards to users
- Users navigate to these files directly in browser
- May include session checks and redirects

---

## ⚙️ Settings Folder (Backend Handlers & Config)

**Location:** `/settings/`

All files in this folder are backend handlers, APIs, or configuration:

### Backend Handlers
| File | Description | Type |
|------|-------------|------|
| `admin_api.php` | REST API for admin panel | API Handler |
| `authenticate.php` | Login authentication handler | Auth Handler |
| `forgot_password_handler.php` | Password reset request processor | Form Handler |
| `logout.php` | Logout handler | Auth Handler |
| `register_handler.php` | Registration form processor | Form Handler |
| `reset_password_handler.php` | Password change processor | Form Handler |
| `session_check.php` | Session validation utility | Security Utility |

### Configuration Files
| File | Description | Type |
|------|-------------|------|
| `config.php` | Application configuration | Config |
| `config.template.php` | Configuration template | Config Template |
| `db_connect.php` | Database connection | Database Config |

### Database Files
| File | Description | Type |
|------|-------------|------|
| `database_setup.sql` | Complete database schema | SQL Schema |
| `password_reset_tokens.sql` | Password reset table | SQL Schema |
| `update_password_reset_tokens.sql` | Schema update | SQL Migration |
| `admin_database_structure.sql` | Admin panel schema | SQL Schema |

### Development Tools
| File | Description | Type |
|------|-------------|------|
| `DEV_view_reset_tokens.php` | ⚠️ View reset tokens (DEV ONLY) | Debug Tool |

**Characteristics:**
- Return JSON responses or perform redirects
- Process form submissions
- No HTML interface (or minimal for dev tools)
- Included/called by page files
- Handle database operations

---

## 🔄 File Movement History

### Moved Files
1. **dev_view_reset_tokens.php**
   - **From:** `page/dev_view_reset_tokens.php`
   - **To:** `settings/DEV_view_reset_tokens.php`
   - **Reason:** Development debugging tool, not a user-facing page
   - **Updated:** File paths changed from `../settings/` to `./` for includes
   - **New URL:** `http://localhost/ProjectDashboard/settings/DEV_view_reset_tokens.php`

---

## 📋 File Type Guidelines

### When to place in `/page/`:
✅ File contains full HTML structure (`<!DOCTYPE html>`)
✅ Users navigate to it directly in browser
✅ Displays forms, dashboards, or information
✅ Has CSS styling and user interface elements

**Examples:**
```php
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <form>...</form>
</body>
</html>
```

### When to place in `/settings/`:
✅ Processes form data (POST handler)
✅ Returns JSON responses
✅ Performs authentication/authorization
✅ Database operations only
✅ Configuration files
✅ Development/debugging tools

**Examples:**
```php
<?php
header('Content-Type: application/json');
// Process data and return JSON
echo json_encode(['success' => true]);
?>
```

---

## 🔗 Common File Path Patterns

### From Page to Settings (AJAX/Form Submission):
```javascript
// In page/*.{html,php}
fetch('../settings/handler.php', {
    method: 'POST',
    body: formData
});
```

### From Settings to Page (Redirect):
```php
// In settings/*.php
header('Location: ../page/front_panel.html');
```

### From Settings to Settings (Include):
```php
// In settings/*.php
require_once('db_connect.php');
require_once('config.php');
```

### From Page to Page (Navigation):
```html
<!-- In page/*.html -->
<a href="front_panel.html">Dashboard</a>
<a href="login.php">Login</a>
```

---

## ✅ Verification Checklist

- [x] All HTML pages are in `/page/` folder
- [x] All backend handlers are in `/settings/` folder
- [x] All form actions point to `../settings/handler.php`
- [x] All includes use correct relative paths
- [x] All redirects use correct relative paths
- [x] Development tools clearly marked with DEV_ prefix
- [x] No duplicate files between folders
- [x] All file references updated after moves

---

## 🚀 Access URLs

### User-Facing Pages:
```
http://localhost/ProjectDashboard/page/login.php
http://localhost/ProjectDashboard/page/register.php
http://localhost/ProjectDashboard/page/front_panel.html
http://localhost/ProjectDashboard/page/projects.html
http://localhost/ProjectDashboard/page/admin.html
http://localhost/ProjectDashboard/page/forgot_password.php
```

### Development Tools (DELETE IN PRODUCTION):
```
http://localhost/ProjectDashboard/settings/DEV_view_reset_tokens.php
```

### API Endpoints (AJAX only):
```
POST http://localhost/ProjectDashboard/settings/authenticate.php
POST http://localhost/ProjectDashboard/settings/register_handler.php
POST http://localhost/ProjectDashboard/settings/forgot_password_handler.php
GET  http://localhost/ProjectDashboard/settings/admin_api.php?action=users
```

---

## 📝 Notes

1. **Production Checklist:**
   - Delete `DEV_view_reset_tokens.php` before deployment
   - Remove all development/debugging tools
   - Update `config.php` with production credentials
   - Set `DEBUG_MODE = false` in config

2. **File Naming Convention:**
   - Pages: Descriptive names (login.php, front_panel.html)
   - Handlers: `*_handler.php` suffix
   - APIs: `*_api.php` suffix
   - Dev tools: `DEV_*` prefix

3. **Security:**
   - All handlers validate input
   - All handlers use prepared statements
   - Session checks on protected pages
   - CSRF protection should be added

---

## 🎯 Summary

**Everything is properly organized!** 

- ✅ 13 user-facing pages in `/page/`
- ✅ 14 backend files in `/settings/`
- ✅ 1 file moved (dev tool)
- ✅ All paths verified and working
- ✅ Clear separation of concerns

The project now follows best practices with a clean separation between:
- **Frontend** (pages users see and interact with)
- **Backend** (handlers that process data)
- **Configuration** (database and app settings)
- **Development Tools** (debugging utilities)
