# 🚀 Getting Started

## Quick Start (30 seconds)
1. Set up database: `mysql -u root -p < Database/project_management_db.sql` (or import through phpMyAdmin)
2. Configure connection: Edit `settings/db_connect.php`
3. Copy config: `cp settings/config.template.php settings/config.php`
4. Visit: `http://localhost/ProjectDashboard/`
5. Login with test credentials (see `Database/project_management_db.sql`)

## First Time Users
- Visit `QUICKSTART.html` for interactive tutorial
- Check `PASSWORD_RESET_GUIDE.md` for password reset flow
- Review `Doc/MYSQL_DATABASE_SCHEMA.md` for complete database structure and setup
- Reference `Doc/DATABASE_STRUCTURE_DIAGRAM.txt` for legacy ERD diagrams

## Installation & Setup

### Prerequisites
- XAMPP/WAMP/LAMP server running
- MySQL client or phpMyAdmin access
- Git (optional)

### 1. Database Setup
Run the main database setup script to create all tables and sample data:

```bash
# Using MySQL CLI
mysql -u root -p < Database/project_management_db.sql

# Or import through phpMyAdmin:
# 1. Open phpMyAdmin (http://localhost/phpmyadmin)
# 2. Click "Import"
# 3. Select Database/project_management_db.sql
# 4. Click "Go"
```

**Optional Schema Updates:**
If upgrading from a previous version, run additional schema updates:
```bash
mysql -u [username] -p [database_name] < settings/schema_updates.sql
mysql -u [username] -p [database_name] < settings/password_reset_tokens.sql
```

### 2. Configure Database Connection
Edit `settings/db_connect.php` and update your database credentials:

```php
define('DB_HOST', 'localhost');      // Database host
define('DB_USER', 'your_username');   // Database user
define('DB_PASS', 'your_password');   // Database password
define('DB_NAME', 'project_management_db');  // Database name
```

### 3. Configure Application Settings
Copy the configuration template and customize it:

```bash
# Copy template to config.php
cp settings/config.template.php settings/config.php
```

Edit `settings/config.php` with your application settings:
```php
// Email configuration
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_USER', 'your-email@gmail.com');
define('MAIL_PASS', 'your-app-password');
define('MAIL_FROM', 'noreply@yourdomain.com');

// Application settings
define('APP_NAME', 'Project Dashboard');
define('APP_URL', 'http://localhost/ProjectDashboard');
define('TIMEZONE', 'America/New_York');
```

### 4. Deploy Files
1. Copy all files to your web server's public directory:
   ```bash
   # For XAMPP (Windows)
   Copy all files to: C:\xampp\htdocs\ProjectDashboard
   
   # For Linux
   Copy all files to: /var/www/html/ProjectDashboard
   ```

2. Set proper file permissions:
   ```bash
   # Linux/Mac
   chmod 755 settings/
   chmod 644 settings/*.php
   chmod 644 settings/*.sql
   ```

3. Ensure `.htaccess` file is present in the root directory for URL rewriting

### 5. Test Database Connection
Before accessing the application, verify database connectivity:

Navigate to: `http://localhost/ProjectDashboard/settings/test_db.php`

This will test if the database connection is working properly.

### 6. Access the Application
Open your browser and navigate to:

```
http://localhost/ProjectDashboard/
```

**Default Credentials** (if sample data loaded):
- The database includes sample users for testing
- Check `Database/project_management_db.sql` for default user credentials

### 7. First Login
1. Click "Login" on the welcome page
2. Use credentials from sample data or create a new account
3. You'll be redirected to the Front Panel dashboard after successful login

## 🔐 Security Configuration

### Important Security Steps:
1. **Update all default credentials** in the database
2. **Remove or disable** `DEV_view_reset_tokens.php` in production
3. **Remove or disable** test files (`test_db.php`, `test_create.php`) in production
4. **Configure email service** for password resets and notifications
5. **Set proper file permissions** on sensitive files
6. **Enable HTTPS** on production server
7. **Configure session timeout** in `session_manager.php`
8. **Secure .htaccess** against directory traversal attacks
