'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
    StrategyTemplateCard,
    type StrategyTemplatePrefill,
} from '@/components/strategy/strategy-template-card';
import { GenerateStrategyModal } from '@/components/strategy/generate-strategy-modal';
import { StrategyCardSkeleton } from '@/components/strategy/strategy-card-skeleton';
import {
    DOMAIN_LABELS,
    DOMAIN_STRATEGY_TEMPLATES,
    type StrategyDomain,
} from '@/components/strategy/domain-strategy-templates';

const MAX_CONCEPTS = 5;
const DOMAIN_OPTIONS: StrategyDomain[] = ['gym', 'jewellery', 'ecommerce'];

function mapBusinessVerticalToDomain(value: unknown): StrategyDomain | null {
    const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!v) return null;
    if (v.includes('ecom')) return 'ecommerce';
    if (v.includes('jewel')) return 'jewellery';
    if (v.includes('gym') || v.includes('fitness') || v.includes('health')) return 'gym';
    return null;
}

export default function PrebuiltStrategyPromptsPage() {
    const { user, loading: authLoading, getIdToken } = useAuth();
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);

    const [activeDomain, setActiveDomain] = useState<StrategyDomain>('ecommerce');
    const [isDomainLoading, setIsDomainLoading] = useState(true);
    const [hasCategoryConfigured, setHasCategoryConfigured] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [prefill, setPrefill] = useState<StrategyTemplatePrefill | null>(null);
    const [isStrategiesLoading, setIsStrategiesLoading] = useState(false);
    const [strategies, setStrategies] = useState<Array<{
        id: string;
        name: string;
        theme?: string | null;
        platforms: string[];
        duration_days: number;
        created_at: string;
        start_date?: string | null;
        image_url?: string | null;
        posts_count?: number;
    }>>([]);

    const templates = useMemo(() => {
        if (!hasCategoryConfigured) return [];
        return (DOMAIN_STRATEGY_TEMPLATES[activeDomain] || []).slice(0, MAX_CONCEPTS);
    }, [activeDomain, hasCategoryConfigured]);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!user) return;
        if (authLoading) return;

        let cancelled = false;
        (async () => {
            setIsDomainLoading(true);
            try {
                const token = await getIdToken();
                const userRes = await fetch('/api/user', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!userRes.ok) throw new Error('Failed to detect domain');
                const userData = (await userRes.json()) as { businessVertical?: string | null };
                const profileDomain = mapBusinessVerticalToDomain(userData.businessVertical);

                if (cancelled) return;
                if (profileDomain && DOMAIN_OPTIONS.includes(profileDomain)) {
                    setActiveDomain(profileDomain);
                    setHasCategoryConfigured(true);
                    return;
                }

                setHasCategoryConfigured(false);
            } catch {
                setHasCategoryConfigured(false);
            } finally {
                if (!cancelled) setIsDomainLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user, authLoading, getIdToken]);

    const fetchStrategies = async () => {
        if (!user) return;
        setIsStrategiesLoading(true);
        try {
            const res = await fetch('/api/strategy');
            if (!res.ok) {
                setStrategies([]);
                return;
            }
            const data = (await res.json()) as Array<{
                id: string;
                name: string;
                theme?: string | null;
                business_type?: string | null;
                platforms: string[];
                duration_days: number;
                created_at: string;
                start_date?: string | null;
                image_url?: string | null;
                posts_count?: number;
            }>;

            const filtered = (Array.isArray(data) ? data : [])
                .filter((s: any) => s.is_prebuilt === true)
                .filter((s: any) => {
                    if (!hasCategoryConfigured) return false;
                    const domainFromBusinessType = mapBusinessVerticalToDomain(s.business_type);
                    return domainFromBusinessType === activeDomain;
                });
            setStrategies(filtered);
        } catch {
            setStrategies([]);
        } finally {
            setIsStrategiesLoading(false);
        }
    };

    useEffect(() => {
        if (!user || authLoading) return;
        fetchStrategies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDomain, user, authLoading]);

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/strategy/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        await fetchStrategies();
    };

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-[10px] border border-zinc-200 shadow-sm">
                <div className="space-y-2 mb-6">
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-tight">
                        Prebuilt Strategy Prompts
                    </h1>
                    <p className="text-base leading-relaxed text-zinc-500 max-w-2xl">
                        Click a template to generate a category-specific strategy (growth, marketing, knowledge, and engagement).
                    </p>
                </div>

                <div className="text-sm text-zinc-500 font-medium">
                    {isDomainLoading ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Detecting your category...
                        </span>
                    ) : !hasCategoryConfigured ? (
                        <>
                            Category not set in your profile. Set it in Settings to see your personalized templates.
                        </>
                    ) : (
                        <>
                            Showing templates for <span className="font-semibold text-zinc-800">{DOMAIN_LABELS[activeDomain]}</span>.
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-[10px] border border-zinc-200 shadow-sm">
                {templates.length === 0 ? (
                    <div className="text-sm text-zinc-500">No templates available.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((t) => (
                            <StrategyTemplateCard
                                key={t.id}
                                template={t}
                                onClick={() => {
                                    setPrefill(t.prefill);
                                    setModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-[10px] border border-zinc-200 shadow-sm">
                <div className="space-y-1 mb-5">
                    <h2 className="text-lg font-bold text-zinc-900">
                        Your {DOMAIN_LABELS[activeDomain]} prebuilt strategies
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Only your category-specific prebuilt strategies appear here.
                    </p>
                </div>

                {isStrategiesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <StrategyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : strategies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-16 bg-white rounded-[10px] border border-zinc-200 shadow-sm">
                        <div className="rounded-full bg-indigo-100 p-4" />
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold tracking-tight text-zinc-900">
                                No prebuilt strategies yet
                            </h3>
                            <p className="text-base leading-relaxed text-zinc-500 max-w-sm">
                                Pick a template above to generate your first domain-specific strategy.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {strategies.map((s) => (
                            <div
                                key={s.id}
                                className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4 flex flex-col gap-3"
                            >
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2">{s.name}</h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {s.duration_days} days · {(s.posts_count ?? 0)} ideas
                                    </p>
                                </div>
                                <div className="text-[11px] text-zinc-500">
                                    This strategy is for ideas/planning only (no posting or content-generation actions here).
                                </div>
                                <div className="pt-1 flex items-center gap-2">
                                    <Button
                                        variant="default"
                                        className="rounded-full text-xs h-8"
                                        onClick={() => router.push(`/dashboard/prebuilt-strategy/${s.id}`)}
                                    >
                                        View Blueprint
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-full text-xs h-8 border-zinc-200"
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {hasMounted && (
                <GenerateStrategyModal
                    open={modalOpen}
                    onOpenChange={(o) => {
                        setModalOpen(o);
                        if (!o) setPrefill(null);
                    }}
                    onSuccess={() => {
                        fetchStrategies();
                    }}
                    prefill={prefill}
                />
            )}
        </div>
    );
}

