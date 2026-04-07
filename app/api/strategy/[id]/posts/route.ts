import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

async function ensureOwnership(userId: string, strategyId: string) {
    const { data } = await supabaseAdmin
        .from('strategies')
        .select('id')
        .eq('id', strategyId)
        .eq('user_id', userId)
        .single();
    return !!data;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getAuthUser();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id: strategyId } = await params;
        const owned = await ensureOwnership(userId, strategyId);
        if (!owned) {
            return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
        }

        const body = await req.json();
        const {
            day,
            platform,
            content_type,
            theme,
            idea,
            caption,
            description,
            goal,
            status,
            include_in_calendar,
            post_time,
        } = body;

        if (!platform || !content_type) {
            return NextResponse.json(
                { error: 'Platform and content_type are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('strategy_posts')
            .insert({
                strategy_id: strategyId,
                day: Number(day) ?? 1,
                platform: String(platform),
                content_type: String(content_type),
                theme: theme || null,
                idea: idea || null,
                caption: caption || null,
                description: description || null,
                goal: goal || null,
                status: status || 'planned',
                include_in_calendar: include_in_calendar !== false,
                post_time: post_time || '10:00 AM',
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[STRATEGY_POST_ADD]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
