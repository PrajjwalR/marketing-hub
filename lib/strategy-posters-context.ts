/**
 * Snapshot passed from Strategy Planner → Create Content (posters) for contextual AI prompts.
 */

export type StrategyPostersContext = {
    strategyId: string;
    strategyName: string;
    businessType: string | null;
    brandName: string | null;
    targetAudience: string | null;
    strategyGoal: string | null;
    campaignTheme: string | null;
    platforms: string[];
    durationDays: number;
    startDate: string | null;
    post: {
        id: string;
        day: number;
        platform: string;
        contentType: string;
        theme: string | null;
        idea: string | null;
        caption: string | null;
        description: string | null;
        goal: string | null;
    };
    /** Human-readable scheduled date for this post (from strategy start + day), or null */
    scheduledDateLabel: string | null;
};

/** API / DB row shape for `strategies` (snake_case) */
export type StrategyRowForPostersContext = {
    id: string;
    name?: string;
    business_type?: string | null;
    brand_name?: string | null;
    target_audience?: string | null;
    goal?: string | null;
    theme?: string | null;
    platforms?: string[] | null;
    duration_days?: number | null;
    start_date?: string | null;
};

/** API / DB row shape for `strategy_posts` (snake_case) */
export type StrategyPostRowForPostersContext = {
    id: string;
    day?: number | null;
    platform?: string | null;
    content_type?: string | null;
    theme?: string | null;
    idea?: string | null;
    caption?: string | null;
    description?: string | null;
    goal?: string | null;
};

function addDaysIso(startDateStr: string, addDays: number): Date | null {
    const base = new Date(`${startDateStr}T12:00:00.000Z`);
    if (Number.isNaN(base.getTime())) return null;
    base.setUTCDate(base.getUTCDate() + addDays);
    return base;
}

export function scheduledDateLabelForStrategyPost(
    startDate: string | null | undefined,
    day: number
): string | null {
    if (!startDate || !day || day < 1) return null;
    const d = addDaysIso(startDate, day - 1);
    if (!d) return null;
    try {
        return new Intl.DateTimeFormat(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(d);
    } catch {
        return d.toISOString().slice(0, 10);
    }
}

export function buildStrategyPostersContext(
    strategy: StrategyRowForPostersContext,
    post: StrategyPostRowForPostersContext
): StrategyPostersContext {
    const day = Number(post.day) || 1;
    const start = strategy.start_date ?? null;
    return {
        strategyId: strategy.id,
        strategyName: strategy.name ?? 'Strategy',
        businessType: strategy.business_type ?? null,
        brandName: strategy.brand_name ?? null,
        targetAudience: strategy.target_audience ?? null,
        strategyGoal: strategy.goal ?? null,
        campaignTheme: strategy.theme ?? null,
        platforms: Array.isArray(strategy.platforms) ? strategy.platforms : [],
        durationDays: strategy.duration_days ?? 30,
        startDate: start,
        post: {
            id: post.id,
            day,
            platform: String(post.platform ?? 'instagram'),
            contentType: String(post.content_type ?? 'image'),
            theme: post.theme ?? null,
            idea: post.idea ?? null,
            caption: post.caption ?? null,
            description: post.description ?? null,
            goal: post.goal ?? null,
        },
        scheduledDateLabel: scheduledDateLabelForStrategyPost(start, day),
    };
}

/** Prefer video workbench for motion-native strategy types */
export function strategyPostPrefersVideoTab(contentType: string): boolean {
    const v = contentType.toLowerCase();
    return v === 'reel' || v === 'video';
}
