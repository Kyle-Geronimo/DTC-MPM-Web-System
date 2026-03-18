-- Settings Page Schema Updates
-- Adds bio field to users table for settings page functionality

-- Add bio column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT AFTER phone;

-- Ensure phone column exists (it should from base schema)
-- This is a safety check
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER full_name;

-- Add user_id alias if primary key is named 'id'
-- This ensures compatibility with both naming conventions
