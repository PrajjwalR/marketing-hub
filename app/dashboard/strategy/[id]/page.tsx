'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StrategyTableView } from '@/components/strategy/strategy-table-view';
import { StrategyBoardSkeleton } from '@/components/strategy/strategy-board-skeleton';
import { StrategyPostDetailSidebar } from '@/components/strategy/strategy-post-detail-sidebar';
import { EditStrategyPostModal } from '@/components/strategy/edit-strategy-post-modal';
import { StrategyPostContentModal } from '@/components/strategy/strategy-post-content-modal';
import type { StrategyPost } from '@/components/strategy/edit-strategy-post-modal';
import { addDays, endOfDay, parse, startOfDay } from 'date-fns';
import { INDIAN_HOLIDAYS_DATA } from '@/lib/indian-holidays';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
    buildStrategyPostScheduledAt,
    normalizeCalendarPlatform,
    strategyPostHasMedia,
} from '@/lib/strategy-schedule';
import { SocialPlatformMixIcon } from '@/components/social/social-platform-mix-icons';

type SocialBucket = 'instagram' | 'youtube' | 'linkedin' | 'x';

const SOCIAL_MIX_ORDER: { key: SocialBucket; label: string }[] = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'x', label: 'X' },
];

/** Map one platform token to Instagram / YouTube / LinkedIn / X, or skip CRM / system rows. */
function mapPlatformSegmentToSocialBucket(segment: string): SocialBucket | null {
    const s = segment.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!s) return null;
    if (s.includes('crm') || s.includes('system global') || s.includes('sync channels')) return null;
    if (s.includes('whatsapp')) return null;
    if (s === 'email' || s.startsWith('email/') || s.endsWith('/email') || s.includes('e-mail')) return null;
    if (s.includes('instagram') || s === 'ig') return 'instagram';
    if (s.includes('youtube')) return 'youtube';
    if (s.includes('linkedin')) return 'linkedin';
    if (s.includes('twitter') || s === 'x' || s.startsWith('x ') || s.endsWith(' x')) return 'x';
    return null;
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
    for (const h of INDIAN_HOLIDAYS_DATA.national_holidays) {
        out.push({ name: h.name, date: h.date });
    }
    for (const h of INDIAN_HOLIDAYS_DATA.observances) {
        out.push({ name: h.name, date: h.date });
    }
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

