-- Update Password Reset Tokens Table
-- Add new_password_hash column to store the requested new password

USE project_management_db;

-- Add new_password_hash column if it doesn't exist
ALTER TABLE password_reset_tokens 
ADD COLUMN IF NOT EXISTS new_password_hash VARCHAR(255) DEFAULT NULL AFTER token;

-- Add approval status column
ALTER TABLE password_reset_tokens 
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER new_password_hash;

-- Add admin_id column to track who approved/rejected
ALTER TABLE password_reset_tokens 
ADD COLUMN IF NOT EXISTS admin_id INT DEFAULT NULL AFTER approval_status;

-- Add used_at timestamp column
ALTER TABLE password_reset_tokens 
ADD COLUMN IF NOT EXISTS used_at DATETIME DEFAULT NULL AFTER used;

-- Update existing records to have pending status
UPDATE password_reset_tokens 
SET approval_status = 'pending' 
WHERE approval_status IS NULL;

-- Show updated table structure
DESCRIBE password_reset_tokens;
