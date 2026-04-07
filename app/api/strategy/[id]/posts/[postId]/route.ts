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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; postId: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id: strategyId, postId } = await params;
        const owned = await ensureOwnership(userId, strategyId);
        if (!owned) {
            return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
        }

        const body = await req.json();
        const updates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        const allowed = [
            'day',
            'platform',
            'content_type',
            'theme',
            'idea',
            'caption',
            'description',
            'goal',
            'status',
            'include_in_calendar',
            'media_url',
            'post_time',
        ];
        for (const key of allowed) {
            if (key in body) updates[key] = body[key];
        }

        const { data, error } = await supabaseAdmin
            .from('strategy_posts')
            .update(updates)
            .eq('id', postId)
            .eq('strategy_id', strategyId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[STRATEGY_POST_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; postId: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id: strategyId, postId } = await params;
        const owned = await ensureOwnership(userId, strategyId);
        if (!owned) {
            return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
        }

        const { error } = await supabaseAdmin
            .from('strategy_posts')
            .delete()
            .eq('id', postId)
            .eq('strategy_id', strategyId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[STRATEGY_POST_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
