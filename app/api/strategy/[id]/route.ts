import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

async function ensureOwnership(userId: string, strategyId: string) {
    const { data, error } = await supabaseAdmin
        .from('strategies')
        .select('id')
        .eq('id', strategyId)
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return false;
    }
    return true;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;

        const { data: strategy, error: strategyError } = await supabaseAdmin
            .from('strategies')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (strategyError || !strategy) {
            return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
        }

        const { data: posts, error: postsError } = await supabaseAdmin
            .from('strategy_posts')
            .select('*')
            .eq('strategy_id', id)
            .order('day', { ascending: true })
            .order('created_at', { ascending: true });

        if (postsError) {
            return NextResponse.json({ error: postsError.message }, { status: 500 });
        }

        return NextResponse.json({ ...strategy, posts: posts || [] });
    } catch (error) {
        console.error('[STRATEGY_GET_ID]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const owned = await ensureOwnership(userId, id);
        if (!owned) {
            return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
        }

        const body = await req.json();
        const { name, ...rest } = body;

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (typeof name === 'string') updates.name = name;
        Object.assign(updates, rest);

        const { data, error } = await supabaseAdmin
            .from('strategies')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[STRATEGY_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const owned = await ensureOwnership(userId, id);
        if (!owned) {
            return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
        }

        await supabaseAdmin.from('strategy_posts').delete().eq('strategy_id', id);
        const { error } = await supabaseAdmin.from('strategies').delete().eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[STRATEGY_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
