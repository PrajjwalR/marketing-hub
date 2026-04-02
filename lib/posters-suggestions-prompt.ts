import type { StrategyPostersContext } from './strategy-posters-context';

/** Keeps Gemini from emitting near-JSON that breaks JSON.parse */
const JSON_OUTPUT_RULES = `
Output formatting (critical):
- Return exactly one JSON array of 8 strings and nothing else — no markdown, no code fences, no commentary.
- Use only standard straight double quotes (") for strings. Do not use curly/smart quotes.
- Escape any double-quote character inside a prompt as \\".
- Keep each string on a single line when possible; if needed use \\n — never end a string with an unescaped real newline.
- No trailing comma after the last item. Valid JSON only.
`;

export function formatStrategyContextBlock(ctx: StrategyPostersContext): string {
    const p = ctx.post;
    const lines: string[] = [
        `Strategy name: ${ctx.strategyName}`,
        ctx.brandName ? `Brand: ${ctx.brandName}` : '',
        ctx.businessType ? `Business / vertical: ${ctx.businessType}` : '',
        ctx.targetAudience ? `Target audience: ${ctx.targetAudience}` : '',
        ctx.strategyGoal ? `Strategy goal: ${ctx.strategyGoal}` : '',
        ctx.campaignTheme ? `Campaign theme: ${ctx.campaignTheme}` : '',
        ctx.platforms?.length ? `Strategy platforms: ${ctx.platforms.join(', ')}` : '',
        `Planned day in campaign: Day ${p.day} of ${ctx.durationDays}`,
        ctx.scheduledDateLabel ? `Calendar target date: ${ctx.scheduledDateLabel}` : '',
        `This post — platform: ${p.platform}`,
        `This post — content type: ${p.contentType}`,
        p.theme ? `This post — content theme: ${p.theme}` : '',
        p.idea ? `This post — idea / title: ${p.idea}` : '',
        p.caption ? `This post — caption direction: ${p.caption}` : '',
        p.description ? `This post — extra notes: ${p.description}` : '',
        p.goal ? `This post — post-level goal: ${p.goal}` : '',
    ];
    return lines.filter(Boolean).join('\n');
}

export function buildGenericSuggestionsPrompt(type: 'image' | 'video', style?: string, tone?: string): string {
    const medium =
        type === 'image'
            ? 'Image editing / poster generation — backgrounds, style changes, product shots, portraits, promotional visuals'
            : 'Video / reel generation — motion, transitions, product reveals, hooks, pacing';

    return `
You are an expert at creating creative, varied prompts for AI image and video generation.
Generate exactly 8 diverse prompt suggestions that users can pick from.
Each prompt should be 1-2 sentences, specific and evocative - like trending prompts on creative AI galleries.

Context: ${medium}
${style ? `\nCRITICAL CONSTRAINTS:\n- The outputs MUST follow this visual style / regional trend: ${style}\n` : ''}${tone ? `- The outputs MUST follow this content tone: ${tone}\n` : ''}
Requirements:
- Each prompt must be unique and cover different styles (cinematic, minimalist, bold, vintage, etc.)
- Mix use cases: product promo, portrait editing, background replacement, brand assets, social media
- Be concrete (e.g. "Replace the background with a bright outdoor brunch setup" not "Make it look nice")
- Return ONLY a valid JSON array of 8 strings. No markdown, no code blocks.
${JSON_OUTPUT_RULES}
Example format: ["Prompt one...", "Prompt two...", ...]
`;
}

