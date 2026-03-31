import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/** Structured JSON array of strings — avoids markdown / malformed arrays in prompt suggestions */
export const posterSuggestionsModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
    },
});

export const generateScriptPrompt = (niche: string, duration: string, style: string) => {
  const sceneCount = duration === '30-50' ? '4-5' : '5-6';

  const styleGuides: Record<string, string> = {
    '3d-render': 'High-end 3D animation, Octane render, 8k, Pixar/Disney style, vibrant colors, soft lighting, detailed textures.',
    'anime': 'Modern high-quality anime style, vibrant colors, expressive characters, detailed backgrounds, Studio Ghibli or Makoto Shinkai aesthetic.',
    'cinematic': 'Hyper-realistic, cinematic lighting, 8k resolution, photorealistic, dramatic film look, shallow depth of field, blockbuster movie aesthetic.',
    'cyberpunk': 'Neon lights, futuristic cityscapes, dark atmosphere with vibrant neon accents (blue, pink, purple), rain-slicked streets, high-tech low-life aesthetic.',
    'gta': 'Grand Theft Auto V digital art style, saturated colors, stylized cel-shaded look, dramatic action poses, gritty urban environment.',
    'comic': 'Classic comic book style, bold outlines, halftones, vibrant colors, dynamic action lines, hand-drawn aesthetic.',
  };

  const selectedStyleGuide = styleGuides[style] || style;

  return `
    You are a professional video script writer and visual director. Generate a high-quality video script for a series in the "${niche}" niche.
    
    Video Duration: ${duration} seconds
    Video Style: ${style}
    Style Aesthetic Guide: ${selectedStyleGuide} (CRITICAL: Every scene's visual element MUST strictly adhere to this guide)

    Requirements:
    1. Title: Provide a catchy "title" for the video.
    2. Summary: Provide a 1-sentence "summary" of the video story/content.
    3. Script: Provide a natural, conversational "script" for a voiceover. It should be engaging and fit the duration perfectly.
    4. Scenes: Provide exactly ${sceneCount} "scenes". The scenes must break down the full "script" into logical parts. Each scene must have:
       - "sceneId": A unique number starting from 1.
       - "text": The specific segment of the "script" that belongs to this scene.
       - "imagePrompt": A highly detailed, cinematic image generation prompt. 
         IMPORTANT: The prompt MUST start with the style descriptors: "${selectedStyleGuide}". 
         Then, describe the specific visual action in the scene while maintaining the "${style}" aesthetic throughout. 
         Include details about lighting, camera angle, and background that match the style.

    Response Format:
    Return ONLY a valid JSON object. No raw text, no markdown code blocks.
    JSON structure:
    {
      "title": "...",
      "summary": "...",
      "script": "...",
      "scenes": [
        { 
          "sceneId": 1, 
          "text": "...", 
          "imagePrompt": "..."
        },
        ...
      ]
    }
    `;
};
