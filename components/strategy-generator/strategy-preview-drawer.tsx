'use client';

import { CalendarDays } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { StrategyItem } from './types';

type StrategyPreviewDrawerProps = {
    strategy: StrategyItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function StrategyPreviewDrawer({ strategy, open, onOpenChange }: StrategyPreviewDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full gap-0 border-zinc-200 sm:max-w-lg">
                <SheetHeader className="border-b border-zinc-100 pb-4">
                    <div className="mb-2">
                        <Badge variant="outline" className="rounded-full border-zinc-300 text-zinc-600">
                            Strategy Preview
                        </Badge>
                    </div>
                    <SheetTitle className="text-xl font-semibold text-zinc-900">
                        {strategy?.title ?? 'Preview'}
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500">
                        {strategy?.description ?? 'A quick look at your first 5 days.'}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 overflow-y-auto p-5">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Inspired by</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800">{strategy?.inspiredBy ?? '—'}</p>
                    </div>

                    <div className="space-y-2">
                        {strategy?.preview.map((item) => (
                            <div
                                key={`${strategy.id}-${item.day}`}
                                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3"
                            >
                                <div className="mt-0.5 rounded-lg bg-zinc-100 p-2 text-zinc-600">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">Day {item.day}</p>
                                    <p className="text-sm text-zinc-600">{item.idea}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
