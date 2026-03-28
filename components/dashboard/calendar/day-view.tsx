'use client';

import { useCalendar } from './calendar-context';
import { format, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Fragment } from 'react';
import { EventApprovalBadge } from './event-approval-badge';

const convertTimeFormatBasedOnLocality = (time: number) => {
    return `${time === 12 ? 12 : time % 12}:00 ${time >= 12 ? 'PM' : 'AM'}`;
};

export function DayView() {
    const { currentDate, events, openCreateDialog, openEditDialog } = useCalendar();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const isToday = isSameDay(currentDate, new Date());

    return (
        <div className="flex flex-col text-zinc-900 flex-1 h-[600px] overflow-hidden">
            <div className="flex-1 relative">
                <div className="grid grid-cols-[136px_1fr] gap-[6px] absolute h-full start-0 top-0 w-full overflow-auto scrollbar scrollbar-thumb-zinc-200 scrollbar-track-zinc-50 bg-zinc-50 p-[6px]">
                    
                    {/* Top-Left Empty Header Cell */}
                    <div className="z-10 bg-white border border-zinc-200 flex justify-center items-center flex-col h-[62px] rounded-[10px] sticky top-0"></div>
                    
                    {/* Day Header */}
                    <div className="p-2 text-center bg-white border border-zinc-200 flex justify-center items-center flex-col h-[62px] rounded-[10px] sticky top-0 z-20">
                        <div className="text-[14px] font-bold text-zinc-500">
                            {format(currentDate, 'EEEE')}
                        </div>
                        <div className={cn(
                            "text-[14px] font-semibold flex items-center justify-center gap-[6px]",
                            isToday ? "text-amber-700" : "text-zinc-900"
                        )}>
                            {isToday && <div className="w-[6px] h-[6px] bg-amber-400 rounded-full" />}
                            {format(currentDate, 'MM/dd/yyyy')}
                        </div>
                    </div>

                    {/* Hour Rows */}
                    {hours.map(hour => {
                        const cellDate = new Date(currentDate);
                        cellDate.setHours(hour, 0, 0, 0);
                        const isPast = cellDate < new Date();
                        
                        const cellEvents = events.filter(e => {
                            if ((e.type || '').toLowerCase() === 'note') return false;
                            const eventDate = parseISO(e.scheduled_at);
                            return isSameDay(eventDate, currentDate) && eventDate.getHours() === hour;
                        });

                        return (
                            <Fragment key={hour}>
                                {/* Time Label */}
                                <div className="p-2 pe-4 text-center items-center justify-center flex text-[14px] font-medium text-zinc-500">
                                    {convertTimeFormatBasedOnLocality(hour)}
                                </div>

                                {/* Hour Cell */}
                                <div 
                                    onClick={() => openCreateDialog(cellDate)}
                                    className={cn(
                                        "relative flex flex-col min-h-[84px] rounded-[10px] border border-zinc-200 transition-colors cursor-pointer group bg-white",
                                        isPast ? "opacity-60 cursor-not-allowed" : "hover:border-amber-400 hover:bg-amber-50/40",
                                    )}
                                    style={isPast ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)' } : {}}
                                >
                                    <div className="flex-1 w-full p-[10px] flex flex-col gap-2 z-10">
                                        {cellEvents.map(event => (
                                            <div 
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); openEditDialog(event); }}
                                                className="bg-white text-zinc-900 text-[13px] p-3 rounded-xl border border-zinc-200 shadow-sm hover:border-amber-300 hover:bg-amber-50 transition-colors flex items-center justify-between gap-2"
                                            >
                                                <div className="font-black truncate min-w-0">{event.title}</div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <EventApprovalBadge event={event} compact />
                                                    <div className="text-[10px] text-zinc-600 uppercase bg-zinc-100 px-2 py-0.5 rounded-full font-bold">{event.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {!isPast && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-[10px] z-0">
                                            <div className="h-10 w-10 rounded-xl bg-amber-400 text-zinc-900 flex items-center justify-center font-bold text-lg shadow-lg border border-amber-200">
                                                <Plus className="h-6 w-6" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
