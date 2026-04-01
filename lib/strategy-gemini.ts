import { model } from './gemini';

export interface StrategyPostInput {
  day: number;
  platform: string;
  content_type: string;
  theme: string;
  idea: string;
  caption: string;
  goal: string;
  status: string;
}

export interface GenerateStrategyInput {
  businessType: string;
  brandName: string;
  targetAudience: string;
  goal: string;
  /** High-level objective that tweaks the narrative of ideas/captions. */
  strategyType?: string;
  platforms: string[];
  theme?: string;
  durationDays: number;
}

type Vertical = "jewellery" | "gym" | "ecommerce" | "generic";

function normalizeVertical(raw: string): Vertical {
  const value = (raw || "").trim().toLowerCase();
  if (!value) return "generic";

  if (
    value.includes("jewel") ||
    value.includes("jewellery") ||
    value.includes("jewelry") ||
    value.includes("gold") ||
    value.includes("diamond")
  ) {
    return "jewellery";
  }

  if (
    value.includes("gym") ||
    value.includes("fitness") ||
    value.includes("workout") ||
    value.includes("studio") ||
    value.includes("coach")
  ) {
    return "gym";
  }

  if (
    value.includes("ecommerce") ||
    value.includes("e-commerce") ||
    value.includes("e commerse") ||
    value.includes("ecom") ||
    value.includes("d2c") ||
    value.includes("online store")
  ) {
    return "ecommerce";
  }

  return "generic";
}

function getVerticalSystemPrompt(vertical: Vertical): string {
  if (vertical === "jewellery") {
    return [
      "You are an expert jewellery marketing strategist.",
      "Create premium, trust-building content for high-consideration purchases.",
      "Focus on craftsmanship stories, materials, certifications, gifting moments, styling inspiration, and occasion-based demand.",
      "Balance aspiration with conversion using clear CTAs, social proof, and collection highlights.",
    ].join(" ");
  }

  if (vertical === "gym") {
    return [
      "You are an expert gym and fitness growth strategist.",
      "Create motivating, high-retention content that drives memberships, trials, and class bookings.",
      "Focus on transformations, trainer authority, habit-building, local community, challenges, and beginner-friendly onboarding.",
      "Use energetic hooks, action-driven CTAs, and formats that encourage saves/shares.",
    ].join(" ");
  }

  if (vertical === "ecommerce") {
    return [
      "You are an expert e-commerce and D2C performance content strategist.",
      "Create content that improves product discovery, trust, and conversion rates.",
      "Focus on product education, UGC/social proof, objections handling, seasonal campaigns, bundles, urgency, and retention loops.",
      "Blend brand storytelling with measurable conversion intent.",
    ].join(" ");
  }

  return "You are an expert social media marketing strategist.";
}

export function getStrategyGeneratePrompt(input: GenerateStrategyInput): string {
  const { businessType, brandName, targetAudience, goal,strategyType,  platforms, theme, durationDays } = input;
  const vertical = normalizeVertical(businessType);
  const expertPrompt = getVerticalSystemPrompt(vertical);
  const platformList = platforms.join(', ');
  // Keep a clean "theme focus" for the AI prompt, even if the DB tag is prefixed.
  const themeFocus =
    theme && typeof theme === 'string'
      ? theme.replace(/^prebuilt_[a-z]+_/, '')
      : undefined;
  const themeHint = themeFocus ? `Campaign theme/focus: ${themeFocus}. ` : '';
  const normalizedGoal = String(goal || 'brand_awareness').toLowerCase().replace(/\s/g, '_');

  const strategyTypeKey = strategyType ? String(strategyType).toLowerCase() : '';
  const strategyTypeGuidance =
    strategyTypeKey === 'social_growth'
      ? `Strategy focus: SOCIAL GROWTH.
For each post, optimize for shareability and follower conversion: strong hooks in the first line, clear value, and a soft CTA (follow/save/share + engage in comments).`
      : strategyTypeKey === 'marketing_plan'
        ? `Strategy focus: MARKETING PLAN.
For each post, reinforce your positioning and funnel progression (awareness -> consideration -> conversion): include a value proposition and a practical CTA (visit link, DM, or comment keyword).`
        : strategyTypeKey === 'knowledge_based'
          ? `Strategy focus: KNOWLEDGE-BASED CONTENT.
For each post, teach something actionable: include a key takeaway, use an educational format (tips, how-to, myth vs fact, step-by-step), and keep the caption structured for scanning.`
          : strategyTypeKey === 'customer_engagement'
            ? `Strategy focus: CUSTOMER ENGAGEMENT.
For each post, drive conversations: start with an opinion/question, ask for experiences or preferences, and encourage UGC (share your results or tag a friend).`
            : `Strategy focus: GENERAL.
Keep each post aligned with the overall goal and the provided brand/audience context.`;

  return `
${expertPrompt} Generate a ${durationDays}-day content strategy for the following:

Business Type: ${businessType}
Brand Name: ${brandName}
Target Audience: ${targetAudience}
Overall Goal: ${normalizedGoal}
Platforms: ${platformList}
${themeHint}
Detected Vertical: ${vertical}

Requirements:
- Create exactly ${durationDays} days of content. Distribute posts across the platforms. Not every day needs a post; vary the posting schedule naturally.
- Each post must have: day (1-${durationDays}), platform, content_type, theme, idea, caption, goal, status
- content_type must be one of: reel, carousel, image, video, text_post
- platform must be one of: ${platforms.map(p => p.toLowerCase()).join(', ')}
- goal must be one of: increase_followers, increase_sales, brand_awareness, engagement
  - For every post, set goal to exactly "${normalizedGoal}".
- status must be: planned
- theme examples: festival, educational, promotion, behind_the_scenes, product_launch, seasonal, etc.
- idea: short catchy title for the post concept (e.g. "Holi outfit styling tips")
- caption: 1-2 sentence caption suggestion (use the strategy focus to choose tone and CTA)

${strategyTypeGuidance}

Vertical-specific guidance:
- If vertical is jewellery: include luxury positioning, trust cues, craftsmanship, and gifting/occasion hooks.
- If vertical is gym: include motivation, program outcomes, trainer expertise, community challenges, and local conversion hooks.
- If vertical is ecommerce: include product utility, social proof, offer framing, urgency/seasonality, and clear shopping intent.
- Ensure content still matches brand goal and target audience.

Return ONLY a valid JSON object. No markdown, no code blocks, no extra text.
{
  "posts": [
    {
      "day": 1,
      "platform": "instagram",
      "content_type": "reel",
      "theme": "festival",
      "idea": "Example idea title",
      "caption": "Short caption suggestion",
      "goal": "${normalizedGoal}",
      "status": "planned"
    }
  ]
}
`;
}

export async function generateStrategyPosts(input: GenerateStrategyInput): Promise<StrategyPostInput[]> {
  const prompt = getStrategyGeneratePrompt(input);
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  if (!text) throw new Error('No response from AI');

  // Strip markdown code blocks if present
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(clean);
  const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
  if (!posts.length) throw new Error('No posts generated');

  return posts.map((p: Record<string, unknown>) => ({
    day: Number(p.day) || 1,
    platform: String(p.platform || 'instagram').toLowerCase(),
    content_type: String(p.content_type || 'image').toLowerCase().replace(/\s/g, '_'),
    theme: String(p.theme || 'general'),
    idea: String(p.idea || ''),
    caption: String(p.caption || ''),
    goal: String(p.goal || 'engagement').toLowerCase().replace(/\s/g, '_'),
    status: 'planned',
  }));
}
