-- Migration: Add contact (phone) field to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS contact TEXT;
