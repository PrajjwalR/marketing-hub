'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { StrategyTableView } from '@/components/strategy/strategy-table-view';
import { StrategyBoardSkeleton } from '@/components/strategy/strategy-board-skeleton';
import { StrategyPostDetailSidebar } from '@/components/strategy/strategy-post-detail-sidebar';
import type { StrategyPost } from '@/components/strategy/edit-strategy-post-modal';
import {
    StrategyHeader,
    StrategyPhases,
} from '@/components/strategy/strategy-playbook-sections';

function toGrowthStyleTitle(rawTitle: string, day: number) {
    const title = String(rawTitle || '').trim();
    if (!title) return `Growth plan for Day ${day}`;

    const normalized = title.toLowerCase();
    if (
        normalized.includes('how to') ||
        normalized.includes('ways') ||
        normalized.includes('hacks') ||
        normalized.includes('mistakes') ||
        normalized.includes('strategy')
    ) {
        return title;
    }

    const shortTitle = title.length > 56 ? `${title.slice(0, 56).trim()}...` : title;
    const patterns = [
        `3 ways to ${shortTitle.toLowerCase()}`,
        `10 hacks to improve ${shortTitle.toLowerCase()}`,
        `How to grow using ${shortTitle.toLowerCase()}`,
        `${shortTitle}: mistakes to avoid`,
        `${shortTitle}: the practical growth strategy`,
    ];

    return patterns[(day - 1) % patterns.length];
}

export default function PrebuiltStrategyBoardPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [strategy, setStrategy] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [sidebarPost, setSidebarPost] = useState<StrategyPost | null>(null);

    const fetchStrategy = useCallback(async () => {
        try {
            const res = await fetch(`/api/strategy/${id}`);
            if (!res.ok) {
                if (res.status === 404) router.replace('/dashboard/prebuilt-strategy-prompts');
                return;
            }
            const data = await res.json();
            setStrategy(data);
            setName(data.name);
        } catch (error) {
            console.error("Fetch strategy fail", error);
            setStrategy(null);
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchStrategy();
    }, [id, fetchStrategy]);

    const allIntegratedPosts = useMemo(() => {
        if (!strategy) return [];
        return (strategy.posts || [])
            .map((p: any) => ({
                ...p,
                isCRM: false,
                idea: toGrowthStyleTitle(p.idea, p.day),
            }))
            .sort((a: any, b: any) => a.day - b.day);
    }, [strategy]);

    const weekWisePhases = useMemo(() => {
        if (!strategy) return [];

        const duration = Number(strategy.duration_days) || 30;
        const totalWeeks = Math.max(1, Math.ceil(duration / 7));
        const accents = ['bg-violet-50', 'bg-sky-50', 'bg-emerald-50', 'bg-amber-50'];

        const toLabel = (value: string) =>
            value
                .split('_')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

        return Array.from({ length: totalWeeks }, (_, index) => {
            const week = index + 1;
            const startDay = index * 7 + 1;
            const endDay = Math.min(duration, week * 7);
            const postsInWeek = allIntegratedPosts.filter((p: any) => p.day >= startDay && p.day <= endDay);

            const platforms = Array.from(
                new Set(postsInWeek.map((p: any) => p.platform).filter(Boolean))
            );
            const goals = Array.from(new Set(postsInWeek.map((p: any) => p.goal).filter(Boolean)));

            const points: string[] = [];
            points.push(`${postsInWeek.length} post${postsInWeek.length === 1 ? '' : 's'} planned in this week`);
            if (platforms.length > 0) {
                points.push(`Platform mix: ${platforms.slice(0, 3).map((p) => toLabel(String(p))).join(', ')}`);
            }
            if (goals.length > 0) {
                points.push(`Primary focus: ${goals.slice(0, 2).map((g) => toLabel(String(g))).join(', ')}`);
            }
            if (postsInWeek[0]?.idea) {
                points.push(`Kick-off idea: ${String(postsInWeek[0].idea).slice(0, 70)}`);
            }
            if (points.length < 2) {
                points.push('Use this week to keep content output consistent and aligned to your campaign.');
            }

            return {
                title: `Week ${week}`,
                goal: `Days ${startDay}-${endDay}`,
                points: points.slice(0, 4),
                accent: accents[index % accents.length],
            };
        });
    }, [strategy, allIntegratedPosts]);

    if (isLoading) return <StrategyBoardSkeleton />;
    if (!strategy) return <div className="p-10 text-center text-zinc-500 font-medium tracking-tight">Prebuilt Strategy not found.</div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 pb-20">
            <StrategyHeader
                backHref="/dashboard/prebuilt-strategy-prompts"
                title={name}
                subtitle="Prebuilt Marketing Blueprint"
                description="This is a domain-specific strategy template generated for your brand. Review the suggested ideas and posting schedule."
                durationDays={strategy.duration_days}
                showPrebuiltBadge={true}
                editable={false}
                isSavingName={false}
                onTitleChange={() => {}}
                onTitleBlur={() => {}}
            />

            <div className="mt-8 px-8">
                <div className="mb-6 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-4 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-tight">Prebuilt Blueprint Mode</h4>
                        <p className="text-xs text-indigo-900/90 mt-1 font-medium leading-relaxed">
                            This strategy was generated from a prebuilt template. It is optimized for {strategy.business_type || 'your domain'}. 
                            Use these ideas to inspire your content planning. This section is separate from your main Strategy Planner.
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <StrategyPhases phases={weekWisePhases} />
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                    <StrategyTableView
                        posts={allIntegratedPosts}
                        startDate={strategy.start_date}
                        readonly={true}
                        allowReadonlyRowClick={true}
                        onRowClick={(post) => setSidebarPost(post)}
                        onEdit={() => {}}
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
                onEdit={() => {}}
                size="half"
            />
        </div>
    );
}
