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

async function generateImageBuffer(
    prompt: string,
    referenceImages?: Array<{ base64: string; mimeType: string }>
) {
    const content: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    for (const ref of referenceImages || []) {
        content.push({ inlineData: { mimeType: ref.mimeType, data: ref.base64 } });
    }
    content.push({ text: prompt });

    const result = await imageModel.generateContent(content);
    const response = await result.response;

    const part = response.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: unknown }) => Boolean(p.inlineData)
    ) as
        | { inlineData?: { data: string } }
        | undefined;

    if (!part?.inlineData?.data) {
        console.error('Poster image generation response:', JSON.stringify(response, null, 2));
        throw new Error('Image model did not return an image');
    }

    return Buffer.from(part.inlineData.data, 'base64');
}

async function uploadPosterBuffer(buffer: Buffer, userId: string) {
    await ensureBucketExists('posters');
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
        const referenceImagesInput = Array.isArray(body?.referenceImages) ? body.referenceImages : [];
        type ParsedReference = { base64: string; mimeType: string; role: string };
        const referenceImageBase64 = typeof body?.referenceImageBase64 === 'string' ? body.referenceImageBase64 : undefined;
        const referenceImageMimeType =
            typeof body?.referenceImageMimeType === 'string' ? body.referenceImageMimeType : 'image/png';
        const multiReferences = referenceImagesInput
            .map((entry: unknown): ParsedReference => {
                const obj = entry as Record<string, unknown>;
                const base64 = typeof obj.base64 === 'string' ? obj.base64 : '';
                const mimeType = typeof obj.mimeType === 'string' ? obj.mimeType : 'image/png';
                const role = typeof obj.role === 'string' ? obj.role : 'scene_reference';
                return { base64, mimeType, role };
            })
            .filter((x: ParsedReference) => x.base64.length > 0);
        const fallbackReference =
            referenceImageBase64
                ? [{ base64: referenceImageBase64, mimeType: referenceImageMimeType, role: 'scene_reference' }]
                : [];
        const allReferences = multiReferences.length ? multiReferences : fallbackReference;

        const { prompt, negativePrompt } = await buildPowerPrompt({
            type,
            description,
            requirements,
            format,
            style,
            tone,
            hasReferenceImage: allReferences.length > 0,
        });
        const referenceHints = allReferences.length
            ? `\n\nReference context (use all images):\n${allReferences
                  .map((r: ParsedReference, i: number) => `- Image ${i + 1}: role=${r.role}`)
                  .join('\n')}`
            : '';
        const finalPrompt = `${prompt}${referenceHints}`;

        // Video: free-form prompt. Image: JSON spec prompt (buildPowerPrompt handles routing).
        if (type === 'video') {
            const referenceImage =
                allReferences.length > 0
                    ? { base64: allReferences[0]!.base64, mimeType: allReferences[0]!.mimeType }
                    : undefined;
            const outputUrl = await generateVideo(finalPrompt, referenceImage);

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
                    prompt: finalPrompt,
                    negative_prompt: negativePrompt || null,
                    parent_id: parentId || null,
                })
                .select('id, output_url, created_at')
                .single();

            if (insertError) {
                console.error('[POSTERS_GENERATE] Video insert failed:', insertError);
            }

            return NextResponse.json({
                prompt: finalPrompt,
                negativePrompt,
                outputUrl,
                generationId: generation?.id ?? null,
                generation,
            }, { status: 200 });
        }

        const generatedBuffer = await generateImageBuffer(
            finalPrompt,
            allReferences.map((r: ParsedReference) => ({ base64: r.base64, mimeType: r.mimeType }))
        );
        const outputUrl = await uploadPosterBuffer(generatedBuffer, userId);

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
                prompt: finalPrompt,
                negative_prompt: negativePrompt || null,
                parent_id: parentId || null,
            })
            .select('id, output_url, created_at')
            .single();

        if (insertError) {
            console.error('[POSTERS_GENERATE] Insert failed:', insertError);
        }

        return NextResponse.json({
            prompt: finalPrompt,
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

