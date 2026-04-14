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
            <div className="grid grid-cols-7 gap-2 items-start">
                {days.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const key = format(day, 'yyyy-MM-dd');
                    const dayEvents = (eventsByDay.get(key) || []).filter((e) => (e.type || '').toLowerCase() !== 'note');
                    const defaultCreateDate = new Date(day);
                    defaultCreateDate.setHours(9, 0, 0, 0);

                    const festivals = dayEvents.filter(e => e.type === 'festival');
                    const isFestival = festivals.length > 0;
                    return (
                        <div
                            key={key}
                            className={cn(
                                'rounded-2xl border-2 overflow-hidden flex flex-col',
                                isFestival
                                    ? 'border-amber-200 shadow-sm bg-gradient-to-b from-amber-50/60 to-orange-50/30'
                                    : isToday
                                        ? 'border-amber-300 shadow-md bg-white'
                                        : 'border-zinc-200 shadow-sm bg-white'
                            )}
                        >
                            {/* Column header */}
                            <div className={cn(
                                'px-3 pt-3 pb-2 border-b flex flex-col gap-2',
                                isFestival
                                    ? 'bg-amber-50 border-amber-200'
                                    : isToday
                                        ? 'bg-amber-50 border-amber-200'
                                        : 'bg-zinc-50 border-zinc-200'
                            )}>
                                {/* Row 1: date + add post */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className={cn('text-sm font-medium truncate',
                                            isFestival ? 'text-amber-600' : isToday ? 'text-amber-600' : 'text-zinc-500'
                                        )}>
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className={cn('text-base font-semibold truncate',
                                            isFestival ? 'text-amber-800 font-bold' : isToday ? 'text-amber-800' : 'text-zinc-900'
                                        )}>
                                            {format(day, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openCreateDialog(defaultCreateDate)}
                                        title="Add post"
                                        className={cn(
                                            'h-9 w-9 rounded-xl flex items-center justify-center transition-colors shrink-0',
                                            isFestival ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : isToday ? 'bg-amber-300 hover:bg-amber-400 text-zinc-900' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                                        )}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Festivals Banner for the day */}
                            {festivals.map(fest => (
                                <div key={fest.id} className="mx-3 mt-3 px-3 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-200 text-center leading-tight">
                                    🪔 {fest.title}
                                    {fest.description && <span className="font-normal opacity-70 ml-1 text-[10px] truncate hidden sm:inline">— {fest.description}</span>}
                                </div>
                            ))}

                            {/* Cards */}
                            <div className="flex flex-col gap-2 p-3">
                                {dayEvents.filter(e => e.type !== 'festival').length === 0 ? (
                                    <button
                                        onClick={() => openCreateDialog(defaultCreateDate)}
                                        className={cn(
                                            "w-full min-h-[140px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-colors",
                                            isFestival
                                                ? "border-orange-200 bg-orange-50/50 hover:border-orange-300 hover:bg-orange-100/40"
                                                : "border-zinc-200 bg-zinc-50 hover:border-amber-300 hover:bg-amber-50/40"
                                        )}
                                    >
                                        <Megaphone className={cn("h-8 w-8 mb-2", isFestival ? "text-orange-300" : "text-zinc-300")} />
                                        <div className={cn("text-sm font-bold", isFestival ? "text-orange-400" : "text-zinc-400")}>
                                            {isFestival ? "Plan a campaign!" : "No posts"}
                                        </div>
                                    </button>
                                ) : (
                                    dayEvents.filter(e => e.type !== 'festival').map((event) => {
                                        const when = parseISO(event.scheduled_at);
                                        const account = resolveAccount(event.account_id);
                                        const media = event.media_url?.split(',')[0]?.trim();
                                        const platformKey = (account?.platform || event.platform || '').toLowerCase();
                                        const whenLabel = format(when, 'h:mm a');
                                        const isCrm = event.type === 'crm_birthday' || event.type === 'crm_loyalty';

                                        return (
                                            <button
                                                key={event.id}
                                                onClick={() => openEditDialog(event)}
                                                className={cn(
                                                    'relative w-full text-left rounded-2xl border-2 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden',
                                                    isCrm
                                                        ? 'border-rose-200 ring-1 ring-rose-100 hover:border-rose-300'
                                                        : isFestival
                                                          ? 'border-orange-200 hover:border-orange-400'
                                                          : event.status === 'cancelled'
                                                            ? 'opacity-50 border-zinc-200'
                                                            : 'border-zinc-200 hover:border-amber-300'
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
                                                    isRecurring={!!event.is_recurring}
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
