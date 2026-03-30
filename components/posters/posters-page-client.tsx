'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Image as ImageIcon, Film, Loader2, Link2, X } from 'lucide-react';
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
        <div className="space-y-3 w-full max-w-7xl mx-auto">
            <div className="bg-white p-4 rounded-[10px] border border-zinc-200 shadow-sm">
                <div className="space-y-2">
                    <div className="space-y-0.5">
                        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-tight">
                            Posters
                        </h1>
                        <p className="text-base leading-relaxed text-zinc-500 max-w-2xl">
                            Describe what you want to generate. We’ll turn it into a powerful prompt and produce the final
                            content.
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-3 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link2 className="h-4 w-4 text-indigo-600 shrink-0" />
                            <p className="text-sm font-semibold text-zinc-800">Link to a strategy post (optional)</p>
                            {(strategyId || postId) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-zinc-500 hover:text-zinc-900 ml-auto"
                                    onClick={clearLink}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 leading-snug">
                            When linked, <strong className="font-medium text-zinc-700">AI Help</strong> suggestions stay on
                            brand for that campaign day. Open from the strategy board, or pick here if you came from the
                            sidebar.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-zinc-600">Strategy</Label>
                                {strategiesLoading ? (
                                    <div className="flex items-center gap-2 h-10 text-sm text-zinc-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading strategies…
                                    </div>
                                ) : strategies.length === 0 ? (
                                    <p className="text-xs text-zinc-500 py-2">
                                        No strategies yet. Create one in Strategy Planner, then return here.
                                    </p>
                                ) : (
                                    <Select
                                        value={strategyId || '__none__'}
                                        onValueChange={handleStrategyChange}
                                    >
                                        <SelectTrigger className="w-full bg-white border-zinc-200 h-10 text-left">
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
                                <Label className="text-xs font-medium text-zinc-600">Post (day)</Label>
                                {!strategyId ? (
                                    <p className="text-xs text-zinc-500 py-2">Select a strategy first.</p>
                                ) : postsLoading ? (
                                    <div className="flex items-center gap-2 h-10 text-sm text-zinc-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading posts…
                                    </div>
                                ) : postsForPicker.length === 0 ? (
                                    <p className="text-xs text-amber-600 py-2">No posts in this strategy.</p>
                                ) : (
                                    <Select value={postId || '__none__'} onValueChange={handlePostChange}>
                                        <SelectTrigger className="w-full bg-white border-zinc-200 h-10 text-left">
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
                    </div>

                    <div className="flex items-center gap-2 text-sm text-zinc-600 min-h-6">
                        {strategyId && postId ? (
                            contextLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                    <span>Loading strategy context for AI Help…</span>
                                </>
                            ) : contextError ? (
                                <span className="text-amber-600">{contextError} AI Help will use generic prompts.</span>
                            ) : strategyContext ? (
                                <span className="text-zinc-700">
                                    Linked to <span className="font-medium">{strategyContext.strategyName}</span> — Day{' '}
                                    {strategyContext.post.day} ({strategyContext.post.platform})
                                </span>
                            ) : null
                        ) : strategyId && !postId ? (
                            <span className="text-zinc-500">Pick a post to enable strategy-aware AI Help.</span>
                        ) : null}
                    </div>
                    <div className="flex gap-2 p-1 rounded-lg bg-zinc-100 w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab('image')}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                activeTab === 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                            )}
                        >
                            <ImageIcon className="h-4 w-4" />
                            Image
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('video')}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                activeTab === 'video' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                            )}
                        >
                            <Film className="h-4 w-4" />
                            Video
                        </button>
                    </div>
                </div>
            </div>

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
