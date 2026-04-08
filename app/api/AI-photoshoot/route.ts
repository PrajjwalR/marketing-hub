import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPT_MAP, VALID_JEWELRY_TYPES, AI_PHOTOSHOOT_VARIATIONS_PER_RUN } from "@/lib/prompts";
import fs from "fs/promises";
import path from "path";

const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const modelImage = formData.get("model_image") as File | null;
    const jewelryImage = formData.get("jewelry_image") as File | null;
    let jewelryType = formData.get("jewelry_type") as string | null;

    if (!modelImage || !jewelryImage || !jewelryType) {
      return NextResponse.json({ detail: "Missing required fields" }, { status: 400 });
    }

    jewelryType = jewelryType.trim().toLowerCase();
    if (!VALID_JEWELRY_TYPES.includes(jewelryType)) {
      return NextResponse.json({ detail: `Invalid jewelry_type. Must be one of: ${VALID_JEWELRY_TYPES.join(', ')}` }, { status: 400 });
    }

    const sessionId = crypto.randomUUID().slice(0, 8);
    // Vercel / Next.js public directory mapping
    const generatedDir = path.join(process.cwd(), "public", "generated");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(generatedDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

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
          // Using REST-like structure manually matching Python if typed SDK fails,
          // but we will try the direct SDK first with response modalities.
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
    console.log(`🎬 Session ${sessionId} — type: ${jewelryType} — generating ${promptEntries.length} images`);
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
      images: images_data,
    });

  } catch (error: any) {
    console.error("[Backend Error]", error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
