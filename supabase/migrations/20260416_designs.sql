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
