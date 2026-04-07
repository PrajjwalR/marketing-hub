import { supabaseAdmin } from './lib/supabase';

async function addPostTimeColumn() {
    console.log('Adding post_time column to strategy_posts...');
    
    // Check if column exists first or just try to add it
    const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: 'ALTER TABLE strategy_posts ADD COLUMN IF NOT EXISTS post_time TEXT DEFAULT \'10:00 AM\';'
    });

    if (error) {
        console.error('Error adding column via RPC:', error);
        console.log('Attempting manual check by inserting...');
        // Try to insert a dummy to see if it works
        const { error: insertError } = await supabaseAdmin
            .from('strategy_posts')
            .insert([{ 
                strategy_id: '00000000-0000-0000-0000-000000000000', 
                day: 1, 
                platform: 'test', 
                content_type: 'test', 
                post_time: '10:00 AM' 
            }])
            .select();
        
        if (insertError && insertError.message.includes('column "post_time" of relation "strategy_posts" does not exist')) {
            console.error('CRITICAL: Column post_time is missing. Please add it manually: ALTER TABLE strategy_posts ADD COLUMN post_time TEXT DEFAULT \'10:00 AM\';');
        } else {
            console.log('Column post_time exists or was successfully handled.');
            // Cleanup if it worked
            if (!insertError) {
                await supabaseAdmin.from('strategy_posts').delete().eq('platform', 'test').eq('content_type', 'test');
            }
        }
    } else {
        console.log('Column post_time added successfully.');
    }
}

addPostTimeColumn();
