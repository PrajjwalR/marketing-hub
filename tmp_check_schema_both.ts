import { supabaseAdmin } from './lib/supabase';

async function checkSchema() {
    const { data: postsData, error: postsError } = await supabaseAdmin
        .from('strategy_posts')
        .select('*')
        .limit(1);
    
    if (postsData && postsData[0]) {
        console.log('Columns in strategy_posts:', Object.keys(postsData[0]));
    } else {
        console.log('No data found in strategy_posts');
    }

    const { data: strategiesData, error: strategiesError } = await supabaseAdmin
        .from('strategies')
        .select('*')
        .limit(1);

    if (strategiesData && strategiesData[0]) {
        console.log('Columns in strategies:', Object.keys(strategiesData[0]));
    } else {
        console.log('No data found in strategies');
    }
}

checkSchema();
