import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

// ─── PATCH /api/workspaces/[id] ─────────────────────────────────────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { name, description, color, emoji } = body as Record<string, string>;

    // Verify ownership
    const { data: ws } = await supabaseAdmin
      .from('workspaces')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!ws) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const update: Record<string, string | null> = { updated_at: new Date().toISOString() };
    if (typeof name === 'string' && name.trim()) update.name = name.trim();
    if ('description' in body) update.description = description?.trim() || null;
    if (typeof color === 'string' && color.trim()) update.color = color.trim();
    if (typeof emoji === 'string' && emoji.trim()) update.emoji = emoji.trim();

    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('PATCH /api/workspaces/[id]:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// ─── DELETE /api/workspaces/[id] ────────────────────────────────────────────
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser(req);
    const { id } = await params;

    // Cannot delete default workspace
    const { data: ws } = await supabaseAdmin
      .from('workspaces')
      .select('id, user_id, is_default')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!ws) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (ws.is_default) {
      return NextResponse.json({ error: 'Cannot delete the default workspace' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('DELETE /api/workspaces/[id]:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
