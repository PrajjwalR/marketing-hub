'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, FolderOpen, Sparkles, Target } from 'lucide-react';
import { EmptyState, PageHero, SectionHeader, heroButtonClass } from '@/components/dashboard/page-hero';
import { StrategyCard } from '@/components/strategy/strategy-card';
import { StrategyCardSkeleton } from '@/components/strategy/strategy-card-skeleton';
import { GenerateStrategyModal } from '@/components/strategy/generate-strategy-modal';
import {
    STRATEGY_TEMPLATES,
    StrategyTemplateCard,
    type StrategyTemplatePrefill,
} from '@/components/strategy/strategy-template-card';

interface Strategy {
    id: string;
    name: string;
    theme?: string | null;
    platforms: string[];
    duration_days: number;
    created_at: string;
    start_date?: string | null;
    image_url?: string | null;
    posts_count?: number;
}

export default function StrategyPage() {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [prefill, setPrefill] = useState<StrategyTemplatePrefill | null>(null);

    const fetchStrategies = async () => {
        try {
            const res = await fetch('/api/strategy');
            if (res.ok) {
                const data = await res.json();
                const filtered = (Array.isArray(data) ? data : [])
                    .filter((s: any) => s.is_prebuilt !== true);
                setStrategies(filtered);
            }
        } catch {
            setStrategies([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStrategies();
    }, []);

    const totalPosts = strategies.reduce((sum, s) => sum + (s.posts_count ?? 0), 0);

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/strategy/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setStrategies((prev) => prev.filter((s) => s.id !== id));
        } else {
            throw new Error('Delete failed');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <PageHero
                titleId="strategy-header"
                title="Strategy Planner"
                breadcrumb={['Strategy', 'Strategy Planner']}
                icon={Target}
                description="AI-powered social media strategy. Generate a plan, review and edit it, then convert it to calendar events."
                actions={
                    <button
                        id="strategy-generate-btn"
                        type="button"
                        onClick={() => {
                            setPrefill(null);
                            setModalOpen(true);
                        }}
                        className={heroButtonClass('gold')}
                    >
                        <Sparkles className="h-4 w-4" />
                        Generate AI strategy
                    </button>
                }
                stats={[
                    { label: 'Saved strategies', value: isLoading ? '—' : strategies.length, icon: FolderOpen },
                    { label: 'Planned posts', value: isLoading ? '—' : totalPosts, icon: CalendarDays },
                ]}
                overlap={
                    <>
                        <SectionHeader
                            label="Start from a template"
                            right={<span className="hidden text-xs font-semibold text-zinc-400 sm:block">Scroll for more →</span>}
                        />
                        <div id="strategy-templates" className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1">
                            {STRATEGY_TEMPLATES.map((t) => (
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
                    </>
                }
            />

            <div className="ae-divider-label my-8">
                <span className="text-[10px] text-zinc-400">◆</span>
                Your strategies
                <span className="text-[10px] text-zinc-400">◆</span>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <StrategyCardSkeleton key={i} />
                    ))}
                </div>
            ) : strategies.length === 0 ? (
                <EmptyState
                    icon={Sparkles}
                    title="No strategies yet"
                    description="Generate your first AI-powered strategy to plan content across your social channels."
                    action={
                        <Button
                            variant="gold"
                            size="lg"
                            onClick={() => {
                                setPrefill(null);
                                setModalOpen(true);
                            }}
                        >
                            <Sparkles className="h-4 w-4" />
                            Generate your own AI strategy
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {strategies.map((s) => (
                        <StrategyCard
                            key={s.id}
                            id={s.id}
                            name={s.name}
                            platforms={s.platforms || []}
                            durationDays={s.duration_days}
                            createdAt={s.created_at}
                            startDate={s.start_date}
                            imageUrl={s.image_url}
                            postsCount={s.posts_count ?? 0}
                            onDelete={handleDelete}
                            onImageUpdate={fetchStrategies}
                        />
                    ))}
                </div>
            )}

            <GenerateStrategyModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={() => fetchStrategies()}
                prefill={prefill}
            />
        </div>
    );
}
