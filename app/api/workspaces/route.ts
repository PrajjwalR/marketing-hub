import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyFirebaseToken } from '@/lib/auth-helpers';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// ─── GET /api/workspaces ─────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    // Always use the real session user for workspace lookups (not the ws_owner override)
    const cookieStore = await cookies();
    const token = req.headers.get('Authorization')?.split('Bearer ')[1] || cookieStore.get('__session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyFirebaseToken(token);
    const userId = decoded.user_id || decoded.sub;

    // Auto-provision a default workspace the very first time
    const { data: existing } = await supabaseAdmin
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!existing || existing.length === 0) {
      // Get the name/brand name directly from the user's row in the database
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('name')
        .eq('user_id', userId)
        .single();

      const authUser = { name: decoded.name, email: decoded.email, picture: decoded.picture };
      
      // Priority: DB user name > Firebase name > Firebase email prefix > 'My Brand'
      const nameToUse = dbUser?.name || authUser.name || authUser.email?.split('@')[0] || 'My Brand';

      // Create the first "Default" workspace for this user
      const { data: created, error } = await supabaseAdmin
        .from('workspaces')
        .insert({
          user_id: userId,
          name: nameToUse,
          description: 'Default workspace',
          logo_url: authUser.picture || null,
          color: '#6366f1',
          emoji: '🏢',
          is_default: true,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json([created]);
    }

    let finalWorkspaces = existing;

    // Self-healing: if the default workspace is missing the logo, update it retroactively
    const defaultWs = finalWorkspaces.find((w: any) => w.is_default);
    if (defaultWs && !defaultWs.logo_url) {
      const authUser = { picture: decoded.picture };
      if (authUser?.picture) {
        // Update database in the background
        await supabaseAdmin
          .from('workspaces')
          .update({ logo_url: authUser.picture })
          .eq('id', defaultWs.id);
        
        // Update local response immediately so UI updates
        finalWorkspaces = finalWorkspaces.map((w: any) => 
          w.id === defaultWs.id ? { ...w, logo_url: authUser.picture } : w
        );
      }
    }

    return NextResponse.json(finalWorkspaces);
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('GET /api/workspaces:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// ─── POST /api/workspaces ────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // Always use the real session user here (not the ws_owner override)
    const cookieStore2 = await cookies();
    const postToken = req.headers.get('Authorization')?.split('Bearer ')[1] || cookieStore2.get('__session')?.value;
    if (!postToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const postDecoded = await verifyFirebaseToken(postToken);
    const userId = postDecoded.user_id || postDecoded.sub;
    const body = await req.json().catch(() => ({}));
    const { name, description, color, emoji } = body as Record<string, string>;

    const trimmedName = name?.trim();

    // "valid account" checks
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json({ error: 'Not a valid account name. Must be at least 2 characters.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .insert({
        user_id: userId,
        name: trimmedName,
        description: description?.trim() || null,
        color: color || '#6366f1',
        emoji: emoji || '🏢',
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/workspaces:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
