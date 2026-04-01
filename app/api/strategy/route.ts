import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('strategies')
            .select(`
                *,
                strategy_posts(count)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const strategies = (data || []).map((s: Record<string, unknown>) => {
            const { strategy_posts, ...rest } = s;
            const postsCount = Array.isArray(strategy_posts) && strategy_posts[0] && typeof strategy_posts[0] === 'object' && 'count' in strategy_posts[0]
                ? (strategy_posts[0] as { count: number }).count
                : 0;
            return { ...rest, posts_count: postsCount };
        });

        return NextResponse.json(strategies);
    } catch (error) {
        console.error('[STRATEGY_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
