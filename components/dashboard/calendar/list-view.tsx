'use client';

import { useEffect, useMemo, useRef } from 'react';
import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { AlertTriangle, CheckCircle2, Copy, Layers, PenSquare, Pencil, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCalendar } from './calendar-context';
import { EventApprovalBadge } from './event-approval-badge';
import { MediaThumb, PlatformChip, StatusPill, firstMedia, isFestival, isNote, resolvePlatform, statusOf } from './calendar-ui';

export function ListView() {
    const { currentDate, events, setCurrentDate, openCreateDialog, openEditDialog, handleMarkComplete, socialConnections } = useCalendar();
    const stripRef = useRef<HTMLDivElement>(null);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = useMemo(() => Array.from({ length: 21 }).map((_, i) => addDays(weekStart, i)), [weekStart.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Keep the selected day visible in the date strip.
    useEffect(() => {
        stripRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }, [currentDate]);

    const dayEvents = eventsByDay.get(format(currentDate, 'yyyy-MM-dd')) || [];
    const festivals = dayEvents.filter(isFestival);
    const posts = dayEvents.filter((e) => !isFestival(e));
    const createAt = new Date(currentDate);
    createAt.setHours(9, 0, 0, 0);

    const copyCaption = async (title: string, description: string | null) => {
        try {
            await navigator.clipboard.writeText([title, description].filter(Boolean).join('\n\n'));
            toast.success('Caption copied');
        } catch {
            toast.error('Could not copy caption');
        }
    };

    return (
        <div className="w-full text-zinc-900">
            {/* Date strip */}
            <div ref={stripRef} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
                {days.map((day, i) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const selected = isSameDay(day, currentDate);
                    const today = isSameDay(day, new Date());
                    const count = (eventsByDay.get(key) || []).filter((e) => !isFestival(e)).length;
                    const hasFestival = (eventsByDay.get(key) || []).some(isFestival);
                    return (
                        <button
                            key={key}
                            data-selected={selected}
                            onClick={() => setCurrentDate(day)}
                            className={cn(
                                'flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-2xl py-2 transition-all',
                                i > 0 && i % 7 === 0 && 'ml-3',
                                selected
                                    ? 'bg-brand-800 text-white shadow-md shadow-brand-900/25'
                                    : today
                                        ? 'bg-gold-50 text-zinc-900 ring-2 ring-gold-400'
                                        : 'bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200/70 hover:bg-white hover:ring-brand-200'
                            )}
                        >
                            <span className={cn('text-[10px] font-bold uppercase tracking-wider', selected ? 'text-gold-300' : 'text-zinc-400')}>
                                {format(day, 'EEE')}
                            </span>
                            <span className="font-display text-xl font-semibold leading-none">{format(day, 'd')}</span>
                            <span className="flex h-2 items-center gap-0.5">
                                {hasFestival && <span className="text-[8px] leading-none">🪔</span>}
                                {Array.from({ length: Math.min(count, 3) }).map((_, d) => (
                                    <span key={d} className={cn('h-1 w-1 rounded-full', selected ? 'bg-gold-300' : 'bg-brand-500')} />
                                ))}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Day header */}
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                    <p className="ae-section-label">{isSameDay(currentDate, new Date()) ? 'Today' : format(currentDate, 'EEEE')}</p>
                    <h3 className="font-display text-2xl font-semibold text-zinc-900">{format(currentDate, 'MMMM d, yyyy')}</h3>
                    <p className="mt-0.5 text-sm text-zinc-500">
                        {posts.length === 0 ? 'Nothing scheduled yet' : `${posts.length} post${posts.length > 1 ? 's' : ''} · ${posts.filter((e) => statusOf(e) === 'published').length} published`}
                    </p>
                </div>
                <button
                    onClick={() => openCreateDialog(createAt)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gold-400 px-4 text-sm font-bold text-brand-950 shadow-sm transition-colors hover:bg-gold-300"
                >
                    <PenSquare className="h-4 w-4" />
                    Schedule post
                </button>
            </div>

            {/* Festivals */}
            {festivals.map((fest) => (
                <div key={fest.id} className="ae-hero ae-contour ae-contour-dark relative mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
                    <div className="relative flex items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl">🪔</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300">Festival</p>
                            <p className="text-lg font-extrabold text-white">{fest.title}</p>
                            {fest.description && <p className="text-sm text-white/65">{fest.description}</p>}
                        </div>
                    </div>
                    <button
                        onClick={() => openCreateDialog(createAt)}
                        className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gold-400 px-4 text-sm font-bold text-brand-950 transition-colors hover:bg-gold-300"
                    >
                        Plan festival campaign
                    </button>
                </div>
            ))}

            {/* Timeline */}
            {posts.length === 0 ? (
                <button
                    onClick={() => openCreateDialog(createAt)}
                    className="mt-5 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/60 py-16 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-brand-950 shadow-md">
                        <Plus className="h-6 w-6" strokeWidth={2.5} />
                    </span>
                    <span className="mt-3 font-display text-lg font-semibold text-zinc-900">Nothing planned for this day</span>
                    <span className="text-sm text-zinc-500">Click to schedule a post</span>
                </button>
            ) : (
                <div className="relative mt-5 space-y-4">
                    {posts.map((event) => {
                        const when = parseISO(event.scheduled_at);
                        const { meta, account } = resolvePlatform(event, socialConnections);
                        const media = firstMedia(event);
                        const published = statusOf(event) === 'published';

                        return (
                            <div key={event.id} className="flex gap-3">
                                {/* Time rail */}
                                <div className="relative w-18 shrink-0 pr-4 pt-3 text-right sm:w-21">
                                    <p className="text-sm font-extrabold tabular-nums text-zinc-900">{format(when, 'h:mm')}</p>
                                    <p className="text-[10px] font-bold uppercase text-zinc-400">{format(when, 'a')}</p>
                                    <span className="absolute -right-3 top-4 z-10 h-3 w-3 rounded-full ring-4 ring-white" style={{ background: meta.accent }} />
                                </div>

                                {/* Card */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openEditDialog(event)}
                                    onKeyDown={(e) => e.key === 'Enter' && openEditDialog(event)}
                                    className={cn(
                                        'group relative min-w-0 flex-1 cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition-all hover:border-brand-200 hover:shadow-[0_14px_30px_-18px_rgba(17,58,43,0.4)]',
                                        statusOf(event) === 'cancelled' && 'opacity-60'
                                    )}
                                >
                                    <div className="flex gap-4 p-4">
                                        {media ? (
                                            <MediaThumb src={media} className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28" />
                                        ) : (
                                            <span className="hidden sm:block">
                                                <PlatformChip meta={meta} size="lg" />
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <PlatformChip meta={meta} size="sm" />
                                                <span className="text-xs font-bold text-zinc-700">{meta.label}</span>
                                                {account?.profile_name && <span className="truncate text-xs text-zinc-400">@{account.profile_name}</span>}
                                                <StatusPill event={event} className="ml-auto" />
                                            </div>
                                            <p className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-snug text-zinc-900">{event.title || 'Untitled post'}</p>
                                            {event.description && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-zinc-500">{event.description}</p>}
                                            {statusOf(event) === 'failed' && event.error_message && (
                                                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium leading-relaxed text-red-700 ring-1 ring-red-100">
                                                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                    {event.error_message}
                                                </p>
                                            )}
                                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                                <EventApprovalBadge event={event} />
                                                {event.is_recurring && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-bold text-gold-800 ring-1 ring-gold-200">
                                                        <RefreshCw className="h-3 w-3" /> Recurring
                                                    </span>
                                                )}
                                                {event.series?.series_name && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                                                        <Layers className="h-3 w-3" /> {event.series.series_name}
                                                    </span>
                                                )}
                                                {event.labels?.map((l) => (
                                                    <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                                                        {l.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div
                                        className="flex items-center gap-1 border-t border-zinc-100 bg-zinc-50/60 px-3 py-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button onClick={() => openEditDialog(event)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-white hover:text-brand-800">
                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                        </button>
                                        <button onClick={() => copyCaption(event.title, event.description)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-white hover:text-brand-800">
                                            <Copy className="h-3.5 w-3.5" /> Copy caption
                                        </button>
                                        {!published && statusOf(event) !== 'cancelled' && (
                                            <button onClick={() => handleMarkComplete(event)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* vertical rail line */}
                    <span aria-hidden className="pointer-events-none absolute bottom-2 left-[78px] top-2 w-px bg-zinc-200 sm:left-[90px]" />
                </div>
            )}
        </div>
    );
}
