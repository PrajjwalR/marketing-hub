/**
 * AI-powered reply generation for Instagram comments.
 * Uses the existing Gemini integration from lib/gemini.ts.
 */

import { model } from "./gemini";

interface GenerateReplyInput {
  postCaption: string;
  commentText: string;
  commenterUsername: string;
  aiGuidelines?: string | null;
  templateReplyText?: string | null;
}

/**
 * Generate an AI reply to an Instagram comment using Gemini.
 *
 * @returns The generated reply text
 */
export async function generateAIReply(
  input: GenerateReplyInput
): Promise<string> {
  const {
    postCaption,
    commentText,
    commenterUsername,
    aiGuidelines,
    templateReplyText,
  } = input;

  const prompt = `You are a friendly and engaging Instagram community manager. Generate a reply to a comment on an Instagram post.

CONTEXT:
- Original Post Caption: "${postCaption || "(no caption)"}"
- Comment from @${commenterUsername}: "${commentText}"
${aiGuidelines ? `- Brand Guidelines: "${aiGuidelines}"` : ""}
${templateReplyText ? `- Example tone/style to follow: "${templateReplyText}"` : ""}

RULES:
1. Warm, friendly, authentic Instagram tone
2. Maximum 1-2 sentences (keep it short and punchy)
3. Directly acknowledge what the commenter said
4. Sound human — not corporate or robotic
5. Use 1-2 relevant emojis naturally
6. No hashtags in replies
7. Don't start with "Thank you for your comment" — be creative
8. Don't use quotation marks around your reply
9. Don't tag/mention the user — Instagram does that automatically

Reply:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();

    // Remove any wrapping quotes the model may add
    if (
      (text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'"))
    ) {
      text = text.slice(1, -1);
    }

    // Safety: cap length at 300 chars (Instagram comment limit is 2200 but short is better)
    if (text.length > 300) {
      text = text.substring(0, 297) + "...";
    }

    return text;
  } catch (error: any) {
    console.error("[AI Reply] Gemini generation failed:", error);
    throw new Error(`AI reply generation failed: ${error.message}`);
  }
}
