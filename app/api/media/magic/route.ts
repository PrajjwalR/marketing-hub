import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function POST(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json();
        const { image, action } = body;

        if (!image) return NextResponse.json({ error: 'Image is required' }, { status: 400 });

        let outputUrl = '';

        if (action === 'remove-bg') {
            const output = await replicate.run(
                "cjwbw/rembg:fb8a57bb237f77e83db3510f6a36406d4af4463fe57e93dc4474706c09bda439",
                {
                    input: {
                        image: image
                    }
                }
            );
            outputUrl = Array.isArray(output) ? (output[0] as string) : (output as unknown as string);
        } else if (action === 'erase') {
            // Placeholder for Magic Erase - for now using a cleanup model
            const output = await replicate.run(
                "timothybrooks/instruct-pix2pix:172283085202ed69e763b652614b998cf931ff7188b9070a259c40212f45e2cd",
                {
                    input: {
                        image: image,
                        prompt: "remove the main object from the image and blend with background",
                        num_inference_steps: 20,
                        guidance_scale: 7.5,
                        image_guidance_scale: 1.5
                    }
                }
            );
            outputUrl = Array.isArray(output) ? (output[0] as string) : (output as unknown as string);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Upload result to Supabase Storage so we have a permanent link
        const res = await fetch(outputUrl);
        const buffer = Buffer.from(await res.arrayBuffer());
        const fileName = `${userId}/magic-${Date.now()}.png`;

        const { error: uploadError } = await supabaseAdmin.storage.from('media').upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: true
        });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabaseAdmin.storage.from('media').getPublicUrl(fileName);

        // Optionally save to media_assets
        await supabaseAdmin.from('media_assets').insert({
            user_id: userId,
            name: `Magic ${action} ${Date.now()}`,
            url: publicUrl,
            type: 'image/png',
            size: buffer.length
        });

        return NextResponse.json({ url: publicUrl });

    } catch (error: any) {
        console.error('[MAGIC_AI]', error);
        return NextResponse.json({ error: error.message || 'AI processing failed' }, { status: 500 });
    }
}
