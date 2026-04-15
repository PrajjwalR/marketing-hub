'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { addDays, endOfDay, parse, startOfDay } from 'date-fns';
import { StrategyBoardSkeleton } from '@/components/strategy/strategy-board-skeleton';
import { StrategyPostDetailSidebar } from '@/components/strategy/strategy-post-detail-sidebar';
import type { StrategyPost } from '@/components/strategy/edit-strategy-post-modal';
import { INDIAN_HOLIDAYS_DATA } from '@/lib/indian-holidays';
import { SocialPlatformMixIcon, type SocialMixPlatform } from '@/components/social/social-platform-mix-icons';

type SocialBucket = SocialMixPlatform;

const SOCIAL_MIX_ORDER: { key: SocialBucket; label: string }[] = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'x', label: 'X' },
    { key: 'facebook', label: 'Facebook' },
];

function mapPlatformSegmentToSocialBucket(segment: string): SocialBucket | null {
    const s = segment.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!s) return null;
    if (s.includes('whatsapp')) return null;
    if (s === 'email' || s.startsWith('email/') || s.endsWith('/email') || s.includes('e-mail')) return null;
    if (s.includes('instagram') || s === 'ig') return 'instagram';
    if (s.includes('youtube')) return 'youtube';
    if (s.includes('linkedin')) return 'linkedin';
    if (s.includes('twitter') || s === 'x' || s.startsWith('x ') || s.endsWith(' x')) return 'x';
    if (s.includes('facebook') || s === 'fb') return 'facebook';
    return null;
}

function isIgnoredPlatformSegment(segment: string): boolean {
    const s = segment.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!s) return true;
    if (s.includes('whatsapp')) return true;
    if (s === 'email' || s.startsWith('email/') || s.endsWith('/email') || s.includes('e-mail')) return true;
    return false;
}

