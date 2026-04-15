-- Migration: Add extra fields to contacts table
-- Description: Adding location_status, birthday_details, purchase_count, and total_purchase_amount

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS location_status TEXT,
ADD COLUMN IF NOT EXISTS birthday_details TEXT,
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_purchase_amount DECIMAL(10,2) DEFAULT 0.00;
