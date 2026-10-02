'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Clapperboard, Layers, LayoutGrid, Loader2, Play, Plus } from "lucide-react";
import { EmptyState, PageHero, heroButtonClass } from "@/components/dashboard/page-hero";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SeriesCard } from '@/components/dashboard/series-card';
import { toast } from 'sonner';
import { usePlanLimits } from '@/hooks/use-plan-limits';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';

export default function SeriesPage() {
    const router = useRouter();
    const [series, setSeries] = useState<any[]>([]);
    const [videoCount, setVideoCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const { limits, canCreateVideo, canExecuteWorkflow } = usePlanLimits();

    const fetchData = async () => {
        try {
            setIsLoading(true);

            const seriesRes = await fetch('/api/series');
            if (seriesRes.ok) {
                const data = await seriesRes.json();
                setSeries(data);
            }

            const videosRes = await fetch('/api/videos');
            if (videosRes.ok) {
                const data = await videosRes.json();
                setVideoCount(data.length);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load series data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this series?")) return;

        try {
            const response = await fetch(`/api/series/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Series deleted");
                setSeries(prev => prev.filter(s => s.id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete series");
        }
    };

    const handleTogglePause = async (id: string) => {
        const item = series.find(s => s.id === id);
        const newStatus = item.status === 'paused' ? 'active' : 'paused';

        try {
            const response = await fetch(`/api/series/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                toast.success(`Series ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
                setSeries(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const activeCount = series.filter((s) => s.status !== 'paused').length;
    const newSeriesButton = (
        <Link href="/dashboard/create" className={heroButtonClass('gold')}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New series
        </Link>
    );

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-7xl">
                <PageHero title="Your Series" breadcrumb={['Content Creation', 'Series']} icon={Layers} description="Manage and monitor your automated video series." />
                <div className="ae-tile flex h-[40vh] flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                    <p className="font-medium text-zinc-500">Fetching your series...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl">
            <PageHero
                title="Your Series"
                breadcrumb={['Content Creation', 'Series']}
                icon={Layers}
                description="Manage and monitor your automated video series."
                actions={newSeriesButton}
                stats={[
                    { label: 'Series', value: series.length, icon: Layers },
                    { label: 'Active', value: activeCount, icon: Play },
                    { label: 'Videos made', value: videoCount, icon: Clapperboard },
                ]}
            />

            {series.length === 0 ? (
                <EmptyState
                    icon={LayoutGrid}
                    title="No series created yet"
                    description="Start your content journey by creating your first automated video series. It only takes a few minutes to set up!"
                    action={
                        <Link href="/dashboard/create">
                            <Button variant="gold" size="lg">Create now</Button>
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {series.map((item) => (
                        <SeriesCard
                            key={item.id}
                            series={item}
                            onDelete={handleDelete}
                            onTogglePause={handleTogglePause}
                            onEdit={(id) => router.push(`/dashboard/create?id=${id}`)}
                            canExecuteWorkflow={canExecuteWorkflow}
                            onGenerateNow={async (id, testMode = false) => {
                                if (!canCreateVideo(videoCount)) {
                                    toast.error(`You've reached the video limit for the ${limits.name} plan.`);
                                    setIsUpgradeModalOpen(true);
                                    return;
                                }

                                try {
                                    const response = await fetch('/api/video/generate', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ seriesId: id, testMode })
                                    });
                                    if (response.ok) {
                                        toast.success(testMode ? "Test workflow started (4 min total delay)!" : "Video generation started!");
                                        router.push('/dashboard/videos');
                                    } else {
                                        toast.error("Failed to start generation");
                                    }
                                } catch (error) {
                                    toast.error("Error starting generation");
                                }
                            }}
                            onViewVideos={(id) => router.push(`/dashboard/videos?seriesId=${id}`)}
                        />
                    ))}
                </div>
            )}

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                title="Upgrade to Generate More Videos"
                description={`You've reached the ${limits.maxVideos} video limit on the ${limits.name} plan. Upgrade to Basic or Unlimited to unlock more generations!`}
            />
        </div>
    );
}
