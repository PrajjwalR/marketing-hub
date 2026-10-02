'use client';

import { useMemo } from 'react';
import { addDays, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendar } from './calendar-context';
import { FestivalTag, PastelPostCard, isFestival, isNote, statusOf } from './calendar-ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE = 2;

export function MonthView() {
    const { currentDate, setCurrentDate, setDisplayMode, events, openCreateDialog, openEditDialog, socialConnections } = useCalendar();

    const gridStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const days = useMemo(() => Array.from({ length: 42 }).map((_, i) => addDays(gridStart, i)), [gridStart.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

    const eventsByDay = useMemo(() => {
        const map = new Map<string, typeof events>();
        for (const e of events) {
            if (isNote(e)) continue;
            const key = format(parseISO(e.scheduled_at), 'yyyy-MM-dd');
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(e);
        }
        for (const arr of map.values()) arr.sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime());
        return map;
    }, [events]);

    const monthPosts = days
        .filter((d) => isSameMonth(d, currentDate))
        .flatMap((d) => (eventsByDay.get(format(d, 'yyyy-MM-dd')) || []).filter((e) => !isFestival(e)));
    const monthPublished = monthPosts.filter((e) => statusOf(e) === 'published').length;

    const openDay = (day: Date) => {
        setCurrentDate(day);
        setDisplayMode('list');
    };

    return (
        <div className="w-full text-zinc-900">
            <div className="mb-3 flex flex-wrap items-center gap-2 px-1 text-xs font-semibold">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">{monthPosts.length} posts in {format(currentDate, 'MMMM')}</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">{monthPublished} published</span>
                <span className="rounded-full bg-gold-50 px-2.5 py-1 text-gold-800">{monthPosts.length - monthPublished} upcoming</span>
            </div>

            {/* Weekday header pills */}
            <div className="grid grid-cols-7 gap-2.5">
                {WEEKDAYS.map((d) => (
                    <div key={d} className="rounded-xl bg-zinc-100 py-3 text-center text-sm font-medium text-zinc-700">
                        {d}
                    </div>
                ))}
            </div>

            {/* Separate rounded day cells */}
            <div className="mt-2.5 grid grid-cols-7 gap-2.5">
                {days.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const inMonth = isSameMonth(day, currentDate);
                    const today = isSameDay(day, new Date());
                    const dayEvents = eventsByDay.get(key) || [];
                    const festivals = dayEvents.filter(isFestival);
                    const posts = dayEvents.filter((e) => !isFestival(e));
                    const hidden = Math.max(0, posts.length - MAX_VISIBLE);
                    const createAt = new Date(day);
                    createAt.setHours(9, 0, 0, 0);

                    return (
                        <div
                            key={key}
                            onClick={() => openCreateDialog(createAt)}
                            className={cn(
                                'group/cell relative flex min-h-[150px] cursor-pointer flex-col gap-1.5 rounded-2xl border p-2.5 transition-colors',
                                inMonth ? 'border-zinc-200 bg-white hover:border-zinc-300' : 'border-zinc-100 bg-zinc-50/60',
                                today && 'border-brand-300 ring-2 ring-brand-100'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDay(day);
                                    }}
                                    title="Open day"
                                    className={cn(
                                        'flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 font-display text-xl font-semibold tabular-nums transition-colors',
                                        today ? 'bg-brand-800 text-white' : inMonth ? 'text-zinc-800 hover:bg-zinc-100' : 'text-zinc-300'
                                    )}
                                >
                                    {format(day, 'd')}
                                </button>
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 opacity-0 transition-opacity group-hover/cell:opacity-100" aria-hidden>
                                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                                </span>
                            </div>

                            {festivals.map((f) => (
                                <FestivalTag key={f.id} title={f.title} description={f.description} size="sm" />
                            ))}

                            {/* Posts sit toward the bottom of the cell, like the reference */}
                            <div className="mt-auto flex flex-col gap-1.5">
                                {posts.slice(0, MAX_VISIBLE).map((event) => (
                                    <PastelPostCard key={event.id} event={event} connections={socialConnections} onOpen={() => openEditDialog(event)} />
                                ))}
                                {hidden > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDay(day);
                                        }}
                                        className="w-fit rounded-md px-1.5 py-0.5 text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                                    >
                                        +{hidden} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
