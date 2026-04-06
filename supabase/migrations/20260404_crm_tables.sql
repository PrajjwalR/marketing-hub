-- Migration: CRM Contacts and Automations
-- Description: Tables to store customer data and enabled event rules.

-- 1. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    location TEXT DEFAULT 'Hyderabad',
    birthday DATE,
    last_purchase DATE,
    status TEXT DEFAULT 'Active',
    user_id UUID, -- Optional: link to owner
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CRM Automations Table (Enabled library events)
CREATE TABLE IF NOT EXISTS crm_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_name TEXT, -- Reference to the holiday name in our library
    trigger_type TEXT DEFAULT 'Holiday', -- Holiday, Birthday, Purchase, Location
    lead_time_days INTEGER DEFAULT 0,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    category TEXT, -- National, Regional, Personalized
    platform TEXT DEFAULT 'All',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add sample data (optional but helpful for testing)
-- INSERT INTO contacts (name, email, location, birthday, status) 
-- VALUES ('Rahul Sharma', 'rahul@example.com', 'Hyderabad', '1992-04-12', 'Active');
