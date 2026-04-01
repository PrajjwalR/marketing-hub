'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { StrategyCard } from '@/components/strategy/strategy-card';
import { StrategyCardSkeleton } from '@/components/strategy/strategy-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
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

const LANDING_BTN =
    'bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 rounded-full font-medium text-[15px] shadow-md transition-all';

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
                const prebuiltPrefix = 'prebuilt_';
                const filtered = (Array.isArray(data) ? data : []).filter((s: Strategy) => {
                    const t = s?.theme;
                    return !(typeof t === 'string' && t.startsWith(prebuiltPrefix));
                });
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

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/strategy/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setStrategies((prev) => prev.filter((s) => s.id !== id));
        } else {
            throw new Error('Delete failed');
        }
    };

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-[10px] border border-zinc-200 shadow-sm">
                <div className="space-y-1 mb-6">
                    <h1 id="strategy-header" className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-tight">
                        Strategy Planner
                    </h1>
                    <p className="text-base leading-relaxed text-zinc-500 max-w-2xl">
                        AI-powered social media strategy. Generate a plan, review, edit, then convert to calendar events.
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-bold tracking-widest uppercase text-[#239047]">
                        Choose a strategy template or create your own
                    </p>
                    <div id="strategy-templates" className="flex gap-4 overflow-x-auto pb-2 -mx-1">
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
                    <Button
                        id="strategy-generate-btn"
                        onClick={() => {
                            setPrefill(null);
                            setModalOpen(true);
                        }}
                        className={`h-11 px-6 gap-2 ${LANDING_BTN}`}
                    >
                        Generate your own AI strategy
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <StrategyCardSkeleton key={i} />
                        ))}
                    </div>
                </>
            ) : strategies.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6 py-16 bg-white rounded-[10px] border border-zinc-200 shadow-sm">
                    <div className="rounded-full bg-indigo-100 p-4">
                        <Sparkles className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">No strategies yet</h2>
                        <p className="text-base leading-relaxed text-zinc-500 max-w-sm">
                            Generate your first AI-powered strategy to plan content across your social channels.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setPrefill(null);
                            setModalOpen(true);
                        }}
                        className={`h-11 px-6 gap-2 ${LANDING_BTN}`}
                    >
                        <Sparkles className="h-5 w-5" />
                        Generate your own AI strategy
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-500">
                            You have total of{' '}
                            <span className="font-semibold text-zinc-700">{strategies.length}</span>
                            {strategies.length === 1 ? ' strategy' : ' strategies'}
                        </p>
                    </div>
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
                </>
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
