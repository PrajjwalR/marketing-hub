import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmjwtruvfgddcubonjlz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtand0cnV2ZmdkZGN1Ym9uamx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwODUyOCwiZXhwIjoyMDY1NDg0NTI4fQ.FSUeTgDfVS5WaCbjwEJ16Wa8Gh-27UPEUCo2_0rVxsk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAll() {
    console.log("--- Supabase Full Identity Check ---");
    const { data: users, error: userError } = await supabase.from('users').select('*').limit(1);
    console.log("Single User Sample:", JSON.stringify(users, null, 2));
    if (userError) console.error("User Table Error:", userError);

    const { data: verticals, error: verticalError } = await supabase.from('users').select('business_vertical').not('business_vertical', 'is', null).limit(10);
    console.log("Industries Defined:", JSON.stringify(verticals, null, 2));
}

checkAll();
