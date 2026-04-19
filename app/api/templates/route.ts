import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

/**
 * GET /api/templates
 * Fetches public design templates from the design_templates table.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[TEMPLATES_GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/templates
 * Saves the current design as a reusable template in design_templates.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await getAuthUser(request);
    const body = await request.json();
    const { name, json_data, thumbnail_base64, width, height, category } = body;

    if (!name || !json_data) {
      return NextResponse.json({ error: 'name and json_data are required' }, { status: 400 });
    }

    let preview_url: string | null = null;

    // Upload thumbnail if provided
    if (thumbnail_base64 && thumbnail_base64.startsWith('data:image')) {
      try {
        const base64Data = thumbnail_base64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `template-thumbs/${userId}-${Date.now()}.png`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('designs')
          .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('designs')
            .getPublicUrl(fileName);
          preview_url = publicUrl;
        }
      } catch (e) {
        console.error('[TEMPLATE_THUMB_UPLOAD]', e);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('design_templates')
      .insert([{
        name,
        content: json_data,
        thumbnail_url: preview_url,
        type: category || 'user',
        is_public: false,
        created_by: userId,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[TEMPLATES_POST]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