function formatExtraPlatformLabel(segment: string): string {
    return segment
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const CONTENT_GOAL_LABELS: Record<string, string> = {
    awareness: 'Brand awareness',
    brand_awareness: 'Brand awareness',
    increase_followers: 'Increase followers',
    follower_growth: 'Increase followers',
    engagement: 'Engagement',
    reach: 'Reach',
    traffic: 'Website traffic',
    leads: 'Lead generation',
    lead_generation: 'Lead generation',
    conversions: 'Conversions / sales',
    sales: 'Sales',
    launch: 'Product launch',
    education: 'Education / tips',
    community: 'Community building',
    retention: 'Retention',
};

function formatContentGoalLabel(raw: string): string {
    const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
    if (CONTENT_GOAL_LABELS[key]) return CONTENT_GOAL_LABELS[key];
    if (!key) return 'Unspecified goal';
    return key
        .split('_')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

type FixedHoliday = { name: string; date: string };

function getFixedDateHolidays(): FixedHoliday[] {
    const out: FixedHoliday[] = [];
    for (const h of INDIAN_HOLIDAYS_DATA.national_holidays) out.push({ name: h.name, date: h.date });
    for (const h of INDIAN_HOLIDAYS_DATA.observances) out.push({ name: h.name, date: h.date });
    for (const h of INDIAN_HOLIDAYS_DATA.pan_india_festivals) {
        if ('date' in h && typeof (h as { date?: string }).date === 'string') {
            out.push({ name: (h as { name: string }).name, date: (h as { date: string }).date });
        }
    }
    return out;
}

function holidaysInStrategyWindow(
    startDate: Date | null,
    durationDays: number
): { name: string; dayMonth: string; at: number }[] {
    if (!startDate || !Number.isFinite(durationDays) || durationDays < 1) return [];
    const start = startOfDay(startDate);
    const end = endOfDay(addDays(start, durationDays - 1));
    const startMs = start.getTime();
    const endMs = end.getTime();

    const years = new Set<number>();
    for (let y = start.getFullYear(); y <= end.getFullYear(); y += 1) years.add(y);

    const seen = new Set<string>();
    const hits: { name: string; dayMonth: string; at: number }[] = [];
    for (const { name, date } of getFixedDateHolidays()) {
        for (const year of years) {
            const parsed = parse(`${date} ${year}`, 'd MMMM yyyy', new Date());
            if (Number.isNaN(parsed.getTime())) continue;
            const t = startOfDay(parsed).getTime();
            if (t < startMs || t > endMs) continue;
            const dedupe = `${name}-${year}-${date}`;
            if (seen.has(dedupe)) continue;
            seen.add(dedupe);
            hits.push({ name, dayMonth: date, at: t });
        }
    }
    hits.sort((a, b) => a.at - b.at);
    return hits;
}

type DashboardPost = StrategyPost & {
    id: string;
    day: number;
    idea: string;
    platform?: string;
    goal?: string;
    content_type?: string;
    post_type?: string;
    format?: string;
    isCRM?: boolean;
};

type StrategyApiResponse = {
    name: string;
    duration_days: number;
    start_date?: string;
    posts?: DashboardPost[];
};

function inferTypeFromCopy(copy: string, goal?: string, fallbackIndex?: number): string {
    const text = copy.toLowerCase();
    const normalizedGoal = String(goal || '').toLowerCase();

    if (text.includes('hook') || text.startsWith('stop ') || text.includes('attention') || text.includes('did you know')) {
        return 'Hook';
    }
    if (text.includes('problem') || text.includes("isn't the problem") || text.includes('struggle') || text.includes('pain point')) {
        return 'Problem';
    }
    if (text.includes('why') || text.includes('because') || text.includes('real reason') || text.includes('deep')) {
        return 'Deepen';
    }
    if (text.includes('reframe') || text.includes('instead') || text.includes('think of it') || text.includes('new way')) {
        return 'Reframe';
    }
    if (text.includes('solution') || text.includes('step') || text.includes('framework') || text.includes('do this')) {
        return 'Solution';
    }
    if (text.includes('cta') || text.includes('comment') || text.includes('follow') || text.includes('save this') || text.includes('dm')) {
        return 'CTA';
    }

    if (normalizedGoal.includes('awareness')) return 'Hook';
    if (normalizedGoal.includes('engagement')) return 'Deepen';
    if (normalizedGoal.includes('conversion')) return 'Solution';

    const rotation = ['Hook', 'Problem', 'Deepen', 'Reframe', 'Solution', 'CTA'];
    return rotation[((fallbackIndex ?? 0) % rotation.length + rotation.length) % rotation.length];
}

function inferPatternFromPost(
    format?: string,
    platform?: string,
    goal?: string,
    type?: string,
): string {
    const f = String(format || '').toLowerCase();
    const p = String(platform || '').toLowerCase();
    const g = String(goal || '').toLowerCase();
    const t = String(type || '').toLowerCase();

    if (f.includes('carousel')) return 'Carousel';
    if (f.includes('story')) return 'Story';
    if (f.includes('reel') || f.includes('video')) return 'Video';
    if (f.includes('single') || f.includes('image')) return 'Image';

    if (p.includes('instagram')) return 'Instagram post';
    if (p.includes('linkedin')) return 'LinkedIn post';
    if (p.includes('youtube')) return 'YouTube short';
    if (p.includes('tiktok')) return 'TikTok video';

    if (t === 'hook') return 'Hook style';
    if (t === 'problem') return 'Problem style';
    if (t === 'deepen') return 'Explainer style';
    if (t === 'reframe') return 'Perspective style';
    if (t === 'solution') return 'How-to style';
    if (t === 'cta') return 'Action style';

    if (g.includes('awareness')) return 'Awareness';
    if (g.includes('engagement')) return 'Engagement';
    if (g.includes('conversion')) return 'Conversion';

    return 'Standard';
}

function toGrowthStyleTitle(rawTitle: string, day: number) {
    const title = String(rawTitle || '').trim();
    if (!title) return `Growth plan for Day ${day}`;

    const normalized = title.toLowerCase();
    if (
        normalized.includes('how to') ||
        normalized.includes('ways') ||
        normalized.includes('hacks') ||
        normalized.includes('mistakes') ||
        normalized.includes('strategy')
    ) {
        return title;
    }

    const shortTitle = title.length > 56 ? `${title.slice(0, 56).trim()}...` : title;
    const patterns = [
        `3 ways to ${shortTitle.toLowerCase()}`,
        `10 hacks to improve ${shortTitle.toLowerCase()}`,
        `How to grow using ${shortTitle.toLowerCase()}`,
        `${shortTitle}: mistakes to avoid`,
        `${shortTitle}: the practical growth strategy`,
    ];

    return patterns[(day - 1) % patterns.length];
}

export default function PrebuiltStrategyBoardPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [strategy, setStrategy] = useState<StrategyApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [sidebarPost, setSidebarPost] = useState<StrategyPost | null>(null);

    const fetchStrategy = useCallback(async () => {
        try {
            const res = await fetch(`/api/strategy/${id}`);
            if (!res.ok) {
                if (res.status === 404) router.replace('/dashboard/prebuilt-strategy-prompts');
                return;
            }
            const data: StrategyApiResponse = await res.json();
            setStrategy(data);
            setName(data.name);
        } catch (error) {
            console.error("Fetch strategy fail", error);
            setStrategy(null);
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchStrategy();
    }, [id, fetchStrategy]);

    const allIntegratedPosts = useMemo(() => {
        if (!strategy) return [];
        return (strategy.posts || [])
            .map((p): DashboardPost => ({
                ...p,
                isCRM: false,
                idea: toGrowthStyleTitle(p.idea, p.day),
            }))
            .sort((a, b) => a.day - b.day);
    }, [strategy]);

    const dashboardMeta = useMemo(() => {
        const posts = allIntegratedPosts;
        const normalized = posts.map((p) =>
            `${p?.content_type || ''} ${p?.post_type || ''} ${p?.format || ''} ${p?.idea || ''}`.toLowerCase(),
        );

        const carouselCount = normalized.filter((text: string) => text.includes('carousel')).length;
        const storyCount = normalized.filter((text: string) => text.includes('story')).length;
        const singleCount = Math.max(posts.length - carouselCount - storyCount, 0);
        const daysScheduled = new Set(posts.map((p) => p.day)).size;

        const socialMix: Record<SocialBucket, number> = {
            instagram: 0,
            youtube: 0,
            linkedin: 0,
            x: 0,
            facebook: 0,
        };
        const otherPlatformCounts: Record<string, number> = {};
        posts.forEach((post) => {
            const rawPlatform = String(post.platform || '').trim();
            const segments = rawPlatform
                ? rawPlatform.split(/,|\/|&|\+|\band\b/gi).map((p) => p.trim()).filter(Boolean)
                : [];
            const buckets = new Set<SocialBucket>();
            segments.forEach((seg) => {
                const b = mapPlatformSegmentToSocialBucket(seg);
                if (b) {
                    buckets.add(b);
                    return;
                }
                if (!isIgnoredPlatformSegment(seg)) {
                    const key = formatExtraPlatformLabel(seg);
                    if (key) otherPlatformCounts[key] = (otherPlatformCounts[key] || 0) + 1;
                }
            });
            if (buckets.size === 0 && rawPlatform) {
                const b = mapPlatformSegmentToSocialBucket(rawPlatform);
                if (b) {
                    buckets.add(b);
                } else if (!isIgnoredPlatformSegment(rawPlatform)) {
                    const key = formatExtraPlatformLabel(rawPlatform);
                    if (key) otherPlatformCounts[key] = (otherPlatformCounts[key] || 0) + 1;
                }
            }
            buckets.forEach((b) => {
                socialMix[b] += 1;
            });
        });
        const additionalPlatforms = (Object.entries(otherPlatformCounts) as [string, number][])
            .sort((a, b) => b[1] - a[1]);

        const goalCounts = posts.reduce((acc: Record<string, number>, post) => {
            const raw = String(post.goal ?? '').trim();
            const key = raw ? raw.toLowerCase() : 'unspecified';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const contentTopGoals = (Object.entries(goalCounts) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([slug, count]) => ({
                slug,
                count,
                label: formatContentGoalLabel(slug === 'unspecified' ? '' : slug),
            }));

        const strategyStart = strategy?.start_date ? new Date(strategy.start_date) : null;
        const duration = Number(strategy?.duration_days) > 0 ? Number(strategy?.duration_days) : 30;
        const holidaysInPeriod = holidaysInStrategyWindow(strategyStart, duration);

        return {
            carouselCount,
            singleCount,
            storyCount,
            imageCount: posts.length,
            daysScheduled,
            socialMix,
            additionalPlatforms,
            contentTopGoals,
            holidaysInPeriod,
        };
    }, [allIntegratedPosts, strategy]);

    const dayBuckets = useMemo(() => {
        const map = new Map<number, DashboardPost[]>();
        for (const post of allIntegratedPosts) {
            const day = Number(post.day) || 0;
            if (!map.has(day)) map.set(day, []);
            map.get(day)!.push(post);
        }
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    }, [allIntegratedPosts]);

    if (isLoading) return <StrategyBoardSkeleton />;
    if (!strategy) return <div className="p-10 text-center text-zinc-500 font-medium tracking-tight">Prebuilt Strategy not found.</div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 pb-20">
            <div className="px-6 pb-10 pt-6 lg:px-8">
                <div className="mx-auto max-w-[1320px]">
                    {/* <button
                        onClick={() => router.push('/dashboard/prebuilt-strategy-prompts')}
                        className="mb-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#E0B428] bg-[#F5C842] px-5 text-sm font-bold text-zinc-900 transition hover:-translate-y-0.5 hover:bg-[#E0B428]"
                    >
                        ← Back to prebuilt strategies
                    </button> */}

                    {/* Top dashboard hero */}
                    <section className="overflow-hidden rounded-3xl border border-black/10 bg-[#F5F0E8] shadow-sm">
                        <div className="flex flex-col justify-between gap-6 border-b border-black/10 px-6 py-7 lg:flex-row lg:items-start lg:px-10">
                            <div>
                                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-5xl">{name}</h1>
                                    <div
                                        className="flex w-fit items-center gap-2 rounded-xl border border-[#E0B428] bg-white px-3 py-2 shadow-sm sm:shrink-0"
                                        title="Strategy length"
                                    >
                                        <div className="leading-tight">
                                            <p className="text-sm font-extrabold tabular-nums text-zinc-900">
                                                {Number(strategy.duration_days) > 0
                                                    ? `${strategy.duration_days} day${Number(strategy.duration_days) === 1 ? '' : 's'}`
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 max-w-2xl text-base italic text-zinc-600 lg:text-lg">
                                    Think less. Do more. A ready-to-run content playbook built to turn planning into execution.
                                </p>
                            </div>
                            <div className="text-left lg:text-right">
                                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FB923C]">
                                    {Number(strategy?.duration_days) <= 7 ? 'Weekly' : 'Monthly'} content dashboard
                                </p>
                                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    {dashboardMeta.carouselCount} carousels · {dashboardMeta.singleCount} singles ·{' '}
                                    {dashboardMeta.storyCount} stories
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-px bg-black/10 md:grid-cols-5">
                            {[
                                { value: dashboardMeta.daysScheduled, label: 'Days scheduled' },
                                { value: dashboardMeta.imageCount, label: 'Total Postings' },
                                { value: dashboardMeta.carouselCount, label: 'Carousel slides' },
                                { value: dashboardMeta.singleCount, label: 'Single posts' },
                                { value: dashboardMeta.storyCount, label: 'Story frames' },
                                
                            ].map((item) => (
                                <div key={item.label} className="bg-white px-5 py-6">
                                    <p className="text-4xl font-black leading-none text-[#F97316]">{item.value}</p>
                                    <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Secondary details section */}
                    <section className="mt-6 grid gap-4 lg:grid-cols-3">
                        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Platform mix</p>
                            <div className="mt-3 space-y-2">
                                {SOCIAL_MIX_ORDER.map(({ key, label }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between gap-3 text-sm"
                                        title={label}
                                    >
                                        <span className="flex min-w-0 items-center gap-2.5">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-50 ring-1 ring-zinc-100">
                                                <SocialPlatformMixIcon platform={key} className="h-5 w-5" />
                                            </span>
                                            <span className="sr-only">{label}</span>
                                        </span>
                                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 tabular-nums">
                                            {dashboardMeta.socialMix[key]}
                                        </span>
                                    </div>
                                ))}
                                {dashboardMeta.additionalPlatforms.map(([platform, count]) => (
                                    <div key={platform} className="flex items-center justify-between gap-3 text-sm" title={platform}>
                                        <span className="font-medium text-zinc-700">{platform}</span>
                                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 tabular-nums">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Goals &amp; holidays</p>
                            <div className="mt-3 space-y-3">
                                {dashboardMeta.contentTopGoals.length ? (
                                    dashboardMeta.contentTopGoals.map((row) => (
                                        <div
                                            key={row.slug}
                                            className="flex items-start justify-between gap-3 text-sm"
                                            title={`${row.count} post${row.count === 1 ? '' : 's'} with this goal`}
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-zinc-800">{row.label}</p>
                                                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                                                    Posts in this plan
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-700">
                                                {row.count}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-zinc-500">No goals on content posts yet.</p>
                                )}

                                <div className="border-t border-zinc-100 pt-3">
                                    <div className="flex items-start justify-between gap-3 text-sm">
                                        <div className="min-w-0">
                                            <p className="font-medium text-zinc-800">Holidays in this period</p>
                                            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                                                Fixed-date holidays overlapping your plan dates
                                            </p>
                                            {dashboardMeta.holidaysInPeriod.length > 0 ? (
                                                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
                                                    {dashboardMeta.holidaysInPeriod
                                                        .map((h) => `${h.name} (${h.dayMonth})`)
                                                        .join(' · ')}
                                                </p>
                                            ) : null}
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                                                dashboardMeta.holidaysInPeriod.length
                                                    ? 'bg-sky-50 text-sky-800'
                                                    : 'bg-zinc-100 text-zinc-600'
                                            }`}
                                            title={
                                                dashboardMeta.holidaysInPeriod.length
                                                    ? dashboardMeta.holidaysInPeriod.map((h) => h.name).join(', ')
                                                    : undefined
                                            }
                                        >
                                            {dashboardMeta.holidaysInPeriod.length || '0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>

                        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Quick tips</p>
                            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-zinc-600">
                                <li>• <span className="font-medium text-zinc-700">One ask:</span> one clear action per post.</li>
                                <li>• <span className="font-medium text-zinc-700">Start fast:</span> tell the main point in the first seconds.</li>
                                <li>• <span className="font-medium text-zinc-700">Repeat winners:</span> reuse topics that already performed well.</li>
                            </ul>
                        </article>
                    </section>

                    {/* Day-wise representation */}
                    <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Day-wise representation</p>
                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">Content plan by day</h2>
                            </div>
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                                {dayBuckets.length} active days
                            </span>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-[#FDFCFB]">
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-[#F5F0E8] text-left">
                                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">Day</th>
                                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">Type</th>
                                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">Copy</th>
                                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">Pattern</th>
                                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">Image</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allIntegratedPosts.map((post, idx) => {
                                            const typeLabel = inferTypeFromCopy(post.idea, post.goal, idx);
                                            const patternLabel = inferPatternFromPost(
                                                post.format || post.content_type || post.post_type,
                                                post.platform,
                                                post.goal,
                                                typeLabel,
                                            );
                                            const imageHint = post.platform
                                                ? `${String(post.platform).replaceAll('_', ' ')} visual`
                                                : 'Auto-selected visual';
                                            return (
                                                <tr
                                                    key={post.id}
                                                    onClick={() => setSidebarPost(post)}
                                                    className="cursor-pointer border-b border-zinc-200/80 align-top transition hover:bg-[#F5C842]/10"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-700">
                                                            {post.day}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-base font-medium text-zinc-700">
                                                        {typeLabel}
                                                    </td>
                                                    <td className="max-w-[520px] px-4 py-3">
                                                        <p className="line-clamp-3 text-base font-semibold italic leading-relaxed tracking-tight text-zinc-800">
                                                            {post.idea}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-base text-zinc-700">
                                                        {patternLabel}
                                                    </td>
                                                    <td className="px-4 py-3 text-base text-zinc-600">
                                                        {imageHint}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <StrategyPostDetailSidebar
                post={sidebarPost}
                open={!!sidebarPost}
                onClose={() => setSidebarPost(null)}
                startDate={strategy.start_date}
                onEdit={() => {}}
                size="half"
            />
        </div>
    );
}
