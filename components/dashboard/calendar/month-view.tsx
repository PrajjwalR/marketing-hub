'use client';

import { useCalendar } from './calendar-context';
import { format, startOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { PlatformPreviewCard } from './platform-preview';
import { EventApprovalBadge } from './event-approval-badge';

export function MonthView() {
    const { currentDate, setCurrentDate, events, openCreateDialog, openEditDialog, socialConnections } = useCalendar();

    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start

    // Generate 42 days (6 weeks) for the calendar grid
    const calendarDays = Array.from({ length: 42 }).map((_, i) => addDays(startDate, i));

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        // Match Week view behavior: keep page header fixed by scrolling inside month grid.
        <div className="flex flex-col text-zinc-900 w-full">
            <div className="grid grid-cols-7 auto-rows-min gap-2 bg-zinc-50 p-2">
                    
                    {/* Days of Week Headers */}
                    {daysOfWeek.map(day => (
                        <div
                            key={day}
                            className="z-30 px-3 py-2 bg-white border-2 border-zinc-200 flex justify-center items-center flex-col h-14 rounded-xl sticky top-0 font-bold text-sm text-zinc-500 shadow-sm"
                        >
                            {day}
                        </div>
                    ))}

                    {/* Calendar Days */}
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());
                        
                        const dayEvents = events
                            .filter(e => (e.type || '').toLowerCase() !== 'note' && isSameDay(parseISO(e.scheduled_at), day))
                            .sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime());

                        const festivals = dayEvents.filter(e => e.type === 'festival');
                        const isFestival = festivals.length > 0;

                        return (
                            <div 
                                key={day.toString()}
                                onClick={() => {
                                    setCurrentDate(day);
                                    openCreateDialog(day);
                                }}
                                className={cn(
                                    "flex flex-col rounded-xl min-h-[120px] p-2 cursor-pointer group border-2 transition-all relative",
                                    isFestival
                                        ? "bg-gradient-to-br from-amber-50/80 to-orange-50/60 border-amber-200 hover:border-amber-300"
                                        : isCurrentMonth
                                            ? "bg-white border-transparent hover:border-amber-400"
                                            : "bg-zinc-100 opacity-60 border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "text-base font-medium pt-1 px-1",
                                    isFestival ? "text-amber-700 font-semibold" : isToday ? "text-amber-700 font-bold" : "text-zinc-500"
                                )}>
                                    {format(day, 'd')}
                                    {isFestival && <span className="ml-1 text-[10px] opacity-70">🪔</span>}
                                </div>
                                
                                {/* Month cards: show full platform preview; day cell grows to fit all cards */}
                                <div className="flex flex-col gap-2 mt-2 z-10 w-full relative">
                                    {festivals.map(fest => (
                                        <div key={fest.id} className="w-full text-center px-1.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold mb-0.5 truncate border border-amber-200" title={fest.description || fest.title}>
                                            🪔 {fest.title}
                                        </div>
                                    ))}
                                    {dayEvents.filter(e => e.type !== 'festival').map(event => {
                                        const when = parseISO(event.scheduled_at);
                                        const whenLabel = format(when, 'h:mm a');
                                        const media = event.media_url?.split(',')[0]?.trim();
                                        const account = event.account_id
                                            ? socialConnections.find((c) => c.id === event.account_id)
                                            : undefined;
                                        const platformKey = ((account?.platform || event.platform) || '').toLowerCase();

                                        return (
                                            <div
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); openEditDialog(event); }}
                                                className="relative w-full rounded-xl border-2 border-zinc-200 bg-white shadow-sm hover:border-amber-300 hover:shadow-md transition-all overflow-hidden"
                                            >
                                                <EventApprovalBadge
                                                    event={event}
                                                    compact
                                                    className="absolute right-1.5 top-1.5 z-20 shadow-sm"
                                                />
                                                <PlatformPreviewCard
                                                    platformKey={platformKey}
                                                    whenLabel={whenLabel}
                                                    accountName={account?.profile_name || undefined}
                                                    accountImage={account?.profile_image || null}
                                                    title={event.title}
                                                    description={event.description}
                                                    media={media}
                                                    density="compact"
                                                    onUpload={() => openEditDialog(event)}
                                                    mediaLayout="auto"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-xl z-20 pointer-events-none">
                                    <div className="h-12 w-12 rounded-xl bg-amber-400 text-zinc-900 flex items-center justify-center font-bold text-xl shadow-md">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
        </div>
    );
}
