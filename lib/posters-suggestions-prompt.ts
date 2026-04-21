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

const PREMIUM_CREATIVE_GUARDRAILS = `
Premium quality rules (critical):
- Avoid generic fluff (e.g., "engaging", "amazing", "high-quality") unless backed by concrete details.
- Every suggestion must include all 4 elements: hook angle, visual direction, proof element, CTA direction.
- Keep outputs brand-safe, specific, and production-ready.
- Avoid repetitive openings and repeated creative angles across the 8 suggestions.
`;

const IMAGE_NO_TEXT_RULE = `
Image-only constraint (critical):
- For image/poster prompts, the generated image must contain NO text, NO letters, NO words, NO logos, NO watermark, and NO signatures.
- CTA direction should be represented via composition/mood/subject action, not in-image typography.
`;

function getPlatformNativeGuidance(platformRaw?: string): string {
    const platform = (platformRaw || '').trim().toLowerCase();

    if (platform.includes('instagram')) {
        return `Platform-native guidance (${platformRaw}):
- Prioritize thumb-stopping first-line hooks and visually clear composition for mobile.
- Use short, scannable copy and "save/share/comment" CTA patterns.
- For reels/video, structure around quick hook -> value reveal -> payoff/CTA.
- Favor relatable proof cues (UGC vibe, before/after, mini result snapshots).`;
    }

    if (platform.includes('linkedin')) {
        return `Platform-native guidance (${platformRaw}):
- Start with a POV or insight-led hook that can spark professional discussion.
- Keep authority and trust high: include process, rationale, or measurable proof.
- Use comment-driven or DM-style CTAs rather than purely promotional language.
- Keep tone credible, practical, and low-hype.`;
    }

    if (platform.includes('youtube')) {
        return `Platform-native guidance (${platformRaw}):
- Use curiosity-driven hooks and clear narrative progression for retention.
- For shorts/video, include a strong opening beat and a payoff before the end.
- Favor tutorial, myth-bust, or transformation structures with explicit value.
- Use CTAs suited to watch behavior (subscribe, comment keyword, watch next).`;
    }

    if (platform.includes('tiktok')) {
        return `Platform-native guidance (${platformRaw}):
- Open with a punchy hook and immediate visual action.
- Keep pacing fast and conversational with native-style framing.
- Use trend-aware but brand-safe angles (challenge, reaction, POV, quick demo).
- Use interaction CTAs (comment prompt, share, follow).`;
    }

    if (platform.includes('facebook')) {
        return `Platform-native guidance (${platformRaw}):
- Favor clarity and relatability with community-friendly framing.
- Include practical value and trust cues quickly (proof, testimonials, outcomes).
- Use explicit CTAs (comment, message, learn more) with clear user intent.
- Keep creative understandable without relying on trend context.`;
    }

    if (platform === 'x' || platform.includes('twitter')) {
        return `Platform-native guidance (${platformRaw}):
- Lead with a bold, concise take or contrarian hook.
- Keep copy tight, punchy, and discussion-oriented.
- Use clear perspective + proof + quick CTA to drive replies/reposts.
- Avoid bloated copy; optimize for skim speed.`;
    }

    return `Platform-native guidance:
- Tailor hook style, pacing, and CTA to how users consume content on this platform.
- Keep format-native structure and avoid one-size-fits-all creative.`;
}

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
You are a senior growth creative strategist creating premium prompts for AI image and video generation.
Generate exactly 8 high-performing prompt suggestions users can directly run.
Each prompt should be 1-2 sentences, concrete and execution-ready.

Context: ${medium}
${style ? `\nCRITICAL CONSTRAINTS:\n- The outputs MUST follow this visual style / regional trend: ${style}\n` : ''}${tone ? `- The outputs MUST follow this content tone: ${tone}\n` : ''}
Requirements:
- Include varied creative angles (e.g., authority, social proof, objection handling, product reveal, emotional transformation).
- Mix use cases: product promo, portrait editing, background replacement, brand assets, social media.
- Include platform-native intent where relevant (hook style, pacing, CTA behavior).
- Be concrete (e.g. "Replace the background with a bright outdoor brunch setup" not "Make it look nice").
- No two prompts should start similarly.
- Self-evaluate each draft on: specificity, originality, conversion potential, and clarity.
- Rewrite weak drafts before finalizing.
${type === 'image' ? IMAGE_NO_TEXT_RULE : ''}

