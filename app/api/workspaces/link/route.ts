import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyFirebaseToken } from '@/lib/auth-helpers';
import { cookies } from 'next/headers';

// ─── POST /api/workspaces/link ───────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // Always use the real session token here, NOT the workspace-owner override
    const cookieStore = await cookies();
    const token = req.headers.get('Authorization')?.split('Bearer ')[1] || cookieStore.get('__session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyFirebaseToken(token);
    const myUserId = decoded.user_id || decoded.sub;
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as Record<string, string>;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: No Firebase API Key' }, { status: 500 });
    }

    // 1. Cross-verify credentials via Firebase Identity Toolkit
    const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      headers: { 'Content-Type': 'application/json' },
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.localId) {
      return NextResponse.json({ error: 'Invalid credentials. Account could not be added.' }, { status: 401 });
    }

    const targetUserId = verifyData.localId;

    if (targetUserId === myUserId) {
      return NextResponse.json({ error: 'You cannot link the account you are currently logged into.' }, { status: 400 });
    }

    // 2. Transfer ownership: find all tables where targetUserId owns the data, and set it to myUserId
    // Tables to transfer: workspaces, social_integrations, social_connections, series, videos
    
    // First, verify the target user has workspaces
    const { data: targetWorkspaces, error: wsError } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('user_id', targetUserId);

    if (wsError) throw wsError;

    if (!targetWorkspaces || targetWorkspaces.length === 0) {
      return NextResponse.json({ error: 'That account has no active workspaces to link.' }, { status: 404 });
    }

    // First, update the flag on the linked workspaces so they aren't "default" and don't clash with the primary account's default workspace
    const { error: defError } = await supabaseAdmin
      .from('workspaces')
      .update({ is_default: false })
      .in('id', targetWorkspaces.map((w: any) => w.id));

    if (defError) {
      console.error('Failed to update default flag:', defError);
      throw new Error('Database constraint error.');
    }

    // Next, update the workspaces to map to the new primary user,
    // but KEEP owner_user_id = targetUserId so data routing still works correctly.
    // We DO NOT transfer other tables like social_connections or series, 
    // because the __ws_owner cookie will automatically proxy API calls to the original targetUserId
    const results = await Promise.all([
      supabaseAdmin.from('workspaces')
        .update({ user_id: myUserId, owner_user_id: targetUserId })
        .in('id', targetWorkspaces.map((w: any) => w.id))
    ]);

    for (const res of results) {
      if (res.error) {
        console.error('Supabase transfer error:', res.error);
        throw new Error('Failed to update workspace ownership.');
      }
    }

    return NextResponse.json({ success: true, message: 'Account successfully linked and crossverified.' }, { status: 200 });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/workspaces/link:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
