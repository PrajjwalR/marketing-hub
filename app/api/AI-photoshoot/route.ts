import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { VideoGenerationReferenceType } from "@google/genai";
import { PROMPT_MAP, VALID_JEWELRY_TYPES, AI_PHOTOSHOOT_VARIATIONS_PER_RUN, VIDEO_PROMPT } from "@/lib/prompts";
import fs from "fs/promises";
import path from "path";

const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const VIDEO_MODEL = "veo-3.1-generate-preview";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const modelImage = formData.get("model_image") as File | null;
    const jewelryImage = formData.get("jewelry_image") as File | null;
    let jewelryType = formData.get("jewelry_type") as string | null;
    const generationMode = (formData.get("generation_mode") as string) || "photo";

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

    const sessionId = crypto.randomUUID().slice(0, 8);
    const generatedDir = path.join(process.cwd(), "public", "generated");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(generatedDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });

    // ─── VIDEO MODE ──────────────────────────────────────────────────────
    if (generationMode === "video") {
      console.log(`\n==================================================`);
      console.log(`🎬 Session ${sessionId} — VIDEO mode — type: ${jewelryType}`);
      console.log(`==================================================`);

      // Read images as base64
      const jewelryBuffer = Buffer.from(await jewelryImage.arrayBuffer());
      const modelBuffer = Buffer.from(await modelImage.arrayBuffer());

      // Save uploads
      const jewelryExt = jewelryImage.name.split(".").pop() || "png";
      const modelExt = modelImage.name.split(".").pop() || "png";
      await fs.writeFile(path.join(uploadsDir, `jewelry_${sessionId}.${jewelryExt}`), jewelryBuffer);
      await fs.writeFile(path.join(uploadsDir, `model_${sessionId}.${modelExt}`), modelBuffer);

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
      } else if ((videoFile as any)?.videoBytes) {
        // Direct bytes available
        const raw = (videoFile as any).videoBytes;
        videoBytes = typeof raw === "string" ? Buffer.from(raw, "base64") : Buffer.from(raw);
      } else {
        // Try using the SDK download method by saving to a temp path
        try {
          const tempPath = path.join(generatedDir, `temp_${sessionId}.mp4`);
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
      const videoPath = path.join(generatedDir, videoFilename);
      await fs.writeFile(videoPath, videoBytes);
      console.log(`  💾 Video saved: ${videoFilename} (${Math.round(videoBytes.length / 1024)}KB)`);

      return NextResponse.json({
        status: "success",
        session_id: sessionId,
        jewelry_type: jewelryType,
        type: "video",
        video_url: `/generated/${videoFilename}`,
      });
    }

    // ─── PHOTO MODE (existing logic) ──────────────────────────────────────
    async function fileToGenerativePart(file: File, tag: string) {
      const ext = file.name.split(".").pop() || "png";
      const buffer = Buffer.from(await file.arrayBuffer());
      const savePath = path.join(uploadsDir, `${tag}_${sessionId}.${ext}`);
      await fs.writeFile(savePath, buffer);

      return {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type || "image/png"
        }
      };
    }

    const modelPart = await fileToGenerativePart(modelImage, "model");
    const jewelryPart = await fileToGenerativePart(jewelryImage, "jewelry");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });
    const prompts = PROMPT_MAP[jewelryType];
    const promptEntries = Object.entries(prompts).slice(0, AI_PHOTOSHOOT_VARIATIONS_PER_RUN);

    async function generateVariation(variationName: string, promptText: string) {
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

          const data = await response.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find((p: any) => p.inlineData);

          if (imagePart?.inlineData?.data) {
            const buffer = Buffer.from(imagePart.inlineData.data, "base64");
            const filename = `${safeName}_${sessionId}.png`;
            const filepath = path.join(generatedDir, filename);
            await fs.writeFile(filepath, buffer);
            return `/generated/${filename}`;
          }

          throw new Error("No image data in response");

        } catch (e: any) {
          if (attempt >= maxRetries) {
            console.error(`[ERROR] ${variationName} generation failed:`, e);
            const color = safeName === "jewelry" ? "2d2d2d" : "4a3728";
            return `https://placehold.co/800x1067/${color}/fff?text=${variationName.replace(/\s/g, '+')}+failed`;
          }
        }
      }
    }

    console.log(`\n==================================================`);
    console.log(`🎬 Session ${sessionId} — PHOTO mode — type: ${jewelryType} — generating ${promptEntries.length} images`);
    console.log(`==================================================`);

    const images_data = [];
    for (const [variationName, promptText] of promptEntries) {
      const url = await generateVariation(variationName, promptText);
      console.log(`  ✅ ${variationName} → ${url}`);
      images_data.push({ label: variationName, url });
    }

    return NextResponse.json({
      status: "success",
      session_id: sessionId,
      jewelry_type: jewelryType,
      type: "photo",
      images: images_data,
    });

  } catch (error: any) {
    console.error("[Backend Error]", error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
