import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
