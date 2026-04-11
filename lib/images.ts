import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "./supabase";

// COMMENTED OUT REPLICATE
/*
import Replicate from "replicate";
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});
*/

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });


// Helper to ensure bucket exists
async function ensureBucketExists(bucketName: string) {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
        console.error("Error listing buckets:", error);
        return; // Don't block flow, try upload anyway (it might fail if bucket doesn't exist)
    }

    const bucketExists = buckets?.some((b: { name: string }) => b.name === bucketName);
    if (!bucketExists) {
        console.log(`Bucket '${bucketName}' not found. Creating...`);
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
        });
        if (createError) {
            console.error(`Error creating bucket '${bucketName}':`, createError);
        } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
        }
    }
}

export async function generateImages(
    scenes: { sceneId: number; imagePrompt: string }[],
    seriesId: string
) {
    const images = [];

    // Ensure bucket exists once before processing loops
    await ensureBucketExists('images');

    for (const scene of scenes) {
        console.log(`Generating image for scene ${scene.sceneId} using Google Generative AI...`);

        try {
            const result = await model.generateContent(scene.imagePrompt);
            const response = await result.response;

            // Extract image from multimodal response parts (checking for inlineData)
            // Note: Gemini API structure for images might vary, ensuring we cover inlineData
            let part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            
            // Fallback: Check if the response itself has blob/data in a different way if needed
            // For gemini-*-image models, usually it's in candidates[0].content.parts[0].inlineData

            if (!part || !part.inlineData) {
                console.error("Google AI Response:", JSON.stringify(response, null, 2));
                throw new Error(`Google AI did not return an image for scene ${scene.sceneId}`);
            }

            const buffer = Buffer.from(part.inlineData.data, 'base64');

            // Upload to Supabase Storage
            const fileName = `${seriesId}/scene-${scene.sceneId}-${Date.now()}.png`;
            const { data, error } = await supabaseAdmin.storage
                .from('images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) {
                console.error(`Supabase Storage Error (scene ${scene.sceneId}):`, error);
                throw new Error(`Failed to upload image to Supabase: ${error.message}`);
            }

            // Get Public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('images')
                .getPublicUrl(fileName);

            images.push({
                sceneId: scene.sceneId,
                url: publicUrl
            });
        } catch (error) {
            console.error(`Error generating image for scene ${scene.sceneId}:`, error);
            throw error;
        }
    }

    return images;
}
