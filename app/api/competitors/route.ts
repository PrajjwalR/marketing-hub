import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('competitor_snapshots')
      .select('competitors_payload, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      competitors: data?.competitors_payload ?? null,
      updatedAt: data?.updated_at ?? null,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[COMPETITORS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const competitors = body?.competitors;
    if (!Array.isArray(competitors)) {
      return NextResponse.json({ error: 'Invalid competitors payload' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('competitor_snapshots').upsert(
      {
        user_id: userId,
        competitors_payload: competitors,
      },
      { onConflict: 'user_id', ignoreDuplicates: false }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[COMPETITORS_PUT]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
