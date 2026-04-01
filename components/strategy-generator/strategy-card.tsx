'use client';

import { BookOpen, Flame, Rocket, Sparkles, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StrategyItem } from './types';

type StrategyCardProps = {
    strategy: StrategyItem;
    selected: boolean;
    onPreview: () => void;
    onSelect: () => void;
};

const ICON_MAP = {
    book: BookOpen,
    flame: Flame,
    users: Users,
    sparkles: Sparkles,
    rocket: Rocket,
};

export function StrategyCard({ strategy, selected, onPreview, onSelect }: StrategyCardProps) {
    const Icon = ICON_MAP[strategy.icon];

    return (
        <Card
            className={cn(
                'group rounded-2xl border-zinc-200 py-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg',
                selected && 'border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-300'
            )}
        >
            <CardHeader className={cn('rounded-t-2xl border-b border-zinc-100 p-5', strategy.gradient)}>
                <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge
                        variant="outline"
                        className="rounded-full border-zinc-300 bg-white/80 text-[11px] text-zinc-700"
                    >
                        {strategy.badge}
                    </Badge>
                    <div className="rounded-xl bg-white/90 p-2 text-zinc-700 shadow-sm">
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <CardTitle className="text-lg leading-tight text-zinc-900">{strategy.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
                <p className="text-sm leading-relaxed text-zinc-600">{strategy.description}</p>
                <p className="text-xs text-zinc-500">
                    Inspired by: <span className="font-semibold text-zinc-700">{strategy.inspiredBy}</span>
                </p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 border-t border-zinc-100 p-5">
                <Button
                    variant="outline"
                    className="rounded-full border-zinc-200"
                    onClick={onPreview}
                >
                    Preview
                </Button>
                <Button className="rounded-full" onClick={onSelect}>
                    {selected ? 'Selected' : 'Select Strategy'}
                </Button>
            </CardFooter>
        </Card>
    );
}
