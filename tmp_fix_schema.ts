import { supabaseAdmin } from './lib/supabase';

async function fixSchema() {
    console.log('Fixing crm_automations schema...');
    const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: 'ALTER TABLE crm_automations ADD COLUMN IF NOT EXISTS custom_date TEXT;'
    });

    if (error) {
        // Fallback if rpc exec_sql is not available
        console.log('RPC failed, trying direct query if possible or checking if column exists by inserting...');
        const { error: insertError } = await supabaseAdmin
            .from('crm_automations')
            .insert([{ title: 'Schema Test', message: 'Test', custom_date: 'Test' }])
            .select();
        
        if (insertError && insertError.message.includes('column "custom_date" of relation "crm_automations" does not exist')) {
            console.error('CRITICAL: Column custom_date is missing and RPC is not enabled. Please add it manually in Supabase SQL Editor: ALTER TABLE crm_automations ADD COLUMN custom_date TEXT;');
        } else {
            console.log('Column might already exist or was added.');
            // Cleanup test
            await supabaseAdmin.from('crm_automations').delete().eq('title', 'Schema Test');
        }
    } else {
        console.log('Schema updated successfully via RPC.');
    }
}

fixSchema();
