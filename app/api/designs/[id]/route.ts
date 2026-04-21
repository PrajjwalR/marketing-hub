import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

/**
 * GET /api/designs/[id]
 * Get a specific design
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('designs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/designs/[id]
 * Update a design
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser(request);
    const { id } = await params;
    const body = await request.json();
    const { thumbnail_base64, ...updateData } = body;

    let finalPreviewUrl = updateData.preview_url;

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
      }
    }

    const { data, error } = await supabaseAdmin
      .from('designs')
      .update({
        ...updateData,
        preview_url: finalPreviewUrl
      })
      .eq('id', id)
      .eq('user_id', userId) // Using Firebase UID directly now that schema is fixed
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[DESIGNS_PATCH_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/designs/[id]
 * Delete a design
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('designs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