export function buildStrategyAnchoredSuggestionsPrompt(
    type: 'image' | 'video',
    ctx: StrategyPostersContext,
    style?: string,
    tone?: string
): string {
    const block = formatStrategyContextBlock(ctx);
    const medium =
        type === 'image'
            ? 'still image / poster / edit (composition, lighting, typography, product placement)'
            : 'short video / reel (motion, pacing, hook, transitions, on-screen text)';

    return `
You are an expert social creative director. The user is creating ${type === 'image' ? 'an image or poster' : 'a video or reel'} for ONE scheduled post inside an existing marketing strategy — not a random idea.

You MUST anchor every suggestion to the strategy and post context below. Prompts should feel like direct production briefs for THIS brand, THIS platform, THIS content type, and THIS day — variations on the same post, not unrelated concepts.

${style ? `CRITICAL CONSTRAINTS:\n- The outputs MUST follow this visual style / regional trend: ${style}\n` : ''}${tone ? `- The outputs MUST follow this content tone: ${tone}\n` : ''}

STRATEGY + POST CONTEXT:
---
${block}
---

Output rules:
- Generate exactly 8 distinct prompt suggestions the user can paste into an AI generator.
- Each must be 1-2 sentences, concrete and production-ready.
- All 8 must stay faithful to: brand, business vertical, audience, strategy goal, and the post's idea/theme/caption.
- Reflect platform: ${ctx.post.platform} and format: ${ctx.post.contentType} (${medium}).
- Include different angles (e.g. alternative hook, CTA, visual metaphor, B-roll, text-overlay idea) but NEVER drift to a different campaign or unrelated product.
- Do not mention that you are following instructions; output JSON only.

Return ONLY a valid JSON array of 8 strings. No markdown, no code blocks.
${JSON_OUTPUT_RULES}
Example format: ["Prompt one...", "Prompt two...", ...]
`;
}

export function buildStrategyAnchoredRefinePrompt(
    type: 'image' | 'video',
    ctx: StrategyPostersContext,
    refine: { originalPrompt: string; feedback?: string }
): string {
    const block = formatStrategyContextBlock(ctx);
    return `
You are an expert at refining prompts for AI ${type === 'image' ? 'image' : 'video'} generation.

The user is editing content for this specific strategy post — keep prompts aligned with the context below.

STRATEGY + POST CONTEXT:
---
${block}
---

ORIGINAL PROMPT that was used:
"${refine.originalPrompt}"

USER FEEDBACK (what they didn't like / what to change):
"${refine.feedback || 'No specific feedback provided.'}"

Generate exactly 8 refined prompt suggestions that address the feedback while keeping the good parts of the original.
Each prompt should be 1-2 sentences, specific and evocative.
- Stay on-brand and on-strategy for THIS post (same platform, content type, idea)
- Incorporate the user's feedback and requested changes
- Fix what they didn't like
- Keep the overall intent where feedback doesn't contradict it
- Be concrete and actionable

Return ONLY a valid JSON array of 8 strings. No markdown, no code blocks.
${JSON_OUTPUT_RULES}
Example format: ["Refined prompt one...", "Refined prompt two...", ...]
`;
}

export function buildGenericRefinePrompt(
    type: 'image' | 'video',
    refine: { originalPrompt: string; feedback?: string }
): string {
    const medium = type === 'image' ? 'image / poster generation' : 'video / reel generation';
    return `
You are an expert at refining prompts for AI ${medium} based on user feedback.

ORIGINAL PROMPT that was used:
"${refine.originalPrompt}"

USER FEEDBACK (what they didn't like / what to change):
"${refine.feedback || 'No specific feedback provided.'}"

Generate exactly 8 refined prompt suggestions that address the feedback while keeping the good parts of the original.
Each prompt should be 1-2 sentences, specific and evocative.
- Incorporate the user's feedback and requested changes
- Fix what they didn't like
- Keep the overall intent where feedback doesn't contradict it
- Be concrete and actionable

Return ONLY a valid JSON array of 8 strings. No markdown, no code blocks.
${JSON_OUTPUT_RULES}
Example format: ["Refined prompt one...", "Refined prompt two...", ...]
`;
}

export function isStrategyPostersContext(x: unknown): x is StrategyPostersContext {
    if (!x || typeof x !== 'object') return false;
    const o = x as Record<string, unknown>;
    if (typeof o.strategyId !== 'string' || typeof o.strategyName !== 'string') return false;
    if (!o.post || typeof o.post !== 'object') return false;
    const p = o.post as Record<string, unknown>;
    return typeof p.id === 'string' && typeof p.platform === 'string' && typeof p.contentType === 'string';
}
