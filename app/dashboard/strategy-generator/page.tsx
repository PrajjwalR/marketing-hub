'use client';

import { useMemo, useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterBar } from '@/components/strategy-generator/filter-bar';
import { StrategyCard } from '@/components/strategy-generator/strategy-card';
import { StrategyPreviewDrawer } from '@/components/strategy-generator/strategy-preview-drawer';
import type { FilterOption, StrategyItem } from '@/components/strategy-generator/types';

const platforms: FilterOption[] = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
];

const goals: FilterOption[] = [
    { value: 'brand_awareness', label: 'Brand Awareness' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'sales', label: 'Sales' },
];

const niches: FilterOption[] = [
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'saas', label: 'SaaS' },
    { value: 'personal_brand', label: 'Personal Brand' },
];

const durations: FilterOption[] = [
    { value: '7', label: '7 Days' },
    { value: '10', label: '10 Days' },
    { value: '30', label: '30 Days' },
];

const strategies: StrategyItem[] = [
    {
        id: 'knowledge',
        title: '30 Days to Build Authority',
        type: 'Knowledge-Based',
        badge: 'Knowledge-Based',
        description: 'Grow using value-driven educational content with practical, repeatable formats.',
        inspiredBy: 'Zipline AI',
        icon: 'book',
        gradient: 'bg-gradient-to-br from-indigo-50 to-sky-50',
        preview: [
            { day: 1, idea: 'Share one common mistake your audience makes.' },
            { day: 2, idea: 'Post a simple educational tip with a real example.' },
            { day: 3, idea: 'Break down one myth in your niche.' },
            { day: 4, idea: 'Share a mini framework your audience can copy.' },
            { day: 5, idea: 'Run a Q&A prompt to collect learning gaps.' },
        ],
        resultTitle: '30-Day Knowledge Strategy',
    },
    {
        id: 'challenge',
        title: '10-Day Momentum Challenge',
        type: 'Challenge-Based',
        badge: 'Challenge',
        description: 'Build consistent audience habits with daily challenge hooks and progress loops.',
        inspiredBy: 'Gymshark',
        icon: 'flame',
        gradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
        preview: [
            { day: 1, idea: 'Launch the challenge with a clear transformation outcome.' },
            { day: 2, idea: 'Share a quick win checkpoint.' },
            { day: 3, idea: 'Ask users to comment their day-3 progress.' },
            { day: 4, idea: 'Feature one participant and their result.' },
            { day: 5, idea: 'Publish a motivation reset post.' },
        ],
        resultTitle: '10-Day Challenge Strategy',
    },
    {
        id: 'engagement',
        title: 'Engagement Flywheel Blueprint',
        type: 'Engagement Strategy',
        badge: 'Engagement',
        description: 'Increase comments, saves, and conversations through interactive content prompts.',
        inspiredBy: 'Duolingo',
        icon: 'users',
        gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        preview: [
            { day: 1, idea: 'Post a polarizing opinion and invite responses.' },
            { day: 2, idea: 'Run a simple this-or-that audience choice.' },
            { day: 3, idea: 'Ask for stories around a common pain point.' },
            { day: 4, idea: 'Respond to top comments with follow-up content.' },
            { day: 5, idea: 'Share a user-generated comment spotlight.' },
        ],
        resultTitle: '30-Day Engagement Strategy',
    },
    {
        id: 'storytelling',
        title: 'Storytelling Trust System',
        type: 'Storytelling Strategy',
        badge: 'Storytelling',
        description: 'Turn customer moments and founder insights into narrative-led content series.',
        inspiredBy: 'Notion',
        icon: 'sparkles',
        gradient: 'bg-gradient-to-br from-fuchsia-50 to-rose-50',
        preview: [
            { day: 1, idea: 'Tell the origin story behind your product idea.' },
            { day: 2, idea: 'Share a behind-the-scenes build decision.' },
            { day: 3, idea: 'Highlight a customer transformation story.' },
            { day: 4, idea: 'Explain one setback and what you learned.' },
            { day: 5, idea: 'End with a future roadmap narrative.' },
        ],
        resultTitle: '30-Day Storytelling Strategy',
    },
    {
        id: 'product_led',
        title: 'Product-Led Demand Engine',
        type: 'Product-Led Strategy',
        badge: 'Product-Led',
        description: 'Use product moments, demos, and workflows to attract high-intent audiences.',
        inspiredBy: 'Linear',
        icon: 'rocket',
        gradient: 'bg-gradient-to-br from-violet-50 to-purple-50',
        preview: [
            { day: 1, idea: 'Show one feature solving a frequent pain point.' },
            { day: 2, idea: 'Publish a quick workflow tutorial.' },
            { day: 3, idea: 'Compare old vs new way of doing the task.' },
            { day: 4, idea: 'Share a use case from an active customer.' },
            { day: 5, idea: 'Offer a practical checklist tied to product value.' },
        ],
        resultTitle: '30-Day Product-Led Strategy',
    },
];

function GeneratedPlanSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-zinc-200 p-4">
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
        </div>
    );
}

export default function StrategyGeneratorPage() {
    const [platform, setPlatform] = useState(platforms[0].value);
    const [goal, setGoal] = useState(goals[0].value);
    const [niche, setNiche] = useState(niches[0].value);
    const [duration, setDuration] = useState(durations[2].value);

    const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
    const [previewStrategyId, setPreviewStrategyId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    const selectedStrategy = useMemo(
        () => strategies.find((item) => item.id === selectedStrategyId) ?? null,
        [selectedStrategyId]
    );
    const previewStrategy = useMemo(
        () => strategies.find((item) => item.id === previewStrategyId) ?? null,
        [previewStrategyId]
    );

    const generatedIdeas = useMemo(() => {
        if (!selectedStrategy) return [];
        const totalDays = Number(duration) === 7 ? 7 : Number(duration) === 10 ? 10 : 10;
        return Array.from({ length: totalDays }).map((_, index) => ({
            day: index + 1,
            idea: `${selectedStrategy.type}: ${selectedStrategy.preview[index % selectedStrategy.preview.length].idea}`,
        }));
    }, [selectedStrategy, duration]);

    const handleGenerate = async () => {
        if (!selectedStrategy) return;
        setIsGenerating(true);
        setHasGenerated(false);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsGenerating(false);
        setHasGenerated(true);
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:gap-8">
            <section className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                    Content Strategy Generator
                </h1>
                <p className="text-base text-zinc-600">
                    Generate 7–30 day content ideas tailored to your niche
                </p>
                <p className="text-sm text-zinc-500">Inspired by proven brand strategies</p>
            </section>

            <FilterBar
                platform={platform}
                goal={goal}
                niche={niche}
                duration={duration}
                platforms={platforms}
                goals={goals}
                niches={niches}
                durations={durations}
                onPlatformChange={setPlatform}
                onGoalChange={setGoal}
                onNicheChange={setNiche}
                onDurationChange={setDuration}
            />

            <section className="space-y-4 pb-24">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900">Pick a strategy style</h2>
                    <p className="text-xs text-zinc-500">
                        {platforms.find((p) => p.value === platform)?.label} · {goals.find((g) => g.value === goal)?.label} ·{' '}
                        {niches.find((n) => n.value === niche)?.label}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {strategies.map((strategy) => (
                        <StrategyCard
                            key={strategy.id}
                            strategy={strategy}
                            selected={selectedStrategyId === strategy.id}
                            onPreview={() => setPreviewStrategyId(strategy.id)}
                            onSelect={() => setSelectedStrategyId(strategy.id)}
                        />
                    ))}
                </div>
            </section>

            {(isGenerating || hasGenerated) && (
                <section className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold text-zinc-900">
                            {selectedStrategy?.resultTitle ?? 'Generated strategy'}
                        </h3>
                        <p className="text-sm text-zinc-500">
                            Mock output for {durations.find((d) => d.value === duration)?.label}
                        </p>
                    </div>

                    {isGenerating ? (
                        <GeneratedPlanSkeleton />
                    ) : (
                        <Card className="rounded-2xl border-zinc-200 py-3">
                            <div className="space-y-2 px-3">
                                {generatedIdeas.map((item) => (
                                    <div
                                        key={item.day}
                                        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:bg-zinc-50"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                            Day {item.day}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-800">{item.idea}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </section>
            )}

            <StrategyPreviewDrawer
                strategy={previewStrategy}
                open={!!previewStrategy}
                onOpenChange={(open) => {
                    if (!open) setPreviewStrategyId(null);
                }}
            />

            {selectedStrategy && (
                <div className="fixed bottom-4 left-1/2 z-30 w-[min(94vw,740px)] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-zinc-600">
                            Selected: <span className="font-semibold text-zinc-900">{selectedStrategy.title}</span>
                        </p>
                        <Button className="rounded-full px-6" onClick={handleGenerate} disabled={isGenerating}>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Generating...' : 'Generate Full Plan'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