export default function StrategyBoardPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { getIdToken } = useAuth();

    const [strategy, setStrategy] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarPost, setSidebarPost] = useState<StrategyPost | null>(null);
    const [editingPost, setEditingPost] = useState<StrategyPost | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [schedulingBulk, setSchedulingBulk] = useState(false);
    const [contentModalOpen, setContentModalOpen] = useState(false);
    const [contentModalPost, setContentModalPost] = useState<StrategyPost | null>(null);

    const fromPrebuilt = searchParams.get('source') === 'prebuilt';
    const fallbackRoute = fromPrebuilt ? '/dashboard/prebuilt-strategy-prompts' : '/dashboard/strategy';

    const fetchStrategy = useCallback(async () => {
        try {
            const res = await fetch(`/api/strategy/${id}`);
            if (!res.ok) {
                if (res.status === 404) router.replace(fallbackRoute);
                return;
            }
            const data = await res.json();
            setStrategy(data);
        } catch (error) {
            console.error("Fetch strategy fail", error);
            setStrategy(null);
        } finally {
            setIsLoading(false);
        }
    }, [id, router, fallbackRoute]);

    useEffect(() => {
        if (id) fetchStrategy();
    }, [id, fetchStrategy]);

    const allIntegratedPosts = useMemo(() => {
        if (!strategy) return [];
        const regularPosts = (strategy.posts || []).map((p: any) => ({
            ...p,
            isCRM: false,
            include_in_calendar: p.include_in_calendar !== false,
        }));
        return regularPosts.sort(
            (a: { day: number }, b: { day: number }) => a.day - b.day
        );
    }, [strategy]);

    const dashboardMeta = useMemo(() => {
        const posts = allIntegratedPosts;
        const normalized = posts.map((p: any) =>
            `${p?.content_type || ''} ${p?.post_type || ''} ${p?.format || ''} ${p?.idea || ''}`.toLowerCase(),
        );

        const carouselCount = normalized.filter((text: string) => text.includes('carousel')).length;
        const storyCount = normalized.filter((text: string) => text.includes('story')).length;
        const singleCount = Math.max(posts.length - carouselCount - storyCount, 0);
        const daysScheduled = new Set(posts.map((p: any) => p.day)).size;
        const socialMix: Record<SocialBucket, number> = {
            instagram: 0,
            youtube: 0,
            linkedin: 0,
            x: 0,
        };

        posts.forEach((post: any) => {
            if (post.isCRM) return;
            const rawPlatform = String(post.platform || '').trim();
            const segments = rawPlatform
                ? rawPlatform.split(/,|\/|&|\+|\band\b/gi).map((p) => p.trim()).filter(Boolean)
                : [];
            const buckets = new Set<SocialBucket>();
            segments.forEach((seg) => {
                const b = mapPlatformSegmentToSocialBucket(seg);
                if (b) buckets.add(b);
            });
            if (buckets.size === 0 && rawPlatform) {
                const b = mapPlatformSegmentToSocialBucket(rawPlatform);
                if (b) buckets.add(b);
            }
            buckets.forEach((b) => {
                socialMix[b] += 1;
            });
        });

        const contentPosts = posts.filter((p: any) => !p.isCRM);
        const goalCounts = contentPosts.reduce((acc: Record<string, number>, post: any) => {
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

        const strategyStart = strategy?.start_date ? new Date(strategy.start_date as string) : null;
        const duration = Number(strategy?.duration_days) > 0 ? Number(strategy.duration_days) : 30;
        const holidaysInPeriod = holidaysInStrategyWindow(strategyStart, duration);

        return {
            carouselCount,
            singleCount,
            storyCount,
            imageCount: posts.length,
            daysScheduled,
            socialMix,
            contentTopGoals,
            holidaysInPeriod,
        };
    }, [allIntegratedPosts, strategy]);

    const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
        const token = await getIdToken();
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
    }, [getIdToken]);

    const handleIncludeChange = useCallback(
        async (post: StrategyPost, checked: boolean) => {
            if ((post as StrategyPost & { isCRM?: boolean }).isCRM) return;
            setStrategy((s: any) => {
                if (!s?.posts) return s;
                return {
                    ...s,
                    posts: s.posts.map((p: StrategyPost) =>
                        p.id === post.id ? { ...p, include_in_calendar: checked } : p
                    ),
                };
            });
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    ...(await authHeaders()),
                };
                const res = await fetch(`/api/strategy/${id}/posts/${post.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ include_in_calendar: checked }),
                });
                if (!res.ok) throw new Error('patch failed');
                const updated = await res.json();
                setStrategy((s: any) => {
                    if (!s?.posts) return s;
                    return {
                        ...s,
                        posts: s.posts.map((p: StrategyPost) =>
                            p.id === post.id ? { ...p, ...updated } : p
                        ),
                    };
                });
            } catch {
                toast.error('Could not update calendar selection');
                fetchStrategy();
            }
        },
        [authHeaders, fetchStrategy, id]
    );

    const schedulePostsToCalendar = useCallback(
        async (posts: StrategyPost[]) => {
            if (posts.length === 0) {
                toast.message('Select at least one row (checkbox)');
                return;
            }
            setSchedulingBulk(true);
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    ...(await authHeaders()),
                };
                let ok = 0;
                let fail = 0;
                for (const post of posts) {
                    try {
                        const scheduledAt = buildStrategyPostScheduledAt(
                            strategy?.start_date,
                            post.day,
                            post.post_time
                        );
                        const platform = normalizeCalendarPlatform(post.platform);
                        const hasMedia = strategyPostHasMedia(post);
                        const descParts = [post.caption, post.description].filter(Boolean) as string[];
                        const description = [
                            ...descParts,
                            hasMedia
                                ? ''
                                : 'Note: No media attached yet. Add content before this post can go live.',
                        ]
                            .filter(Boolean)
                            .join('\n\n');

                        const res = await fetch('/api/schedule', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                title: (post.idea || '').trim() || `Strategy · Day ${post.day}`,
                                description: description || null,
                                media_url: post.media_url || null,
                                type: 'post',
                                platform,
                                platforms: [platform],
                                scheduled_at: scheduledAt,
                                status: 'scheduled',
                            }),
                        });
                        if (!res.ok) {
                            fail++;
                            continue;
                        }
                        const patchRes = await fetch(`/api/strategy/${id}/posts/${post.id}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({ status: 'scheduled' }),
                        });
                        if (!patchRes.ok) {
                            fail++;
                            continue;
                        }
                        ok++;
                    } catch {
                        fail++;
                    }
                }
                if (ok > 0) toast.success(`Added ${ok} slot(s) to the posting calendar`);
                if (fail > 0) toast.error(`${fail} could not be scheduled`);
                await fetchStrategy();
                if (ok > 0) router.push('/dashboard/calendar');
            } finally {
                setSchedulingBulk(false);
            }
        },
        [authHeaders, fetchStrategy, id, strategy?.start_date, router]
    );

    const handleBulkSchedule = useCallback(() => {
        const selected = allIntegratedPosts.filter(
            (p: StrategyPost & { isCRM?: boolean }) =>
                !p.isCRM && p.include_in_calendar !== false
        );
        if (selected.length === 0) {
            toast.message('Select at least one strategy row using the checkbox');
            return;
        }
        void schedulePostsToCalendar(selected);
    }, [allIntegratedPosts, schedulePostsToCalendar]);

    const calendarCheckboxSelectedCount = useMemo(
        () =>
            allIntegratedPosts.filter(
                (p: StrategyPost & { isCRM?: boolean }) =>
                    !p.isCRM && p.include_in_calendar !== false
            ).length,
        [allIntegratedPosts]
    );

    const handleSingleSchedule = useCallback(
        (post: StrategyPost) => {
            void schedulePostsToCalendar([post]);
        },
        [schedulePostsToCalendar]
    );

    const openContentForPost = useCallback((post: StrategyPost) => {
        setContentModalPost(post);
        setContentModalOpen(true);
    }, []);

    if (isLoading) return <StrategyBoardSkeleton />;
    if (!strategy) return <div className="p-10 text-center">Strategy not found.</div>;

    return (
        <div className="min-h-screen bg-white text-zinc-900 pb-10 pt-2">
            <div className="mt-8 px-8">
                <section className="overflow-hidden rounded-3xl border border-black/10 bg-[#F5F0E8] shadow-sm">
                    <div className="flex flex-col justify-between gap-6 border-b border-black/10 px-6 py-7 lg:flex-row lg:items-start lg:px-10">
                        <div>
                            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-5xl">
                                    {strategy.name}
                                </h1>
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
                                Plan and execute faster. Your social content strategy in one dashboard.
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
                            { value: dashboardMeta.singleCount, label: 'Single posts' },
                            { value: dashboardMeta.carouselCount, label: 'Carousel slides' },
                            { value: dashboardMeta.storyCount, label: 'Story frames' },
                            { value: dashboardMeta.imageCount, label: 'Total items' },
                            
                        ].map((item) => (
                            <div key={item.label} className="bg-white px-5 py-6">
                                <p className="text-4xl font-black leading-none text-[#F97316]">{item.value}</p>
                                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

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
                        </div>
                    </article>

                    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                            Goals &amp; holidays
                        </p>
                       
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

                <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm mt-6">
                    {!fromPrebuilt && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3">
                            <p className="text-xs text-zinc-600 max-w-xl">
                                Check rows to include, then add them to the posting calendar at each row&apos;s date.
                                Slots without media still appear on the calendar; publishing won&apos;t run
                                until content is attached.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                                <span
                                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold tabular-nums text-zinc-700"
                                    title="Posts checked in the table (include in calendar)"
                                >
                                    {calendarCheckboxSelectedCount} selected
                                </span>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-full gap-2 bg-[#f69651] text-white hover:bg-zinc-800 shrink-0"
                                    disabled={schedulingBulk}
                                    onClick={handleBulkSchedule}
                                >
                                    {schedulingBulk ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CalendarClock className="h-4 w-4" />
                                    )}
                                    Schedule to calendar
                                </Button>
                            </div>
                        </div>
                    )}
                    <StrategyTableView
                        posts={allIntegratedPosts}
                        startDate={strategy.start_date}
                        readonly={fromPrebuilt}
                        onRowClick={(post) => !post.isCRM && setSidebarPost(post)}
                        onEdit={(post) => { setEditingPost(post); setEditModalOpen(true); }}
                        onClone={() => {}}
                        onPostToPlatforms={() => {}}
                        onScheduleToCalendar={fromPrebuilt ? undefined : handleSingleSchedule}
                        onContent={fromPrebuilt ? () => {} : openContentForPost}
                        onDelete={() => {}}
                        onIncludeChange={fromPrebuilt ? () => {} : handleIncludeChange}
                    />
                </div>
            </div>

            <StrategyPostDetailSidebar
                post={sidebarPost}
                open={!!sidebarPost}
                onClose={() => setSidebarPost(null)}
                startDate={strategy.start_date}
                onEdit={() => {
                    if (!sidebarPost) return;
                    setSidebarPost(null);
                    setEditingPost(sidebarPost);
                    setEditModalOpen(true);
                }}
                onContent={fromPrebuilt ? undefined : openContentForPost}
                onScheduleToCalendar={fromPrebuilt ? undefined : handleSingleSchedule}
                size="half"
            />

            <StrategyPostContentModal
                post={contentModalPost}
                open={contentModalOpen}
                onClose={() => {
                    setContentModalOpen(false);
                    setContentModalPost(null);
                }}
                strategyId={id}
                onSuccess={fetchStrategy}
            />
            
            <EditStrategyPostModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                post={editingPost}
                strategyId={id}
                durationDays={strategy.duration_days}
                startDate={strategy.start_date}
                onSave={fetchStrategy}
            />
        </div>
    );
}
