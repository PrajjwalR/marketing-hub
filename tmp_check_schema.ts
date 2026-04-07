import { supabaseAdmin } from './lib/supabase';

async function checkSchema() {
    const { data, error } = await supabaseAdmin
        .from('strategy_posts')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (data && data[0]) {
        console.log('Columns in strategy_posts:', Object.keys(data[0]));
    } else {
        console.log('No data found in strategy_posts, but query succeeded.');
    }
}

checkSchema();