${PREMIUM_CREATIVE_GUARDRAILS}
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
    const platformGuidance = getPlatformNativeGuidance(ctx.post.platform);
    const medium =
        type === 'image'
            ? 'still image / poster / edit (composition, lighting, typography, product placement)'
            : 'short video / reel (motion, pacing, hook, transitions, on-screen text)';

    return `
You are a senior social creative director and conversion strategist. The user is creating ${type === 'image' ? 'an image or poster' : 'a video or reel'} for ONE scheduled post inside an existing marketing strategy — not a random idea.

You MUST anchor every suggestion to the strategy and post context below. Prompts should feel like direct production briefs for THIS brand, THIS platform, THIS content type, and THIS day — variations on the same post, not unrelated concepts.

${style ? `CRITICAL CONSTRAINTS:\n- The outputs MUST follow this visual style / regional trend: ${style}\n` : ''}${tone ? `- The outputs MUST follow this content tone: ${tone}\n` : ''}
${type === 'image' ? IMAGE_NO_TEXT_RULE : ''}

STRATEGY + POST CONTEXT:
---
${block}
---

Output rules:
- Generate exactly 8 distinct prompt suggestions the user can paste into an AI generator.
- Each must be 1-2 sentences, concrete and production-ready.
- All 8 must stay faithful to: brand, business vertical, audience, strategy goal, and the post's idea/theme/caption.
- Reflect platform: ${ctx.post.platform} and format: ${ctx.post.contentType} (${medium}).
- ${platformGuidance}
- Include different angles (e.g. alternative hook, CTA, visual metaphor, B-roll idea) but NEVER drift to a different campaign or unrelated product.
- Every suggestion must include: hook angle + visual direction + proof cue + CTA direction.
- Keep funnel alignment implied in copy (awareness/consideration/conversion), matching the post goal.
- Prioritize concrete assets (testimonial, result metric, process snapshot, before/after, founder POV) over vague claims.
- Enforce premium aesthetics (clean composition, intentional lighting, no cluttered scenes).
- Self-score each draft suggestion from 1-10 on: brand fit, platform fit, specificity, conversion potential, originality.
- Rewrite any draft that scores below 8 on any criterion before producing final output.
- Do not mention that you are following instructions; output JSON only.

${PREMIUM_CREATIVE_GUARDRAILS}
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
    const platformGuidance = getPlatformNativeGuidance(ctx.post.platform);
    return `
You are a senior prompt optimizer for AI ${type === 'image' ? 'image' : 'video'} generation.

The user is editing content for this specific strategy post — keep prompts aligned with the context below.

STRATEGY + POST CONTEXT:
---
${block}
---

ORIGINAL PROMPT that was used:
"${refine.originalPrompt}"

USER FEEDBACK (what they didn't like / what to change):
"${refine.feedback || 'No specific feedback provided.'}"

${type === 'image' ? IMAGE_NO_TEXT_RULE : ''}

Generate exactly 8 refined prompt suggestions that address the feedback while keeping the good parts of the original.
Each prompt should be 1-2 sentences, specific and evocative.
- Stay on-brand and on-strategy for THIS post (same platform, content type, idea)
- ${platformGuidance}
- Incorporate the user's feedback and requested changes
- Fix what they didn't like
- Keep the overall intent where feedback doesn't contradict it
- Be concrete and actionable
- Preserve what already worked in the original (strong hook, visual clarity, CTA), unless feedback contradicts it
- Every refined prompt must include: hook angle + visual direction + proof cue + CTA direction
- Self-score each refined prompt from 1-10 on: alignment with feedback, brand fit, specificity, conversion potential
- Rewrite any draft below 8 before finalizing

${PREMIUM_CREATIVE_GUARDRAILS}
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
You are a senior prompt optimizer for AI ${medium} based on user feedback.

ORIGINAL PROMPT that was used:
"${refine.originalPrompt}"

USER FEEDBACK (what they didn't like / what to change):
"${refine.feedback || 'No specific feedback provided.'}"

${type === 'image' ? IMAGE_NO_TEXT_RULE : ''}

Generate exactly 8 refined prompt suggestions that address the feedback while keeping the good parts of the original.
Each prompt should be 1-2 sentences, specific and evocative.
- Incorporate the user's feedback and requested changes
- Fix what they didn't like
- Keep the overall intent where feedback doesn't contradict it
- Be concrete and actionable
- Every refined prompt must include: hook angle + visual direction + proof cue + CTA direction
- Self-score each refined prompt from 1-10 on: feedback alignment, specificity, originality, conversion potential
- Rewrite any draft below 8 before finalizing

${PREMIUM_CREATIVE_GUARDRAILS}
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
