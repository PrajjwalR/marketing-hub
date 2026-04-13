import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { data, error } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { data, error } = await supabaseAdmin
        .from('contacts')
        .insert([body])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, ...updates } = body as { id?: string } & Record<string, unknown>;

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
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
        .in('id', ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: ids.length });
}
