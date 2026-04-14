import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';

function normalizeContactEmail(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
}

export async function GET(req: NextRequest) {
    let userId: string;
    try {
        userId = (await getAuthUser(req)).userId;
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('owner_user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    let userId: string;
    try {
        userId = (await getAuthUser(req)).userId;
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { owner_user_id: _ignore, user_id: _u2, id: _id, email: emailRaw, ...rest } = body as Record<string, unknown>;
    const email = normalizeContactEmail(emailRaw);
    if (!email || !/.+@.+\..+/.test(email)) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const row = { ...rest, email, owner_user_id: userId };

    const { data: existing, error: findErr } = await supabaseAdmin
        .from('contacts')
        .select('id')
        .eq('owner_user_id', userId)
        .eq('email', email)
        .maybeSingle();

    if (findErr) {
        return NextResponse.json({ error: findErr.message }, { status: 500 });
    }

    if (existing?.id) {
        const { data, error } = await supabaseAdmin
            .from('contacts')
            .update(row)
            .eq('id', existing.id)
            .eq('owner_user_id', userId)
            .select()
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }

    const { data, error } = await supabaseAdmin.from('contacts').insert([row]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
    let userId: string;
    try {
        userId = (await getAuthUser(req)).userId;
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, owner_user_id: _ignore, user_id: _u2, email: emailRaw, ...updates } = body as { id?: string } & Record<string, unknown>;

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const emailNorm = emailRaw !== undefined ? normalizeContactEmail(emailRaw) : undefined;
    if (emailRaw !== undefined) {
        if (!emailNorm || !/.+@.+\..+/.test(emailNorm)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }
    }

    const { data: existing, error: exErr } = await supabaseAdmin
        .from('contacts')
        .select('id')
        .eq('id', id)
        .eq('owner_user_id', userId)
        .maybeSingle();

    if (exErr || !existing) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (emailNorm) {
        const { data: other } = await supabaseAdmin
            .from('contacts')
            .select('id')
            .eq('owner_user_id', userId)
            .eq('email', emailNorm)
            .neq('id', id)
            .maybeSingle();
        if (other?.id) {
            return NextResponse.json({ error: 'Another contact already uses this email' }, { status: 409 });
        }
    }

    const patch = {
        ...updates,
        ...(emailRaw !== undefined && emailNorm ? { email: emailNorm } : {}),
        owner_user_id: userId,
    };

    const { data, error } = await supabaseAdmin
        .from('contacts')
        .update(patch)
        .eq('id', id)
        .eq('owner_user_id', userId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    let userId: string;
    try {
        userId = (await getAuthUser(req)).userId;
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids)
        ? (body.ids as string[])
        : typeof body?.id === 'string'
          ? [body.id]
          : [];

    if (!ids.length) {
        return NextResponse.json({ error: 'id or ids is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('contacts')
        .delete()
        .eq('owner_user_id', userId)
        .in('id', ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: ids.length });
}
