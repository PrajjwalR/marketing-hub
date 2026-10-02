'use client';

import { useMemo } from 'react';
import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendar } from './calendar-context';
import { FestivalTag, PastelPostCard, isFestival, isNote, statusOf } from './calendar-ui';

export function WeekView() {
    const { currentDate, events, socialConnections, openCreateDialog, openEditDialog } = useCalendar();

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

    const eventsByDay = useMemo(() => {
        const map = new Map<string, typeof events>();
        for (const day of days) map.set(format(day, 'yyyy-MM-dd'), []);
        for (const e of events) {
            if (isNote(e)) continue;
            map.get(format(parseISO(e.scheduled_at), 'yyyy-MM-dd'))?.push(e);
        }
        for (const arr of map.values()) arr.sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime());
        return map;
    }, [events, days]);

    const weekPosts = days.flatMap((d) => (eventsByDay.get(format(d, 'yyyy-MM-dd')) || []).filter((e) => !isFestival(e)));
    const weekPublished = weekPosts.filter((e) => statusOf(e) === 'published').length;

    return (
        <div className="w-full text-zinc-900">
            <div className="mb-3 flex flex-wrap items-center gap-2 px-1 text-xs font-semibold">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">{weekPosts.length} posts this week</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">{weekPublished} published</span>
                <span className="rounded-full bg-gold-50 px-2.5 py-1 text-gold-800">{weekPosts.length - weekPublished} upcoming</span>
            </div>

            {/* Weekday header pills */}
            <div className="grid grid-cols-7 gap-2.5">
                {days.map((day) => {
                    const today = isSameDay(day, new Date());
                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                'rounded-xl py-2.5 text-center',
                                today ? 'bg-brand-800 text-white' : 'bg-zinc-100 text-zinc-700'
                            )}
                        >
                            <div className={cn('text-xs font-semibold', today ? 'text-gold-300' : 'text-zinc-500')}>{today ? 'Today' : format(day, 'EEE')}</div>
                            <div className="font-display text-xl font-semibold leading-tight">{format(day, 'd MMM')}</div>
                        </div>
                    );
                })}
            </div>

            {/* Day cells */}
            <div className="mt-2.5 grid grid-cols-7 gap-2.5">
                {days.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const today = isSameDay(day, new Date());
                    const dayEvents = eventsByDay.get(key) || [];
                    const festivals = dayEvents.filter(isFestival);
                    const posts = dayEvents.filter((e) => !isFestival(e));
                    const createAt = new Date(day);
                    createAt.setHours(9, 0, 0, 0);

                    return (
                        <div
                            key={key}
                            className={cn(
                                'group/day flex min-h-[460px] flex-col gap-2 rounded-2xl border bg-white p-2.5',
                                today ? 'border-brand-300 ring-2 ring-brand-100' : 'border-zinc-200'
                            )}
                        >
                            {festivals.map((f) => (
                                <FestivalTag key={f.id} title={f.title} description={f.description} />
                            ))}

                            {posts.map((event) => (
                                <PastelPostCard key={event.id} event={event} connections={socialConnections} onOpen={() => openEditDialog(event)} detailed />
                            ))}

                            <button
                                onClick={() => openCreateDialog(createAt)}
                                className={cn(
                                    'flex items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700',
                                    posts.length === 0 ? 'flex-1 flex-col' : 'py-2 opacity-0 group-hover/day:opacity-100'
                                )}
                            >
                                <Plus className={posts.length === 0 ? 'h-5 w-5' : 'h-3.5 w-3.5'} />
                                {posts.length === 0 ? (festivals.length ? 'Plan a campaign' : 'Add post') : 'Add another'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
