'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export type PlaybookPhase = {
    title: string;
    goal: string;
    points: string[];
    accent: string;
};

export type PlaybookDay = {
    id: string;
    day: number;
    dateLabel?: string;
    platform?: string;
    title: string;
    description: string;
    type: string;
    intent: string;
    hook: string;
    cta: string;
};

type StrategyHeaderProps = {
    backHref: string;
    title: string;
    subtitle: string;
    description: string;
    durationDays: number;
    showPrebuiltBadge: boolean;
    editable: boolean;
    isSavingName: boolean;
    onTitleChange: (value: string) => void;
    onTitleBlur: () => void;
};

export function StrategyHeader({
    backHref,
    title,
    subtitle,
    description,
    durationDays,
    showPrebuiltBadge,
    editable,
    isSavingName,
    onTitleChange,
    onTitleBlur,
}: StrategyHeaderProps) {
    return (
        <div className="px-6 pt-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <Link href={backHref}>
                            <button
                                type="button"
                                className="mt-0.5 h-8 w-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
                                aria-label="Back"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={title}
                                    onChange={(e) => onTitleChange(e.target.value)}
                                    onBlur={editable ? onTitleBlur : undefined}
                                    disabled={!editable}
                                    className={cn(
                                        'border-0 bg-transparent px-0 h-auto py-0.5 rounded-none text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0',
                                        !editable && 'text-zinc-900 opacity-100'
                                    )}
                                />
                                {isSavingName && <Loader2 className="h-4 w-4 animate-spin text-zinc-400 shrink-0" />}
                            </div>
                            <p className="text-sm text-zinc-500">{subtitle}</p>
                            <p className="text-sm text-zinc-600 max-w-3xl">{description}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge className="rounded-full bg-zinc-900 text-white">{durationDays} days</Badge>
                        {showPrebuiltBadge && (
                            <Badge variant="outline" className="rounded-full border-amber-300 bg-amber-50 text-amber-700">
                                Prebuilt Strategy - Ideas Only
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

type StrategyOverviewProps = {
    summary: string;
    outcomes: string[];
    audience: string[];
};

export function StrategyOverview({ summary, outcomes, audience }: StrategyOverviewProps) {
    return (
        <section className="px-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="rounded-2xl border-zinc-200 py-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-base">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 text-sm leading-relaxed text-zinc-600">{summary}</CardContent>
                </Card>
                <Card className="rounded-2xl border-zinc-200 py-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-base">Expected Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <ul className="space-y-2 text-sm text-zinc-600">
                            {outcomes.map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-zinc-200 py-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-base">Target Audience</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <ul className="space-y-2 text-sm text-zinc-600">
                            {audience.map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

type StrategyPhasesProps = { phases: PlaybookPhase[] };

export function StrategyPhases({ phases }: StrategyPhasesProps) {
    return (
        <section className="px-6 space-y-3">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900">Strategy Breakdown</h2>
                <p className="text-sm text-zinc-500">A week-by-week plan to execute this strategy with clarity.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {phases.map((phase) => (
                    <Card key={phase.title} className="rounded-2xl border-zinc-200 py-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className={cn('rounded-t-2xl p-5 pb-3', phase.accent)}>
                            <CardTitle className="text-base">{phase.title}</CardTitle>
                            <p className="text-xs text-zinc-600">{phase.goal}</p>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-4">
                            <ul className="space-y-2 text-sm text-zinc-600">
                                {phase.points.map((point) => (
                                    <li key={point} className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

type StrategyDayCardProps = { day: PlaybookDay };

export function StrategyDayCard({ day }: StrategyDayCardProps) {
    return (
        <Card className="rounded-2xl border-zinc-200 py-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="border-b border-zinc-100 p-5 pb-3">
                <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="rounded-full border-zinc-300 text-zinc-600">
                        Day {day.day}
                    </Badge>
                    <div className="text-xs text-zinc-500">{day.dateLabel || `Day ${day.day}`}</div>
                </div>
                <CardTitle className="text-base leading-tight">{day.title}</CardTitle>
                <p className="text-sm text-zinc-600">{day.description}</p>
            </CardHeader>
            <CardContent className="px-5 pt-4 pb-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                        {day.type}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-50 text-emerald-700">
                        {day.intent}
                    </Badge>
                    {day.platform && (
                        <Badge variant="outline" className="rounded-full border-zinc-300 text-zinc-600">
                            {day.platform}
                        </Badge>
                    )}
                </div>
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-1">Hook</p>
                    <p className="text-sm text-zinc-700">{day.hook}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-1">CTA Suggestion</p>
                    <p className="text-sm text-zinc-700">{day.cta}</p>
                </div>
            </CardContent>
        </Card>
    );
}

type ExecutionGuideProps = { points: string[] };

export function ExecutionGuide({ points }: ExecutionGuideProps) {
    return (
        <section className="px-6">
            <Card className="rounded-2xl border-zinc-200 py-0 shadow-sm">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        How to Execute This Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <ul className="space-y-2 text-sm text-zinc-700">
                        {points.map((point) => (
                            <li key={point} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}

type StrategyTipsProps = { tips: string[] };

export function StrategyTips({ tips }: StrategyTipsProps) {
    return (
        <section className="px-6 pb-6">
            <Card className="rounded-2xl border-amber-200 bg-amber-50/50 py-0 shadow-sm">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-zinc-900">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        Pro Tips
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <ul className="space-y-2 text-sm text-zinc-700">
                        {tips.map((tip) => (
                            <li key={tip} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}
