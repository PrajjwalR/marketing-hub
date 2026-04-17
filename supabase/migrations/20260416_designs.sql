-- Migration for designs table
-- Create designs table to store canvas state and metadata

CREATE TABLE IF NOT EXISTS designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    json_data JSONB NOT NULL,
    preview_url TEXT,
    type TEXT DEFAULT 'poster', -- poster, email_graphic, social_post
    width INTEGER NOT NULL DEFAULT 1080,
    height INTEGER NOT NULL DEFAULT 1080,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own designs"
    ON designs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
    ON designs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
    ON designs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
    ON designs FOR DELETE
    USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_designs_updated_at
    BEFORE UPDATE ON designs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();



create table public.design_templates (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  type text not null,
  content jsonb not null,
  html text null,
  css text null,
  thumbnail_url text null,
  is_public boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint design_templates_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_design_templates_type on public.design_templates using btree (type) TABLESPACE pg_default;

-- Seed Data for Design Library
INSERT INTO public.design_templates (
    name, 
    description, 
    type, 
    content, 
    thumbnail_url, 
    is_public
) VALUES 
(
    'Community Spotlight: Grit', 
    'A high-energy athletic template with a bold text overlay and bottom-left branding.', 
    'social_post', 
    '{
        "canvas": {"width": 1080, "height": 1080, "background": "#000000"},
        "elements": [
            {"type": "heading", "text": "YOUR GRIT, YOUR GEAR", "style": {"font": "Impact", "color": "#FFFFFF", "size": "110px"}},
            {"type": "body", "text": "Share your journey!", "style": {"color": "#FFFFFF", "size": "32px"}},
            {"type": "cta", "text": "TAG US TO BE FEATURED", "style": {"color": "#FF6B00", "weight": "bold"}}
        ]
    }'::jsonb,
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    true
),
(
    'Seasonal Performance Sale', 
    'Clean, minimalist layout for promotional fitness gear sales.', 
    'poster', 
    '{
        "canvas": {"width": 1080, "height": 1920, "background": "#f5f5f5"},
        "elements": [
            {"type": "heading", "text": "PERFORMANCE SALE", "style": {"font": "Inter", "color": "#000000", "size": "120px"}},
            {"type": "body", "text": "UP TO 50% OFF", "style": {"color": "#FF0000", "size": "60px", "weight": "bold"}},
            {"type": "cta", "text": "SHOP NOW AT CACO.COM", "style": {"color": "#000000", "weight": "bold"}}
        ]
    }'::jsonb,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    true
);