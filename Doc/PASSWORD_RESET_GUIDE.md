# Password Reset Request System - User Guide

## Overview
The password reset system allows users to submit password reset requests that require admin approval before taking effect.

## How It Works

### For Users (Forgot Password Page)

1. **Access the forgot password page:**
   - Navigate to: `http://localhost/ProjectDashboard/page/forgot_password.php`
   - Or click "Forgot Password?" on the login page

2. **Submit a password reset request:**
   - Enter your registered email address
   - Enter your desired new password
   - Confirm the new password
   - Click "Send Password Reset Request"

3. **What happens next:**
   - Your request is stored in the database with status "pending"
   - A confirmation email is sent to you (on localhost, check error logs for the email content)
   - Your request waits for admin approval
   - Your password will NOT change until an admin approves it

### For Admins (Admin Panel)

1. **Access the admin panel:**
   - Navigate to: `http://localhost/ProjectDashboard/page/admin.html`
   - Click on the "🔐 Password Resets" tab

2. **View password reset requests:**
   - See all requests with their status (Pending/Approved/Rejected/Expired)
   - Search by email
   - Filter by status

3. **Process requests:**
   - **Approve:** Click the green "Approve" button
     - The user's password is immediately updated
     - Request status changes to "approved"
     - Activity is logged
   - **Reject:** Click the red "Reject" button
     - The request is marked as rejected
     - User's password remains unchanged

## Database Schema

The `password_reset_tokens` table stores all requests with:
- `email`: User's email address
- `token`: Unique security token
- `new_password_hash`: SHA256 hash of the requested new password
- `approval_status`: pending | approved | rejected
- `admin_id`: ID of admin who processed the request (future feature)
- `expires_at`: Expiration time (1 hour from creation)
- `created_at`: When the request was created
- `used`: Boolean flag if token was used
- `used_at`: When the password was actually changed

## Testing the System

### Step 1: Register a Test User
```
1. Go to: http://localhost/ProjectDashboard/page/register.php
2. Fill in the registration form with a test email
3. Submit the form
```

### Step 2: Submit Password Reset Request
```
1. Go to: http://localhost/ProjectDashboard/page/forgot_password.php
2. Enter the email you just registered
3. Enter a new password (min 6 characters)
4. Confirm the password
5. Click "Send Password Reset Request"
6. You should see: "Password reset request submitted successfully! An admin will review your request."
```

### Step 3: Admin Reviews and Approves
```
1. Go to: http://localhost/ProjectDashboard/page/admin.html
2. Click "🔐 Password Resets" tab
3. You should see your pending request
4. Click "Approve" button
5. Confirm the action
6. The request status changes to "approved"
```

### Step 4: Login with New Password
```
1. Go to: http://localhost/ProjectDashboard/page/login.php
2. Login with your email and the NEW password you requested
3. You should successfully log in!
```

## API Endpoints

### For Password Reset Requests
- **Submit Request:** `POST /settings/forgot_password_handler.php`
  - Parameters: `email`, `new_password`
  - Response: Success/error message

### For Admin Panel
- **Get All Requests:** `GET /settings/admin_api.php?action=password_resets`
- **Approve Request:** `POST /settings/admin_api.php?action=approve_reset`
  - Parameters: `id` (request ID)
- **Reject Request:** `POST /settings/admin_api.php?action=reject_reset`
  - Parameters: `id` (request ID)

## Security Features

1. **Password Hashing:** All passwords are hashed with SHA256 before storage
2. **Email Validation:** System validates email exists before accepting request
3. **Password Validation:** Minimum 6 characters required
4. **Expiration:** Requests expire after 1 hour
5. **Admin Control:** Passwords don't change until admin approves
6. **Activity Logging:** All password resets are logged in activity_log table

## Status Types

- **Pending:** Request submitted, waiting for admin approval
- **Approved:** Admin approved, password has been changed
- **Rejected:** Admin rejected the request
- **Expired:** Request is older than 1 hour and no longer valid

## Troubleshooting

### "Email address not found in our system"
- Make sure you register a user first before requesting password reset

### "Error loading password reset requests" in admin panel
- Check that all database columns exist (run update_password_reset_tokens.sql)
- Check browser console for JavaScript errors
- Verify XAMPP MySQL is running

### "Passwords do not match"
- Make sure you enter the same password in both fields

### No email received
- On localhost, emails are not actually sent
- Check the PHP error logs for the email content and reset link
- For development, use the debug_info in the API response

## Files Modified

1. `page/forgot_password.php` - Added new password fields
2. `settings/forgot_password_handler.php` - Handles password reset requests
3. `settings/admin_api.php` - API endpoints for admin panel
4. `page/admin.html` - Added Password Resets tab
5. `js/admin.js` - JavaScript for managing password reset requests
6. `settings/update_password_reset_tokens.sql` - Database schema updates

## Future Enhancements

- Email notifications when request is approved/rejected
- Admin comments/notes on requests
- Bulk approve/reject functionality
- Request history and audit trail
- Password strength meter
- Two-factor authentication for password resets
