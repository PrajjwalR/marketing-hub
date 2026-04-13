import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';
import { buildPowerPrompt, type PostersGenerateType } from '@/lib/posters-gemini';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const imageGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// responseModalities: IMAGE is required; otherwise the model returns text instead of an image
const imageModel = imageGenAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
    } as Parameters<typeof imageGenAI.getGenerativeModel>[0]['generationConfig'],
});

async function ensureBucketExists(bucketName: string) {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) return;
    const exists = buckets?.some((b: { name: string }) => b.name === bucketName);
    if (exists) return;
    await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    });
}

async function generateAndUploadImage(
    prompt: string,
    userId: string,
    referenceImage?: { base64: string; mimeType: string }
) {
    await ensureBucketExists('posters');

    const content: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = referenceImage
        ? [
              { inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.base64 } },
              { text: prompt },
          ]
        : [{ text: prompt }];

    const result = await imageModel.generateContent(content);
    const response = await result.response;

    const part = response.candidates?.[0]?.content?.parts?.find((p) => (p as any).inlineData) as
        | { inlineData?: { data: string } }
        | undefined;

    if (!part?.inlineData?.data) {
        console.error('Poster image generation response:', JSON.stringify(response, null, 2));
        throw new Error('Image model did not return an image');
    }

    const buffer = Buffer.from(part.inlineData.data, 'base64');
    const fileName = `${userId}/poster-${Date.now()}.png`;

    const { error: uploadError } = await supabaseAdmin.storage.from('posters').upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
    });

    if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const {
        data: { publicUrl },
    } = supabaseAdmin.storage.from('posters').getPublicUrl(fileName);

    return publicUrl;
}

async function generateVideo(prompt: string, referenceImage?: { base64: string; mimeType: string }): Promise<string> {
    const input: Record<string, unknown> = { prompt };
    if (referenceImage) {
        input.first_frame_image = `data:${referenceImage.mimeType};base64,${referenceImage.base64}`;
    }
    const output = await replicate.run('minimax/video-01:5aa835260ff7f40f4069c41185f72036accf99e29957bb4a3b3a911f3b6c1912', {
        input,
    });
    const raw = Array.isArray(output) ? output[0] : output;
    let url: string | undefined;
    if (typeof raw === 'string') {
        url = raw;
    } else if (raw && typeof (raw as { url?: () => string }).url === 'function') {
        url = String((raw as { url: () => URL }).url());
    } else if (raw && typeof raw === 'object' && 'video' in raw && typeof (raw as { video: string }).video === 'string') {
        url = (raw as { video: string }).video;
    }
    if (!url) {
        console.error('[POSTERS_GENERATE] Video output format:', typeof output, Array.isArray(output), JSON.stringify(output?.constructor?.name));
        throw new Error('Video model did not return a URL');
    }
    return url;
}

export async function POST(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const type = (body?.type || 'image') as PostersGenerateType;
        const description = String(body?.description || '').trim();

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const requirements = body?.requirements ? String(body.requirements) : undefined;
        const format = body?.format ? String(body.format) : undefined;
        const style = body?.style ? String(body.style) : undefined;
        const tone = body?.tone ? String(body.tone) : undefined;
        const referenceImageBase64 = typeof body?.referenceImageBase64 === 'string' ? body.referenceImageBase64 : undefined;
        const referenceImageMimeType =
            typeof body?.referenceImageMimeType === 'string' ? body.referenceImageMimeType : 'image/png';

        const { prompt, negativePrompt } = await buildPowerPrompt({
            type,
            description,
            requirements,
            format,
            style,
            tone,
            hasReferenceImage: !!referenceImageBase64,
        });

        // Video: free-form prompt. Image: JSON spec prompt (buildPowerPrompt handles routing).
        if (type === 'video') {
            const referenceImage =
                referenceImageBase64 ?
                    { base64: referenceImageBase64, mimeType: referenceImageMimeType }
                : undefined;
            const outputUrl = await generateVideo(prompt, referenceImage);

            const parentId = body?.parentId ? String(body.parentId) : null;
            const { data: generation, error: insertError } = await supabaseAdmin
                .from('poster_generations')
                .insert({
                    user_id: userId,
                    type: 'video',
                    output_url: outputUrl,
                    description,
                    requirements: requirements || null,
                    format: format || null,
                    style: style || null,
                    tone: tone || null,
                    prompt,
                    negative_prompt: negativePrompt || null,
                    parent_id: parentId || null,
                })
                .select('id, output_url, created_at')
                .single();

            if (insertError) {
                console.error('[POSTERS_GENERATE] Video insert failed:', insertError);
            }

            return NextResponse.json({
                prompt,
                negativePrompt,
                outputUrl,
                generationId: generation?.id ?? null,
                generation,
            }, { status: 200 });
        }

        const referenceImage =
            referenceImageBase64 ?
                { base64: referenceImageBase64, mimeType: referenceImageMimeType }
            : undefined;
        const outputUrl = await generateAndUploadImage(prompt, userId, referenceImage);

        const parentId = body?.parentId ? String(body.parentId) : null;
        const { data: generation, error: insertError } = await supabaseAdmin
            .from('poster_generations')
            .insert({
                user_id: userId,
                type,
                output_url: outputUrl,
                description,
                requirements: requirements || null,
                format: format || null,
                style: style || null,
                tone: tone || null,
                prompt,
                negative_prompt: negativePrompt || null,
                parent_id: parentId || null,
            })
            .select('id, output_url, created_at')
            .single();

        if (insertError) {
            console.error('[POSTERS_GENERATE] Insert failed:', insertError);
        }

        return NextResponse.json({
            prompt,
            negativePrompt,
            outputUrl,
            generationId: generation?.id ?? null,
            generation,
        }, { status: 200 });
    } catch (error) {
        console.error('[POSTERS_GENERATE]', error);
        const message = error instanceof Error ? error.message : 'Failed to generate';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

