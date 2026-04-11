import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

const BUCKET = 'media';

async function ensureBucketExists() {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (buckets?.some((b: { name: string }) => b.name === BUCKET)) return;
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
}

async function ensureOwnership(userId: string, strategyId: string) {
    const { data } = await supabaseAdmin
        .from('strategies')
        .select('id')
        .eq('id', strategyId)
        .eq('user_id', userId)
        .single();
    return !!data;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) return new NextResponse('Unauthorized', { status: 401 });

        const { id } = await params;
        const owned = await ensureOwnership(userId, id);
        if (!owned) return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });

        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file || !file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Valid image file required' }, { status: 400 });
        }

        await ensureBucketExists();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `strategies/${id}/${crypto.randomUUID()}.${ext}`;

        const { error: storageError } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(fileName, buffer, { contentType: file.type, upsert: true });

        if (storageError) {
            console.error('[STRATEGY_IMAGE] Storage error:', storageError);
            return NextResponse.json({
                error: storageError.message || 'Storage upload failed',
            }, { status: 500 });
        }

        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        const { data: strategy, error } = await supabaseAdmin
            .from('strategies')
            .update({
                image_url: urlData.publicUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[STRATEGY_IMAGE] DB update error:', error);
            return NextResponse.json({
                error: error.message || 'Failed to save image URL. Ensure the image_url column exists (run migration).',
            }, { status: 500 });
        }
        return NextResponse.json({ imageUrl: strategy.image_url });
    } catch (e) {
        console.error('[STRATEGY_IMAGE]', e);
        const msg = e instanceof Error ? e.message : 'Internal error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
