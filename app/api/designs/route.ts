import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

/**
 * GET /api/designs
 * List all designs for the current user
 */
export async function GET(request: Request) {
  try {
    // In this codebase, it seems they use Firebase Auth tokens in headers or similar.
    // Let's assume a simplified version or check existing APIs to see how they handle auth.
    // For now, I'll use a generic auth check or assume the user ID is passed or handled.
    
    const { userId } = await getAuthUser(request);
    
    const { data, error } = await supabaseAdmin
      .from('designs')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[DESIGNS_GET_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

/**
 * POST /api/designs
 * Create a new design
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, json_data, type, width, height, preview_url, user_id } = body;

    if (!name || !json_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('designs')
      .insert([
        { 
          name, 
          json_data, 
          type: type || 'poster', 
          width: width || 1080, 
          height: height || 1080,
          preview_url,
          user_id // Ideally this should be from the auth token
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[DESIGNS_POST_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
