'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FolderOpen, LayoutTemplate, Lightbulb, Loader2, Sparkles, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHero, SectionHeader, heroButtonClass } from '@/components/dashboard/page-hero';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
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
                is_prebuilt?: boolean;
                platforms: string[];
                duration_days: number;
                created_at: string;
                start_date?: string | null;
                image_url?: string | null;
                posts_count?: number;
            }>;

            const filtered = (Array.isArray(data) ? data : [])
                .filter((s) => s.is_prebuilt === true)
                .filter((s) => {
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
        <div className="w-full max-w-7xl mx-auto">
            <PageHero
                title="Prebuilt Strategy Prompts"
                breadcrumb={['Strategy', 'Prebuilt Prompts']}
                icon={Lightbulb}
                description="Click a template to generate a category-specific strategy: growth, marketing, knowledge and engagement."
                stats={[
                    {
                        label: 'Your category',
                        icon: Tag,
                        value: isDomainLoading ? (
                            <span className="inline-flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting…</span>
                        ) : hasCategoryConfigured ? DOMAIN_LABELS[activeDomain] : 'Not set',
                    },
                    { label: 'Templates', value: templates.length, icon: LayoutTemplate },
                    { label: 'Generated', value: strategies.length, icon: FolderOpen },
                ]}
                actions={
                    !isDomainLoading && !hasCategoryConfigured ? (
                        <Link href="/dashboard/settings" className={heroButtonClass('gold')}>
                            Set your category <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : undefined
                }
            />

            <SectionHeader label="Templates for you" title={hasCategoryConfigured ? `${DOMAIN_LABELS[activeDomain]} playbooks` : 'Playbooks'} />
            {templates.length === 0 ? (
                <EmptyState
                    icon={LayoutTemplate}
                    title={hasCategoryConfigured ? 'No templates available' : 'Set your business category'}
                    description={hasCategoryConfigured ? undefined : 'Choose your industry in Settings to unlock personalized templates.'}
                    action={
                        !hasCategoryConfigured && (
                            <Link href="/dashboard/settings">
                                <Button variant="gold" size="lg">Open settings</Button>
                            </Link>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
                    {templates.map((t) => (
                        <StrategyTemplateCard
                            key={t.id}
                            template={t}
                            className="w-full sm:w-full"
                            onClick={() => {
                                setPrefill(t.prefill);
                                setModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="ae-divider-label my-8">
                <span className="text-[10px] text-zinc-400">◆</span>
                Your prebuilt strategies
                <span className="text-[10px] text-zinc-400">◆</span>
            </div>

            {isStrategiesLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                        <StrategyCardSkeleton key={i} />
                    ))}
                </div>
            ) : strategies.length === 0 ? (
                <EmptyState
                    icon={Sparkles}
                    title="No prebuilt strategies yet"
                    description="Pick a template above to generate your first domain-specific strategy."
                />
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {strategies.map((s, index) => {
                        const isNew = Date.now() - new Date(s.created_at).getTime() < 1000 * 60 * 60 * 24 * 7;
                        return (
                            <div key={s.id} className="ae-tile ae-tile-interactive ae-contour group flex items-center gap-4 p-4">
                                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-800 font-display text-lg font-semibold text-gold-300">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/dashboard/prebuilt-strategy/${s.id}`)}
                                    className="relative min-w-0 flex-1 text-left"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="truncate text-base font-extrabold text-zinc-900 group-hover:text-brand-800">{s.name}</span>
                                        {isNew && <span className="shrink-0 rounded-md bg-gold-200 px-1.5 py-0.5 text-[10px] font-bold text-gold-900">New</span>}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[13px] text-zinc-500">
                                        {s.duration_days} days · {s.posts_count ?? 0} ideas · {DOMAIN_LABELS[activeDomain]}
                                    </span>
                                </button>
                                <div className="relative flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(s.id)}
                                        aria-label="Delete strategy"
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <ArrowRight className="h-5 w-5 text-brand-600 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
