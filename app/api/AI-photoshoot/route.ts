import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { VideoGenerationReferenceType } from "@google/genai";
import { PROMPT_MAP, VALID_JEWELRY_TYPES, AI_PHOTOSHOOT_VARIATIONS_PER_RUN, VIDEO_PROMPT } from "@/lib/prompts";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs/promises";
import os from "os";
import path from "path";

const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const VIDEO_MODEL = "veo-3.1-generate-preview";
const AI_PHOTOSHOOT_BUCKET = "ai-photoshoot";
const PHOTO_GENERATION_CONCURRENCY = 2;

type GeminiImagePart = { inlineData?: { data?: string } };
type GeminiGenerateContentResponse = {
  candidates?: { content?: { parts?: GeminiImagePart[] } }[];
};

async function ensureBucketExists(bucketName: string) {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    throw new Error(`Unable to list storage buckets: ${error.message}`);
  }

  const exists = (buckets ?? []).some((b: { name: string }) => b.name === bucketName);
  if (exists) return;

  // Keep creation config minimal for broad compatibility across projects/plans.
  const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
    public: true,
  });
  if (createError) {
    const msg = createError.message || "unknown error";
    // If another request created it first, continue.
    if (/already exists/i.test(msg)) return;
    throw new Error(`Unable to create storage bucket '${bucketName}': ${msg}`);
  }
}

