import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
        const typeFilter = searchParams.get('type') as 'image' | 'video' | null;

        let query = supabaseAdmin
            .from('poster_generations')
            .select('id, type, output_url, description, requirements, format, style, tone, prompt, negative_prompt, parent_id, saved, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (typeFilter === 'image' || typeFilter === 'video') {
            query = query.eq('type', typeFilter);
        }

        const { data: generations, error } = await query;

        if (error) {
            console.error('[POSTERS_GENERATIONS]', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ generations: generations ?? [] });
    } catch (e) {
        console.error('[POSTERS_GENERATIONS]', e);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
