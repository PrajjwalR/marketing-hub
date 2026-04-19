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
    const { userId } = await getAuthUser(request);
    const body = await request.json();
    const { 
      name, 
      json_data, 
      type, 
      width, 
      height, 
      preview_url, 
      thumbnail_base64 
    } = body;

    if (!name || !json_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let finalPreviewUrl = preview_url;

    // Handle server-side thumbnail upload if base64 is provided
    if (thumbnail_base64 && thumbnail_base64.startsWith('data:image')) {
      try {
        const base64Data = thumbnail_base64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `thumbnails/${userId}-${Date.now()}.png`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('designs')
          .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('designs')
            .getPublicUrl(fileName);
          finalPreviewUrl = publicUrl;
        }
      } catch (uploadErr) {
        console.error('[THUMBNAIL_UPLOAD_ERROR]', uploadErr);
        // Continue without thumbnail if upload fails
      }
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
          preview_url: finalPreviewUrl,
          user_id: userId // Using Firebase UID directly now that schema is fixed
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
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
