'use client';

import { CalendarProvider, useCalendar } from '@/components/dashboard/calendar/calendar-context';
import { ListView } from '@/components/dashboard/calendar/list-view';
import { WeekView } from '@/components/dashboard/calendar/week-view';
import { MonthView } from '@/components/dashboard/calendar/month-view';
import { CalendarModal } from '@/components/dashboard/calendar/calendar-modal';
import { ChannelStrip } from '@/components/dashboard/calendar/channel-strip';
import { AppSelect } from '@/components/ui/app-select';
import { PageHero, heroButtonClass } from '@/components/dashboard/page-hero';
import { Plus, Loader2, ChevronLeft, ChevronRight, CalendarDays, Columns3, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, addMonths, addWeeks, endOfWeek, format, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';

function CalendarContent() {
    const { isLoading, displayMode, setDisplayMode, openCreateDialog, currentDate, setCurrentDate, labels, activeLabelId, setActiveLabelId } = useCalendar();

    const title = (() => {
        if (displayMode === 'list') {
            const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
            const end = addDays(ws, 20);
            return `${format(ws, 'M/d/yyyy')} – ${format(end, 'M/d/yyyy')}`;
        }
        if (displayMode === 'month') return format(currentDate, 'MMMM yyyy');
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        const sameMonth = format(weekStart, 'MMM yyyy') === format(weekEnd, 'MMM yyyy');
        return sameMonth
            ? `Week of ${format(weekStart, 'MMM d')} – ${format(weekEnd, 'd, yyyy')}`
            : `Week of ${format(weekStart, 'MMM d, yyyy')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    })();

    const goToday = () => setCurrentDate(new Date());

    const goPrev = () => {
        if (displayMode === 'list') return setCurrentDate(subDays(currentDate, 21));
        if (displayMode === 'month') return setCurrentDate(subMonths(currentDate, 1));
        return setCurrentDate(subWeeks(currentDate, 1));
    };

    const goNext = () => {
        if (displayMode === 'list') return setCurrentDate(addDays(currentDate, 21));
        if (displayMode === 'month') return setCurrentDate(addMonths(currentDate, 1));
        return setCurrentDate(addWeeks(currentDate, 1));
    };

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-[1400px]">
                <PageHero title="Postings Calendar" breadcrumb={['Postings Calendar']} icon={CalendarDays} description="Plan, schedule and approve every post across your platforms." />
                <div className="ae-tile flex h-[50vh] flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                    <p className="font-medium text-zinc-500">Loading your calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1400px]">
            <PageHero
                title="Postings Calendar"
                breadcrumb={['Postings Calendar']}
                icon={CalendarDays}
                description="Plan, schedule and approve every post across your platforms."
                actions={
                    <button id="calendar-add-btn" type="button" onClick={() => openCreateDialog()} className={heroButtonClass('gold')}>
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        Add new post
                    </button>
                }
                overlap={
                    <div className="space-y-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        {/* Period navigation */}
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                                <button
                                    id="calendar-nav"
                                    onClick={goPrev}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white hover:text-brand-800"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={goToday}
                                    className="h-9 rounded-lg px-3 text-sm font-bold text-brand-800 transition-colors hover:bg-white"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={goNext}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white hover:text-brand-800"
                                    aria-label="Next"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="min-w-0">
                                <p className="ae-section-label">Showing</p>
                                <h2 id="calendar-title" className="truncate font-display text-lg font-semibold text-zinc-900 sm:text-xl">
                                    {title}
                                </h2>
                            </div>
                        </div>

                        {/* Filters + view switch */}
                        <div className="flex flex-wrap items-center gap-3">
                            <AppSelect
                                id="calendar-labels"
                                aria-label="Filter by label"
                                value={activeLabelId}
                                onChange={setActiveLabelId}
                                className="min-w-[170px] flex-1 font-semibold sm:w-auto sm:flex-none"
                                options={[
                                    { value: 'all', label: 'All labels' },
                                    ...labels.map((label) => ({
                                        value: label.id,
                                        label: (
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                                                {label.name}
                                            </span>
                                        ),
                                    })),
                                ]}
                            />
                            {/* Moneyview-style Earn/Redeem segmented toggle */}
                            <div id="calendar-view-switcher" className="flex rounded-full bg-brand-800 p-1">
                                {(['list', 'week', 'month'] as const).map((mode) => {
                                    const Icon = mode === 'list' ? List : mode === 'week' ? Columns3 : LayoutGrid;
                                    return (
                                        <button
                                            key={mode}
                                            onClick={() => setDisplayMode(mode)}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold capitalize transition-all',
                                                displayMode === mode ? 'bg-white text-brand-900 shadow-sm' : 'text-white/75 hover:text-white'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {mode}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <ChannelStrip />
                    </div>
                }
            />

            {/* Calendar View Area */}
            <div className="ae-tile overflow-x-auto p-3 sm:p-4">
                <div className={cn(displayMode !== 'list' && 'min-w-[860px]')}>
                    {displayMode === 'list' && <ListView />}
                    {displayMode === 'week' && <WeekView />}
                    {displayMode === 'month' && <MonthView />}
                </div>
            </div>

            <CalendarModal />
        </div>
    );
}

export default function CalendarPage() {
    return (
        <CalendarProvider>
            <CalendarContent />
        </CalendarProvider>
    );
}
