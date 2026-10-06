'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Image as ImageIcon, Film, Loader2, Link2, PenSquare, X } from 'lucide-react';
import { PageHero } from '@/components/dashboard/page-hero';
import { PostersWorkbench } from '@/components/posters/posters-workbench';
import { cn } from '@/lib/utils';
import {
    buildStrategyPostersContext,
    type StrategyPostRowForPostersContext,
    type StrategyPostersContext,
    type StrategyRowForPostersContext,
} from '@/lib/strategy-posters-context';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type TabType = 'image' | 'video';

type StrategyListItem = {
    id: string;
    name?: string;
    posts_count?: number;
};

function formatPostLabel(p: StrategyPostRowForPostersContext): string {
    const idea = (p.idea || '').trim();
    const short = idea.length > 42 ? `${idea.slice(0, 42)}…` : idea;
    const tail = short ? ` — ${short}` : '';
    const day = Number(p.day) || 1;
    const plat = String(p.platform ?? '—');
    const ct = String(p.content_type ?? 'post').replace(/_/g, ' ');
    return `Day ${day} · ${plat} · ${ct}${tail}`;
}

async function authHeaders(): Promise<Record<string, string>> {
    const auth = getAuth(app);
    const token = await auth.currentUser?.getIdToken(true);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

function PostersPageInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const strategyId = searchParams.get('strategyId');
    const postId = searchParams.get('postId');

    const [activeTab, setActiveTab] = useState<TabType>('image');
    const [strategyContext, setStrategyContext] = useState<StrategyPostersContext | null>(null);
    const [contextLoading, setContextLoading] = useState(false);
    const [contextError, setContextError] = useState<string | null>(null);

    const [strategies, setStrategies] = useState<StrategyListItem[]>([]);
    const [strategiesLoading, setStrategiesLoading] = useState(true);
    const [postsForPicker, setPostsForPicker] = useState<StrategyPostRowForPostersContext[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);

    const applyContextFromApi = useCallback(
        (data: StrategyRowForPostersContext & { posts?: unknown }, post: StrategyPostRowForPostersContext) => {
        const { id, name, business_type, brand_name, target_audience, goal, theme, platforms, duration_days, start_date } =
            data;
        setStrategyContext(
            buildStrategyPostersContext(
                {
                    id: String(id),
                    name,
                    business_type,
                    brand_name,
                    target_audience,
                    goal,
                    theme,
                    platforms,
                    duration_days,
                    start_date,
                },
                post
            )
        );
        /* Keep Image as default; user switches to Video manually if needed */
    }, []);

    /* Full strategy + post → AI context */
    useEffect(() => {
        if (!strategyId || !postId) {
            setStrategyContext(null);
            setContextError(null);
            setContextLoading(false);
            return;
        }

        let cancelled = false;
        setContextLoading(true);
        setContextError(null);

        authHeaders()
            .then((headers) => fetch(`/api/strategy/${encodeURIComponent(strategyId)}`, { headers }))
            .then((res) => {
                if (!res.ok) throw new Error('Could not load strategy');
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                const posts = Array.isArray(data.posts) ? data.posts : [];
                setPostsForPicker(posts as StrategyPostRowForPostersContext[]);
                const post = posts.find((p: { id: string }) => p.id === postId) as
                    | StrategyPostRowForPostersContext
                    | undefined;
                if (!post) {
                    setContextError('Strategy post not found.');
                    setStrategyContext(null);
                    return;
                }
                applyContextFromApi(data as StrategyRowForPostersContext & { posts?: unknown }, post);
            })
            .catch(() => {
                if (!cancelled) {
                    setContextError('Failed to load strategy context.');
                    setStrategyContext(null);
                }
            })
            .finally(() => {
                if (!cancelled) setContextLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [strategyId, postId, applyContextFromApi]);

    /* Strategy list for picker */
    useEffect(() => {
        let cancelled = false;
        setStrategiesLoading(true);
        authHeaders()
            .then((headers) => fetch('/api/strategy', { headers }))
            .then((res) => {
                if (!res.ok) throw new Error('list');
                return res.json();
            })
            .then((data) => {
                if (cancelled || !Array.isArray(data)) return;
                setStrategies(
                    data.map((s: { id: string; name?: string; posts_count?: number }) => ({
                        id: s.id,
                        name: s.name,
                        posts_count: s.posts_count,
                    }))
                );
            })
            .catch(() => {
                if (!cancelled) setStrategies([]);
            })
            .finally(() => {
                if (!cancelled) setStrategiesLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    /* Posts for selected strategy when no post yet (URL) — second picker */
    useEffect(() => {
        if (!strategyId) {
            setPostsForPicker([]);
            return;
        }
        if (postId) {
            return;
        }
        let cancelled = false;
        setPostsLoading(true);
        authHeaders()
            .then((headers) => fetch(`/api/strategy/${encodeURIComponent(strategyId)}`, { headers }))
            .then((res) => {
                if (!res.ok) throw new Error('strategy');
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                const posts = Array.isArray(data.posts) ? data.posts : [];
                setPostsForPicker(posts as StrategyPostRowForPostersContext[]);
            })
            .catch(() => {
                if (!cancelled) setPostsForPicker([]);
            })
            .finally(() => {
                if (!cancelled) setPostsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [strategyId]);

    const setLinkedPair = useCallback(
        (sid: string | null, pid: string | null) => {
            if (sid && pid) {
                router.replace(
                    `${pathname}?strategyId=${encodeURIComponent(sid)}&postId=${encodeURIComponent(pid)}`,
                    { scroll: false }
                );
            } else if (sid) {
                router.replace(`${pathname}?strategyId=${encodeURIComponent(sid)}`, { scroll: false });
            } else {
                router.replace(pathname, { scroll: false });
            }
        },
        [router, pathname]
    );

    const handleStrategyChange = (value: string) => {
        if (!value || value === '__none__') {
            setLinkedPair(null, null);
            return;
        }
        setLinkedPair(value, null);
    };

    const handlePostChange = (value: string) => {
        if (!strategyId || !value || value === '__none__') return;
        setLinkedPair(strategyId, value);
    };

    const clearLink = () => {
        setLinkedPair(null, null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <PageHero
                titleId="posters-header"
                title="Create Content"
                breadcrumb={['Content Creation', 'Create Content']}
                icon={PenSquare}
                description="Describe what you want to generate. We'll turn it into a powerful prompt and produce the final content."
                actions={
                    <div id="posters-tabs" className="flex rounded-full bg-white/10 p-1 ring-1 ring-white/15">
                        {([
                            ['image', ImageIcon, 'Image'],
                            ['video', Film, 'Video'],
                        ] as const).map(([tab, Icon, label]) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all',
                                    activeTab === tab ? 'bg-gold-400 text-brand-950 shadow-sm' : 'text-white/80 hover:text-white'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                }
                overlap={
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                <Link2 className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-900">Link to a strategy post <span className="font-medium text-zinc-400">(optional)</span></p>
                                <p className="text-xs text-zinc-500">
                                    When linked, <strong className="font-semibold text-zinc-700">AI Help</strong> suggestions stay on brand for that campaign day.
                                </p>
                            </div>
                            {(strategyId || postId) && (
                                <Button type="button" variant="ghost" size="sm" className="ml-auto h-8 text-zinc-500 hover:text-zinc-900" onClick={clearLink}>
                                    <X className="mr-1 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="ae-section-label">Strategy</Label>
                                {strategiesLoading ? (
                                    <div className="flex h-10 items-center gap-2 text-sm text-zinc-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading strategies…
                                    </div>
                                ) : strategies.length === 0 ? (
                                    <p className="py-2 text-xs text-zinc-500">
                                        No strategies yet. Create one in Strategy Planner, then return here.
                                    </p>
                                ) : (
                                    <Select value={strategyId || '__none__'} onValueChange={handleStrategyChange}>
                                        <SelectTrigger className="h-10 w-full text-left">
                                            <SelectValue placeholder="Choose strategy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">None — generic AI Help</SelectItem>
                                            {strategies.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.name || 'Untitled'}
                                                    {typeof s.posts_count === 'number' ? ` (${s.posts_count} posts)` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="ae-section-label">Post (day)</Label>
                                {!strategyId ? (
                                    <p className="py-2 text-xs text-zinc-500">Select a strategy first.</p>
                                ) : postsLoading ? (
                                    <div className="flex h-10 items-center gap-2 text-sm text-zinc-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading posts…
                                    </div>
                                ) : postsForPicker.length === 0 ? (
                                    <p className="py-2 text-xs text-gold-700">No posts in this strategy.</p>
                                ) : (
                                    <Select value={postId || '__none__'} onValueChange={handlePostChange}>
                                        <SelectTrigger className="h-10 w-full text-left">
                                            <SelectValue placeholder="Choose scheduled post" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[280px]">
                                            <SelectItem value="__none__">Choose a post…</SelectItem>
                                            {postsForPicker.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {formatPostLabel(p)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                        {strategyId && (
                            <div className="flex min-h-6 items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800">
                                {postId ? (
                                    contextLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading strategy context for AI Help…</span>
                                        </>
                                    ) : contextError ? (
                                        <span className="text-gold-800">{contextError} AI Help will use generic prompts.</span>
                                    ) : strategyContext ? (
                                        <span>
                                            Linked to <span className="font-bold">{strategyContext.strategyName}</span> — Day{' '}
                                            {strategyContext.post.day} ({strategyContext.post.platform})
                                        </span>
                                    ) : null
                                ) : (
                                    <span>Pick a post to enable strategy-aware AI Help.</span>
                                )}
                            </div>
                        )}
                    </div>
                }
            />

            {activeTab === 'image' ? (
                <PostersWorkbench
                    type="image"
                    title="Image Editing"
                    subtitle="Upload an image, describe your edit, and generate a new poster-ready result."
                    strategyContext={strategyContext}
                />
            ) : (
                <PostersWorkbench
                    type="video"
                    title="Video Generation"
                    subtitle="Turn an idea into a short video concept with the right format and motion direction."
                    strategyContext={strategyContext}
                />
            )}
        </div>
    );
}

export function PostersPageClient() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm font-medium">Loading…</p>
                </div>
            }
        >
            <PostersPageInner />
        </Suspense>
    );
}
