'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { StrategyTableView } from '@/components/strategy/strategy-table-view';
import { StrategyBoardSkeleton } from '@/components/strategy/strategy-board-skeleton';
import { StrategyPostDetailSidebar } from '@/components/strategy/strategy-post-detail-sidebar';
import { StrategyPostContentModal } from '@/components/strategy/strategy-post-content-modal';
import { EditStrategyPostModal } from '@/components/strategy/edit-strategy-post-modal';
import { PostToPlatformsModal } from '@/components/strategy/post-to-platforms-modal';
import { ScheduleToCalendarModal } from '@/components/strategy/schedule-to-calendar-modal';
import type { StrategyPost } from '@/components/strategy/edit-strategy-post-modal';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    ExecutionGuide,
    StrategyDayCard,
    StrategyHeader,
    StrategyOverview,
    StrategyPhases,
    StrategyTips,
    type PlaybookDay,
    type PlaybookPhase,
} from '@/components/strategy/strategy-playbook-sections';

function StatRingCard({
    label,
    valueLabel,
    subtitle,
    progress,
    accentColor,
}: {
    label: string;
    valueLabel: string;
    subtitle: string;
    progress: number;
    accentColor: string;
}) {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const safeProgress = Math.min(Math.max(progress, 0), 1);
    const offset = circumference * (1 - safeProgress);

    return (
        <div className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-200 px-4 py-3.5 shadow-sm">
            <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className="stroke-zinc-200"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke={accentColor}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-zinc-600">
                        {Math.round(safeProgress * 100)}%
                    </span>
                </div>
            </div>
            <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                    {label}
                </div>
                <div className="text-[19px] font-semibold text-zinc-900 leading-tight">
                    {valueLabel}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{subtitle}</div>
            </div>
        </div>
    );
}

interface Strategy {
    id: string;
    name: string;
    theme?: string | null;
    duration_days: number;
    start_date?: string | null;
    posts: StrategyPost[];
}

export default function StrategyBoardPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [strategy, setStrategy] = useState<Strategy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<StrategyPost | null>(null);
    const [addDay, setAddDay] = useState<number | null>(null);
    const [cloneFrom, setCloneFrom] = useState<StrategyPost | null>(null);
    const [postToPlatformsOpen, setPostToPlatformsOpen] = useState(false);
    const [postForPlatforms, setPostForPlatforms] = useState<StrategyPost | null>(null);
    const [postForSchedule, setPostForSchedule] = useState<StrategyPost | null>(null);
    const [sidebarPost, setSidebarPost] = useState<StrategyPost | null>(null);
    const [contentPost, setContentPost] = useState<StrategyPost | null>(null);
    const [crmEvents, setCrmEvents] = useState<any[]>([]);

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

            const crmRes = await fetch('/api/crm/automations');
            if (crmRes.ok) {
                const crmData = await crmRes.json();
                setCrmEvents(crmData.filter((a: any) => a.status === 'Active'));
            }
        } catch {
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
                setStrategy((s) => (s ? { ...s, name: name.trim() || s.name } : null));
            }
        } catch {
            setName(strategy.name);
        } finally {
            setIsSavingName(false);
        }
    };

    const posts = useMemo(() => strategy?.posts ?? [], [strategy?.posts]);
    const duration = strategy?.duration_days ?? 30;
    const isPrebuilt = !!strategy?.theme && typeof strategy.theme === 'string' && strategy.theme.startsWith('prebuilt_');

    const baseDate = useMemo(
        () => (strategy?.start_date ? new Date(strategy.start_date) : null),
        [strategy?.start_date]
    );

    const allIntegratedPosts = useMemo(() => {
        const regularPosts = posts.map(p => ({ ...p, isCRM: false }));
        const crmPosts: any[] = [];
        crmEvents.forEach(evt => {
            crmPosts.push({
                id: `crm-${evt.id}`,
                day: 1, 
                idea: `[CRM] ${evt.title}`,
                goal: 'Holiday Marketing',
                category: evt.category,
                platform: 'CRM Channels',
                status: 'enabled',
                isCRM: true,
                description: evt.message,
                include_in_calendar: true
            });
        });
        return [...regularPosts, ...crmPosts];
    }, [posts, crmEvents]);

    if (isLoading) return <StrategyBoardSkeleton />;
    if (!strategy) return <div className="p-10 text-center">Strategy not found.</div>;

    return (
        <div className="min-h-screen bg-white text-zinc-900 pb-20">
            <StrategyHeader
                backHref={fallbackRoute}
                title={name}
                durationDays={duration}
                editable={!isPrebuilt}
                isSavingName={isSavingName}
                onTitleChange={setName}
                onTitleBlur={handleNameBlur}
                subtitle="Campaign Strategy Board"
                description="Manage your automated library and social content."
            />

            <div className="mt-6 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatRingCard
                        label="CRM Campaigns Sync"
                        valueLabel={`${crmEvents.length} Active`}
                        subtitle="Automatic Holiday & Birthday Sync"
                        progress={crmEvents.length > 0 ? 1 : 0}
                        accentColor="#f2d412"
                    />
                    <div className="rounded-2xl bg-zinc-50/50 border border-zinc-200 p-5 flex flex-col justify-center">
                        <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1">CRM Status</div>
                        <div className="text-xl font-bold text-zinc-900">Synchronized</div>
                    </div>
                </div>

                <StrategyTableView
                    posts={allIntegratedPosts}
                    startDate={strategy.start_date}
                    readonly={isPrebuilt}
                    onRowClick={(post) => !post.isCRM && setSidebarPost(post)}
                    onEdit={(post) => { setEditingPost(post); setEditModalOpen(true); }}
                    onClone={(post) => { setCloneFrom(post); setEditModalOpen(true); }}
                    onPostToPlatforms={(post) => { setPostForPlatforms(post); setPostToPlatformsOpen(true); }}
                    onContent={(post) => setContentPost(post)}
                    onDelete={() => {}}
                    onIncludeChange={() => {}}
                />
            </div>

            <StrategyPostDetailSidebar
                post={sidebarPost}
                open={!!sidebarPost}
                onClose={() => setSidebarPost(null)}
                startDate={strategy.start_date ?? null}
                onEdit={(post) => { setSidebarPost(null); setEditingPost(post); setEditModalOpen(true); }}
            />

            <EditStrategyPostModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                post={editingPost}
                strategyId={id}
                durationDays={duration}
                startDate={strategy.start_date}
                onSave={fetchStrategy}
                cloneFrom={cloneFrom}
            />
        </div>
    );
}
