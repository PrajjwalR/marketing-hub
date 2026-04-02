'use client';

import { useCalendar } from './calendar-context';
import { useAuth } from '@/lib/auth-context';
import { format, addDays, isSameDay, parseISO, startOfWeek, isFirstDayOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { List, PenSquare, Tag, Copy, Eye, Pencil, Instagram, Linkedin, Youtube, Facebook, Clock } from 'lucide-react';
import { EventApprovalBadge } from './event-approval-badge';
import { useMemo } from 'react';

const PLATFORM_CONFIG: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}> = {
    instagram: { icon: Instagram, label: 'Instagram' },
    linkedin:  { icon: Linkedin,  label: 'LinkedIn' },
    youtube:   { icon: Youtube,   label: 'YouTube' },
    facebook:  { icon: Facebook,  label: 'Facebook' },
    tiktok:    { icon: Instagram, label: 'TikTok' },
};

export function ListView() {
    const { currentDate, events, setCurrentDate, openCreateDialog, openEditDialog, socialConnections } = useCalendar();
    const { user } = useAuth();

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 21 }).map((_, i) => addDays(weekStart, i));

    const eventsByDay = useMemo(() => {
        const map = new Map<string, typeof events>();
        for (const d of days) {
            map.set(format(d, 'yyyy-MM-dd'), []);
        }
        for (const e of events) {
            const key = format(parseISO(e.scheduled_at), 'yyyy-MM-dd');
            const arr = map.get(key);
            if (arr) arr.push(e);
        }
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [events, currentDate]);

    const resolveAccount = (id: string | null) =>
        id ? socialConnections.find((c) => c.id === id) : undefined;

    const getInitials = (name: string) =>
        name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

    return (
        <div className="w-full text-zinc-900">
            {/* Post Volume — horizontal date timeline */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-zinc-500 mb-3">Post Volume</div>
                <div className="flex items-end overflow-x-auto pb-1">
                    {Array.from({ length: 3 }).map((_, weekIdx) => (
                        <div key={weekIdx} className={cn('flex items-end', weekIdx < 2 && 'mr-6')}>
                            {days.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => {
                                const key = format(day, 'yyyy-MM-dd');
                                const isSelected = isSameDay(day, currentDate);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setCurrentDate(day)}
                                        className="flex flex-col items-center min-w-[40px] group shrink-0"
                                    >
                                        <div
                                            className={cn(
                                                'w-5 h-1 rounded-full mb-1.5 transition-colors',
                                                isSelected ? 'bg-blue-500' : 'bg-zinc-300 group-hover:bg-zinc-400'
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                isSelected ? 'text-blue-600 font-semibold' : 'text-zinc-600'
                                            )}
                                        >
                                            {isFirstDayOfMonth(day) ? format(day, 'd MMM') : format(day, 'd')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected date in blue */}
            <div className="text-lg font-semibold text-blue-600 mb-5">
                {format(currentDate, 'EEE, MMM d, yyyy')}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-5">
                <button
                    onClick={() => openCreateDialog(currentDate)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-base transition-colors"
                >
                    <PenSquare className="h-5 w-5" />
                    Schedule Post
                </button>
            </div>

            {/* List of posts */}
            <div className="space-y-4">
                {(() => {
                    const key = format(currentDate, 'yyyy-MM-dd');
                    const dayEvents = (eventsByDay.get(key) || []).filter(
                        (e) => (e.type || '').toLowerCase() !== 'note'
                    );

                    if (dayEvents.length === 0) {
                        return (
                            <div
                                onClick={() => openCreateDialog(currentDate)}
                                className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 cursor-pointer hover:border-amber-300 hover:bg-amber-50/40 transition-colors w-full"
                            >
                                <p className="text-zinc-500 font-semibold text-base">No scheduled posts</p>
                                <p className="text-zinc-400 text-sm mt-2">Click to add a post</p>
                            </div>
                        );
                    }

                    return (
                        <>
                            {dayEvents.map((event) => {
                                if (event.type === 'festival') {
                                    return (
                                        <div key={event.id} className="w-full rounded-2xl border-2 border-orange-200 bg-[#fff7ed] shadow-sm flex flex-col sm:flex-row items-center sm:justify-between py-5 px-6 gap-4 group hover:border-[#ea580c] transition-colors relative overflow-hidden">
                                            <div className="absolute top-0 right-0 h-40 w-40 -mr-10 -mt-10 bg-orange-300/20 rounded-full blur-2xl pointer-events-none" />
                                            <div className="flex items-start gap-4 relative z-10 w-full sm:w-auto">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm border border-orange-200">
                                                    🪔
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-[#b45309] text-lg leading-tight">{event.title}</h4>
                                                    <p className="text-sm font-semibold text-orange-800/70 mt-0.5">{event.description}</p>
                                                </div>
                                            </div>
                                            <button className="whitespace-nowrap rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#c2410c] active:scale-95 sm:w-auto w-full relative z-10">
                                                Suggest Campaign
                                            </button>
                                        </div>
                                    );
                                }

                                const when = parseISO(event.scheduled_at);
                                const addedAt = event.created_at ? parseISO(event.created_at) : null;
                                const account = resolveAccount(event.account_id);
                                const platformKey = (account?.platform || event.platform || '').toLowerCase();
                                const cfg = PLATFORM_CONFIG[platformKey] || { icon: List, label: 'Post' };
                                const PlatformIcon = cfg.icon;
                                const media = event.media_url?.split(',')[0]?.trim();
                                const statusLabel = event.status === 'scheduled' ? 'Scheduled' : event.status === 'completed' ? 'Published' : event.status === 'cancelled' ? 'Cancelled' : 'Draft';
                                const addedByName = user?.displayName || user?.email?.split('@')[0] || 'You';

                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => openEditDialog(event)}
                                        className="rounded-2xl border-2 border-zinc-200 bg-white hover:border-zinc-300 transition-colors overflow-hidden cursor-pointer w-full"
                                    >
                                        {/* Card header — pale yellow */}
                                        <div className="flex items-start justify-between gap-4 px-6 py-4 bg-yellow-200 border-b-2 border-yellow-200">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-semibold text-base shrink-0">
                                                    {account?.profile_name ? getInitials(account.profile_name) : '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <PlatformIcon className="h-5 w-5 text-zinc-600 shrink-0" />
                                                        <span className="font-bold text-zinc-900 truncate text-base">
                                                            {account?.profile_name || event.title}
                                                        </span>
                                                        <EventApprovalBadge event={event} />
                                                    </div>
                                                    <div className="text-sm text-zinc-500 mt-1">
                                                        {cfg.label} {account?.platform ? '•' : ''} {statusLabel}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-zinc-500 shrink-0">
                                                {format(when, 'EEE, MMM d, yyyy h:mm a')}
                                            </div>
                                        </div>

                                        {/* Centered metadata — Added at */}
                                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 py-3 bg-zinc-50/80 border-b border-zinc-100 text-center">
                                            {addedAt && (
                                                <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
                                                    <Clock className="h-4 w-4" />
                                                    Added at {format(addedAt, 'h:mm a')} on {format(addedAt, 'MMM d, yyyy')}
                                                </span>
                                            )}
                                            {event.series?.series_name && (
                                                <span className="text-sm text-zinc-500">
                                                    Series: {event.series.series_name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div className="p-6">
                                            <div className="text-base text-zinc-800 whitespace-pre-wrap">
                                                {event.title}
                                            </div>
                                            {event.description && (
                                                <div className="text-base text-zinc-600 mt-2 whitespace-pre-wrap">{event.description}</div>
                                            )}
                                            {media && (
                                                <div className="mt-4 max-w-[360px] mx-auto">
                                                    <div className="rounded-xl overflow-hidden bg-zinc-100 aspect-square">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={media} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    {/* Byline under image (Sprout-style) */}
                                                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                                                        <div className="h-4 min-w-4 px-1 rounded-sm bg-emerald-600 text-white flex items-center justify-center font-semibold text-[10px] leading-none">
                                                            {getInitials(addedByName)}
                                                        </div>
                                                        <span className="truncate">by {addedByName}.</span>
                                                    </div>
                                                </div>
                                            )}
                                            {!media && (
                                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
                                                    <div className="h-4 min-w-4 px-1 rounded-sm bg-emerald-600 text-white flex items-center justify-center font-semibold text-[10px] leading-none">
                                                        {getInitials(addedByName)}
                                                    </div>
                                                    <span className="truncate">by {addedByName}.</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card footer — toolbar */}
                                        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-zinc-100" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => openEditDialog(event)}
                                                className="p-2.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </button>
                                            <button className="p-2.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors" title="View">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button className="p-2.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors" title="Copy">
                                                <Copy className="h-5 w-5" />
                                            </button>
                                            <button className="p-2.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors" title="Tag">
                                                <Tag className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    );
                })()}
            </div>
        </div>
    );
}