async function uploadPublicAsset(params: {
  filePath: string;
  content: Buffer;
  contentType: string;
}): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(AI_PHOTOSHOOT_BUCKET)
    .upload(params.filePath, params.content, {
      contentType: params.contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage
    .from(AI_PHOTOSHOOT_BUCKET)
    .getPublicUrl(params.filePath);

  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const modelImage = formData.get("model_image") as File | null;
    const jewelryImage = formData.get("jewelry_image") as File | null;
    let jewelryType = formData.get("jewelry_type") as string | null;
    const generationMode = (formData.get("generation_mode") as string) || "photo";
    const runSessionIdInput = (formData.get("run_session_id") as string | null)?.trim() || null;
    const variationIndexRaw = formData.get("variation_index");
    const variationIndex =
      typeof variationIndexRaw === "string" && variationIndexRaw.trim() !== ""
        ? Number(variationIndexRaw)
        : null;

    if (!modelImage || !jewelryImage || !jewelryType) {
      return NextResponse.json({ detail: "Missing required fields" }, { status: 400 });
    }

    jewelryType = jewelryType.trim().toLowerCase();
    if (!VALID_JEWELRY_TYPES.includes(jewelryType)) {
      return NextResponse.json({ detail: `Invalid jewelry_type. Must be one of: ${VALID_JEWELRY_TYPES.join(', ')}` }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const sessionId = runSessionIdInput || crypto.randomUUID().slice(0, 8);
    const tmpDir = path.join(os.tmpdir(), "ai-photoshoot");

    await ensureBucketExists(AI_PHOTOSHOOT_BUCKET);
    await fs.mkdir(tmpDir, { recursive: true });

    // ─── VIDEO MODE ──────────────────────────────────────────────────────
    if (generationMode === "video") {
      console.log(`\n==================================================`);
      console.log(`🎬 Session ${sessionId} — VIDEO mode — type: ${jewelryType}`);
      console.log(`==================================================`);

      // Read images as base64
      const jewelryBuffer = Buffer.from(await jewelryImage.arrayBuffer());
      const modelBuffer = Buffer.from(await modelImage.arrayBuffer());

      const jewelryBase64 = jewelryBuffer.toString("base64");
      const modelBase64 = modelBuffer.toString("base64");
      const jewelryMime = jewelryImage.type || "image/png";
      const modelMime = modelImage.type || "image/png";

      // Use @google/genai SDK for Veo video generation
      const ai = new GoogleGenAI({ apiKey });

      const jewelryReference = {
        image: {
          imageBytes: jewelryBase64,
          mimeType: jewelryMime,
        },
        referenceType: "ASSET" as const,
      };

      const modelReference = {
        image: {
          imageBytes: modelBase64,
          mimeType: modelMime,
        },
        referenceType: "ASSET" as const,
      };

      console.log(`  🚀 Starting Veo 3.1 Lite video generation...`);

      //debugging
      // const models = await ai.models.list();
      // console.log("Available models:", models);
      let operation = await ai.models.generateVideos({
        model: VIDEO_MODEL,
        prompt: VIDEO_PROMPT,
        config: {
          aspectRatio: "9:16",
          numberOfVideos: 1,
          referenceImages: [
            {
              image: {
                imageBytes: jewelryReference.image.imageBytes,
                mimeType: "image/jpeg",
              },
              referenceType: VideoGenerationReferenceType.ASSET,
            },
            {
              image: {
                imageBytes: modelReference.image.imageBytes,
                mimeType: "image/jpeg",
              },
              referenceType: VideoGenerationReferenceType.ASSET,
            },
          ],
        },
      });
      // Poll until done — max ~4 minutes
      const maxPollTime = 240_000; // 4 minutes
      const pollInterval = 10_000; // 10 seconds
      const startTime = Date.now();

      while (!operation.done) {
        const elapsed = Date.now() - startTime;
        if (elapsed > maxPollTime) {
          console.error(`  ❌ Video generation timed out after ${Math.round(elapsed / 1000)}s`);
          return NextResponse.json(
            { detail: "Video generation timed out. Please try again." },
            { status: 504 }
          );
        }

        const elapsedSec = Math.round(elapsed / 1000);
        console.log(`  ⏳ Polling... (${elapsedSec}s elapsed)`);
        await new Promise((r) => setTimeout(r, pollInterval));

        operation = await ai.operations.getVideosOperation({
          operation: operation,
        });
      }

      console.log(`  ✅ Video generation complete!`);

      // Extract video
      const generatedVideos = operation.response?.generatedVideos;
      if (!generatedVideos || generatedVideos.length === 0) {
        console.error(`  ❌ No video in response`);
        return NextResponse.json(
          { detail: "Video generation produced no output." },
          { status: 500 }
        );
      }

      const videoFile = generatedVideos[0].video;

      // Download video bytes
      let videoBytes: Buffer;

      if (videoFile?.uri) {
        // Download from URI using the API key
        console.log(`  📥 Downloading video from URI...`);
        const downloadResponse = await fetch(`${videoFile.uri}&key=${apiKey}`);
        if (!downloadResponse.ok) {
          // Try without appending key (URI may already include auth)
          const retryResponse = await fetch(videoFile.uri, {
            headers: { "x-goog-api-key": apiKey },
          });
          if (!retryResponse.ok) {
            throw new Error(`Failed to download video: ${retryResponse.status}`);
          }
          videoBytes = Buffer.from(await retryResponse.arrayBuffer());
        } else {
          videoBytes = Buffer.from(await downloadResponse.arrayBuffer());
        }
      } else if ("videoBytes" in (videoFile as Record<string, unknown>)) {
        // Direct bytes available
        const raw = (videoFile as { videoBytes?: string | ArrayBuffer }).videoBytes;
        if (!raw) throw new Error("Video response did not contain bytes");
        videoBytes = typeof raw === "string" ? Buffer.from(raw, "base64") : Buffer.from(raw);
      } else {
        // Try using the SDK download method by saving to a temp path
        try {
          const tempPath = path.join(tmpDir, `temp_${sessionId}.mp4`);
          await ai.files.download({
            file: videoFile!,
            downloadPath: tempPath,
          });
          videoBytes = await fs.readFile(tempPath);
        } catch (dlErr) {
          console.error("  ❌ Failed to download video via SDK:", dlErr);
          return NextResponse.json(
            { detail: "Failed to download generated video." },
            { status: 500 }
          );
        }
      }

      const videoFilename = `video_${sessionId}.mp4`;
      console.log(`  💾 Video ready: ${videoFilename} (${Math.round(videoBytes.length / 1024)}KB)`);

      const videoUrl = await uploadPublicAsset({
        filePath: `videos/${sessionId}/${videoFilename}`,
        content: videoBytes,
        contentType: "video/mp4",
      });

      return NextResponse.json({
        status: "success",
        session_id: sessionId,
        jewelry_type: jewelryType,
        type: "video",
        video_url: videoUrl,
      });
    }

    // ─── PHOTO MODE (existing logic) ──────────────────────────────────────
    async function fileToGenerativePart(file: File) {
      const buffer = Buffer.from(await file.arrayBuffer());

      return {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type || "image/png"
        }
      };
    }

    const modelPart = await fileToGenerativePart(modelImage);
    const jewelryPart = await fileToGenerativePart(jewelryImage);

    const genAI = new GoogleGenerativeAI(apiKey);
    genAI.getGenerativeModel({ model: IMAGE_MODEL });
    const prompts = PROMPT_MAP[jewelryType];
    const promptEntries = Object.entries(prompts).slice(0, AI_PHOTOSHOOT_VARIATIONS_PER_RUN);
    const selectedEntries =
      variationIndex === null
        ? promptEntries
        : Number.isInteger(variationIndex) && variationIndex >= 0 && variationIndex < promptEntries.length
          ? [promptEntries[variationIndex]]
          : null;

    if (!selectedEntries) {
      return NextResponse.json(
        { detail: `Invalid variation_index. Must be between 0 and ${Math.max(0, promptEntries.length - 1)}.` },
        { status: 400 }
      );
    }

    async function generateVariation(variationName: string, promptText: string): Promise<string> {
      const safeName = variationName.replace(/[\s\-\/]/g, "_").toLowerCase();
      const maxRetries = 3;
      let delay = 15000;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: promptText },
                    modelPart,
                    jewelryPart
                  ]
                }
              ],
              generationConfig: {
                responseModalities: ["IMAGE"]
              }
            })
          });

          if (!response.ok) {
            if (response.status === 429 && attempt < maxRetries) {
              console.log(`[RETRY ${attempt + 1}/${maxRetries}] Rate limited — waiting ${delay}ms…`);
              await new Promise(r => setTimeout(r, delay));
              delay *= 2;
              continue;
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }

          const data = (await response.json()) as GeminiGenerateContentResponse;
          const parts = data.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find((p) => p.inlineData);

          if (imagePart?.inlineData?.data) {
            const buffer = Buffer.from(imagePart.inlineData.data, "base64");
            const filename = `${safeName}_${sessionId}.png`;
            const publicUrl = await uploadPublicAsset({
              filePath: `photos/${sessionId}/${filename}`,
              content: buffer,
              contentType: "image/png",
            });
            return publicUrl;
          }

          throw new Error("No image data in response");

        } catch (e: unknown) {
          if (attempt >= maxRetries) {
            console.error(`[ERROR] ${variationName} generation failed:`, e);
            const color = safeName === "jewelry" ? "2d2d2d" : "4a3728";
            return `https://placehold.co/800x1067/${color}/fff?text=${variationName.replace(/\s/g, '+')}+failed`;
          }
        }
      }
      const fallbackName = variationName.replace(/[\s\-\/]/g, "_").toLowerCase();
      const fallbackColor = fallbackName === "jewelry" ? "2d2d2d" : "4a3728";
      return `https://placehold.co/800x1067/${fallbackColor}/fff?text=${variationName.replace(/\s/g, '+')}+failed`;
    }

    console.log(`\n==================================================`);
    console.log(`🎬 Session ${sessionId} — PHOTO mode — type: ${jewelryType} — generating ${selectedEntries.length} images`);
    console.log(`==================================================`);

    const images_data: { label: string; url: string }[] = [];
    for (let i = 0; i < selectedEntries.length; i += PHOTO_GENERATION_CONCURRENCY) {
      const batch = selectedEntries.slice(i, i + PHOTO_GENERATION_CONCURRENCY);
      const generatedBatch = await Promise.all(
        batch.map(async ([variationName, promptText]) => {
          const url = await generateVariation(variationName, promptText);
          console.log(`  ✅ ${variationName} → ${url}`);
          return { label: variationName, url };
        })
      );
      images_data.push(...generatedBatch);
    }

    return NextResponse.json({
      status: "success",
      session_id: sessionId,
      jewelry_type: jewelryType,
      type: "photo",
      images: images_data,
    });

  } catch (error: unknown) {
    console.error("[Backend Error]", error);
    const detail = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
