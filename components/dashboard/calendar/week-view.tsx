'use client';

import { useCalendar } from './calendar-context';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlatformPreviewCard } from './platform-preview';
import { EventApprovalBadge } from './event-approval-badge';
import {
    Megaphone,
    Plus,
} from 'lucide-react';
import { useMemo } from 'react';

// Platform rendering is handled by PlatformPreview below.

// One distinct color per day of the week (Sun → Sat)
const DAY_COLORS = [
    '#f43f5e', // Sun – rose
    '#8b5cf6', // Mon – violet
    '#3b82f6', // Tue – blue
    '#10b981', // Wed – emerald
    '#f59e0b', // Thu – amber
    '#f97316', // Fri – orange
    '#06b6d4', // Sat – cyan
];

interface HBarProps {
    total: number;
    posted: number;
    color: string;
}

function HBar({ total, posted, color }: HBarProps) {
    const pct = total === 0 ? 0 : Math.min(100, Math.round((posted / total) * 100));
    return (
        <div className="w-full h-5 rounded-full overflow-hidden bg-zinc-200">
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                    width: total === 0 ? '100%' : `${Math.max(4, pct)}%`,
                    backgroundColor: color,
                    opacity: total === 0 ? 0.15 : 1,
                }}
            />
        </div>
    );
}

export function WeekView() {
    const { currentDate, events, socialConnections, openCreateDialog, openEditDialog } = useCalendar();

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const eventsByDay = useMemo(() => {
        const map = new Map<string, typeof events>();
        for (const day of days) {
            map.set(format(day, 'yyyy-MM-dd'), []);
        }
        for (const e of events) {
            const d = parseISO(e.scheduled_at);
            const key = format(d, 'yyyy-MM-dd');
            const arr = map.get(key);
            if (arr) arr.push(e);
        }
        for (const [key, arr] of map.entries()) {
            map.set(
                key,
                [...arr].sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime())
            );
        }
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [events, currentDate]);

    const resolveAccount = (accountId: string | null) =>
        accountId ? socialConnections.find((c) => c.id === accountId) : undefined;

    return (
        <div className="w-full text-zinc-900">
            {/* Progress bars — outside cards, above columns, left-aligned to each column */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {days.map((day, dayIdx) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const dayEvts = (eventsByDay.get(key) || []).filter((e) => (e.type || '').toLowerCase() !== 'note');
                    const total = dayEvts.length;
                    const posted = dayEvts.filter(e => e.status === 'completed' || e.status === 'published').length;
                    const color = DAY_COLORS[dayIdx % 7];
                    return (
                        <div key={key} className="flex items-center justify-start">
                            <div className="w-20">
                                <HBar total={total} posted={posted} color={color} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Week Columns — 7 equal columns, vertical scroll only */}
            <div className="grid grid-cols-7 gap-2 items-start overflow-y-auto max-h-[calc(100vh-280px)]">
                {days.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const key = format(day, 'yyyy-MM-dd');
                    const dayEvents = (eventsByDay.get(key) || []).filter((e) => (e.type || '').toLowerCase() !== 'note');
                    const defaultCreateDate = new Date(day);
                    defaultCreateDate.setHours(9, 0, 0, 0);

                    return (
                        <div
                            key={key}
                            className={cn(
                                'rounded-2xl border bg-white overflow-hidden flex flex-col',
                                isToday ? 'border-amber-300 shadow-md' : 'border-zinc-200 shadow-sm'
                            )}
                        >
                            {/* Column header */}
                            <div className={cn(
                                'px-3 pt-3 pb-2 border-b flex flex-col gap-2',
                                isToday ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-200'
                            )}>
                                {/* Row 1: date + add post */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className={cn('text-sm font-medium truncate', isToday ? 'text-amber-600' : 'text-zinc-500')}>
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className={cn('text-base font-semibold truncate', isToday ? 'text-amber-800' : 'text-zinc-900')}>
                                            {format(day, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openCreateDialog(defaultCreateDate)}
                                        title="Add post"
                                        className={cn(
                                            'h-9 w-9 rounded-xl flex items-center justify-center transition-colors shrink-0',
                                            isToday ? 'bg-amber-300 hover:bg-amber-400 text-zinc-900' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                                        )}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="flex flex-col gap-2 p-3">
                                {dayEvents.length === 0 ? (
                                    <button
                                        onClick={() => openCreateDialog(defaultCreateDate)}
                                        className="w-full min-h-[140px] rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center text-center p-4 hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
                                    >
                                        <Megaphone className="h-8 w-8 text-zinc-300 mb-2" />
                                        <div className="text-sm font-bold text-zinc-400">No posts</div>
                                    </button>
                                ) : (
                                    dayEvents.map((event) => {
                                        const when = parseISO(event.scheduled_at);
                                        const account = resolveAccount(event.account_id);
                                        const media = event.media_url?.split(',')[0]?.trim();
                                        const platformKey = (account?.platform || event.platform || '').toLowerCase();
                                        const whenLabel = format(when, 'h:mm a');

                                        return (
                                            <button
                                                key={event.id}
                                                onClick={() => openEditDialog(event)}
                                                className={cn(
                                                    'relative w-full text-left rounded-2xl border-2 bg-white shadow-sm transition-all hover:shadow-md hover:border-amber-300 overflow-hidden',
                                                    event.status === 'cancelled' ? 'opacity-50 border-zinc-200' : 'border-zinc-200'
                                                )}
                                            >
                                                <EventApprovalBadge
                                                    event={event}
                                                    compact
                                                    className="absolute right-2 top-2 z-20 shadow-sm"
                                                />
                                                <PlatformPreviewCard
                                                    platformKey={platformKey}
                                                    whenLabel={whenLabel}
                                                    accountName={account?.profile_name || undefined}
                                                    accountImage={account?.profile_image}
                                                    title={event.title}
                                                    description={event.description}
                                                    media={media}
                                                    onUpload={() => openEditDialog(event)}
                                                />
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
