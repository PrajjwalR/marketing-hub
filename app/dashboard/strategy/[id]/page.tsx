'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Calendar, Bell, Sparkles, Ghost, AlertCircle } from 'lucide-react';
import { StrategyTableView } from '@/components/strategy/strategy-table-view';
import { StrategyBoardSkeleton } from '@/components/strategy/strategy-board-skeleton';
import { StrategyPostDetailSidebar } from '@/components/strategy/strategy-post-detail-sidebar';
import { EditStrategyPostModal } from '@/components/strategy/edit-strategy-post-modal';
import type { StrategyPost } from '@/components/strategy/edit-strategy-post-modal';
import { addDays, format, differenceInDays, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { INDIAN_HOLIDAYS_DATA } from '@/lib/indian-holidays';
import {
    StrategyHeader,
} from '@/components/strategy/strategy-playbook-sections';

function StatRingCard({ label, valueLabel, subtitle, accentColor }: any) {
    return (
        <div className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-200 px-5 py-4 shadow-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-zinc-50" style={{ color: accentColor }}>
                <Bell className="h-6 w-6" />
            </div>
            <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</div>
                <div className="text-xl font-black text-zinc-900">{valueLabel}</div>
                <div className="text-[11px] text-zinc-500 font-medium">{subtitle}</div>
            </div>
        </div>
    );
}

export default function StrategyBoardPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [strategy, setStrategy] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [crmEvents, setCrmEvents] = useState<any[]>([]);
    const [sidebarPost, setSidebarPost] = useState<StrategyPost | null>(null);
    const [editingPost, setEditingPost] = useState<StrategyPost | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const fromPrebuilt = searchParams.get('source') === 'prebuilt';
    const fallbackRoute = fromPrebuilt ? '/dashboard/prebuilt-strategy-prompts' : '/dashboard/strategy';

    const fetchStrategy = useCallback(async () => {
        try {
            const res = await fetch(`/api/strategy/${id}`);
            if (!res.ok) {
                if (res.status === 404) router.replace(fallbackRoute);
                return;
            }
            const data = await res.json();
            setStrategy(data);
            setName(data.name);

            // Fetch ALL CRM Automations (Relaxed Filter)
            const crmRes = await fetch('/api/crm/automations');
            if (crmRes.ok) {
                const crmData = await crmRes.json();
                // Filter for anything that isn't explicitly 'Disabled'
                setCrmEvents(crmData.filter((a: any) => 
                    a.status?.toLowerCase() !== 'disabled' && 
                    a.status?.toLowerCase() !== 'inactive'
                ));
            }
        } catch (error) {
            console.error("Fetch strategy fail", error);
            setStrategy(null);
        } finally {
            setIsLoading(false);
        }
    }, [id, router, fallbackRoute]);

    useEffect(() => {
        if (id) fetchStrategy();
    }, [id, fetchStrategy]);

    const handleNameBlur = async () => {
        if (!strategy || name === strategy.name) return;
        setIsSavingName(true);
        try {
            const res = await fetch(`/api/strategy/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() || strategy.name }),
            });
            if (res.ok) {
                setStrategy((s: any) => (s ? { ...s, name: name.trim() || s.name } : null));
            }
        } catch {
            setName(strategy.name);
        } finally {
            setIsSavingName(false);
        }
    };

    const allIntegratedPosts = useMemo(() => {
        if (!strategy) return [];
        const regularPosts = (strategy.posts || []).map((p: any) => ({ ...p, isCRM: false }));
        const crmPosts: any[] = [];
        
        const strategyStartDate = strategy.start_date ? new Date(strategy.start_date) : null;
        
        crmEvents.forEach(evt => {
            const allHolidays = [
                ...INDIAN_HOLIDAYS_DATA.national_holidays,
                ...INDIAN_HOLIDAYS_DATA.pan_india_festivals,
                ...Object.values(INDIAN_HOLIDAYS_DATA.regional_festivals).flat()
            ];
            
            // Try to match by event_name or title
            const match = allHolidays.find(h => 
                h.name === evt.event_name || 
                h.name === evt.title
            );

            if (match && match.date && strategyStartDate) {
                try {
                    const holidayDateStr = `${match.date} ${new Date().getFullYear()}`;
                    const holidayDate = parse(holidayDateStr, 'd MMMM yyyy', new Date());
                    const dayDiff = differenceInDays(holidayDate, strategyStartDate) + 1;

                    // If it matches exactly inside the strategy duration
                    if (dayDiff > 0 && dayDiff <= (strategy.duration_days || 30)) {
                        crmPosts.push({
                            id: `crm-${evt.id}`,
                            day: dayDiff,
                            idea: `[CRM SYNC] ${evt.title || evt.event_name}`,
                            goal: 'Campaign Sync',
                            platform: 'WhatsApp/Email',
                            status: 'ENABLED',
                            isCRM: true,
                            caption: evt.message || 'Automated CRM Event',
                            include_in_calendar: true
                        });
                    } else {
                        // FORCE SHOW: If it is outside the range, force it to Day 1 as a "Global Warning"
                        crmPosts.push({
                            id: `crm-${evt.id}-future`,
                            day: 1,
                            idea: `[FUTURE AUTOMATION] ${evt.title || evt.event_name}`,
                            goal: `Date: ${match.date}`,
                            platform: 'System Global',
                            status: 'UPCOMING',
                            isCRM: true,
                            caption: "This event falls outside your current strategy date range but is active.",
                            include_in_calendar: true
                        });
                    }
                } catch (e) {
                    console.error("Date parse fail", e);
                }
            } else {
                // FALLBACK: For birthdays or generic events, show on Day 1
                crmPosts.push({
                    id: `crm-${evt.id}-gen`,
                    day: 1,
                    idea: `[CRM ACTIVE] ${evt.title || evt.event_name}`,
                    goal: evt.trigger_type || 'Sync',
                    platform: 'CRM Channels',
                    status: 'ENABLED',
                    isCRM: true,
                    include_in_calendar: true
                });
            }
        });
        
        return [...regularPosts, ...crmPosts].sort((a, b) => a.day - b.day);
    }, [strategy, crmEvents]);

    if (isLoading) return <StrategyBoardSkeleton />;
    if (!strategy) return <div className="p-10 text-center">Strategy not found.</div>;

    return (
        <div className="min-h-screen bg-white text-zinc-900 pb-20">
            <StrategyHeader
                backHref={fallbackRoute}
                title={name}
                subtitle="Campaign Strategy Board"
                description="Your social content and automated CRM campaigns synchronized in one view."
                durationDays={strategy.duration_days}
                showPrebuiltBadge={fromPrebuilt}
                editable={!fromPrebuilt}
                isSavingName={isSavingName}
                onTitleChange={setName}
                onTitleBlur={handleNameBlur}
            />

            <div className="mt-8 px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <StatRingCard
                        label="CRM Campaigns"
                        valueLabel={crmEvents.length > 0 ? `${crmEvents.length} Active` : "Syncing..."}
                        subtitle="Automatic Holiday & Birthday Automations"
                        accentColor="#f2d412"
                    />
                    <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-5 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-amber-600" />
                         </div>
                         <p className="text-xs text-zinc-500 font-medium">Any event you enable in the CRM tab will automatically appear here as a locked campaign block.</p>
                    </div>
                </div>

                {crmEvents.length === 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <p className="text-sm text-orange-700 font-medium">
                            No enabled events found. Have you enabled any holidays in the &ldquo;Events&rdquo; tab?
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                    <StrategyTableView
                        posts={allIntegratedPosts}
                        startDate={strategy.start_date}
                        readonly={fromPrebuilt}
                        onRowClick={(post) => !post.isCRM && setSidebarPost(post)}
                        onEdit={(post) => { setEditingPost(post); setEditModalOpen(true); }}
                        onClone={() => {}}
                        onPostToPlatforms={() => {}}
                        onScheduleToCalendar={() => {}}
                        onContent={() => {}}
                        onDelete={() => {}}
                        onIncludeChange={() => {}}
                    />
                </div>
            </div>

            <StrategyPostDetailSidebar
                post={sidebarPost}
                open={!!sidebarPost}
                onClose={() => setSidebarPost(null)}
                startDate={strategy.start_date}
                onEdit={(post) => { setSidebarPost(null); setEditingPost(post); setEditModalOpen(true); }}
            />
            
            <EditStrategyPostModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                post={editingPost}
                strategyId={id}
                durationDays={strategy.duration_days}
                startDate={strategy.start_date}
                onSave={fetchStrategy}
            />
        </div>
    );
}
