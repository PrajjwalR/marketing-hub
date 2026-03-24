'use client';

import { useEffect, useMemo, useState } from "react";
import { Loader2, ArrowUp, ArrowDown, BarChart3, CalendarRange } from "lucide-react";

type MetricValue = {
    value: number;
    change: number;
};

type OverviewResponse = {
    rangeDays: 7 | 30;
    metrics: {
        totalPosts: MetricValue;
        publishedPosts: MetricValue;
        engagementEstimate: MetricValue;
        responseCount: MetricValue;
    };
    meta: {
        connectedProfiles: number;
    };
    trend: Array<{
        date: string;
        totalPosts: number;
        publishedPosts: number;
    }>;
};

export default function AnalyticsPage() {
    const [rangeDays, setRangeDays] = useState<7 | 30>(30);
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<OverviewResponse | null>(null);

    const fetchOverview = async (days: 7 | 30) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/overview?range=${days}`);
            if (!res.ok) throw new Error("Failed to load analytics overview");
            const data = await res.json();
            setOverview(data);
        } catch (error) {
            setOverview(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview(rangeDays);
    }, [rangeDays]);

    const cards = useMemo(() => {
        if (!overview) return [];
        return [
            { label: "Total Posts", key: "totalPosts" as const, helper: "Posts scheduled in range" },
            { label: "Published Posts", key: "publishedPosts" as const, helper: "Posts marked published/completed" },
            { label: "Engagement Estimate", key: "engagementEstimate" as const, helper: "Internal estimate from post quality/activity" },
            { label: "Response Count", key: "responseCount" as const, helper: "Internal response proxy (until inbox APIs)" },
        ];
    }, [overview]);

    const trendMax = useMemo(() => {
        const values = (overview?.trend || []).map((item) => item.totalPosts);
        return Math.max(1, ...values);
    }, [overview]);

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900">Performance Overview</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Internal analytics for your publishing pipeline. Platform-native metrics can be added next.
                    </p>
                </div>
                <div className="flex gap-2">
                    {([7, 30] as const).map((days) => (
                        <button
                            key={days}
                            onClick={() => setRangeDays(days)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                                rangeDays === days
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white"
                            }`}
                        >
                            {days} days
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-[240px] rounded-xl border border-zinc-200 bg-white flex items-center justify-center gap-2 text-zinc-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading metrics...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {cards.map((card) => {
                        const metric = overview?.metrics[card.key];
                        const up = (metric?.change || 0) >= 0;
                        return (
                            <div key={card.key} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="text-xs text-zinc-500 font-medium mb-1">{card.label}</div>
                                <div className="text-2xl font-bold text-zinc-900">
                                    {(metric?.value ?? 0).toLocaleString()}
                                </div>
                                <div className="text-[11px] text-zinc-500 mt-1">{card.helper}</div>
                                <div className={`flex items-center gap-1 text-xs font-semibold mt-2 ${up ? "text-green-600" : "text-red-500"}`}>
                                    {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    {Math.abs(metric?.change ?? 0)}% vs previous {rangeDays} days
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
                        <CalendarRange className="h-4 w-4 text-zinc-500" />
                        Current Window
                    </h2>
                    <p className="text-sm text-zinc-600">
                        Showing aggregated metrics for the last <span className="font-semibold text-zinc-900">{rangeDays} days</span>.
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-zinc-500" />
                        Connected Profiles
                    </h2>
                    <p className="text-sm text-zinc-600">
                        Active connected social profiles:{" "}
                        <span className="font-semibold text-zinc-900">
                            {overview?.meta.connectedProfiles ?? 0}
                        </span>
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 mb-4">Daily Trend ({rangeDays} days)</h2>
                <div className="h-52 flex items-end gap-2 overflow-x-auto pb-2">
                    {(overview?.trend || []).map((item) => {
                        const totalHeight = Math.max(6, Math.round((item.totalPosts / trendMax) * 100));
                        const publishedHeight = item.totalPosts === 0
                            ? 0
                            : Math.max(4, Math.round((item.publishedPosts / trendMax) * 100));
                        const shortDate = item.date.slice(5);
                        return (
                            <div key={item.date} className="min-w-[30px] flex flex-col items-center gap-1">
                                <div className="relative h-36 w-6 rounded-md bg-zinc-100 overflow-hidden">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-indigo-300"
                                        style={{ height: `${totalHeight}%` }}
                                        title={`Total: ${item.totalPosts}`}
                                    />
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-indigo-600"
                                        style={{ height: `${publishedHeight}%` }}
                                        title={`Published: ${item.publishedPosts}`}
                                    />
                                </div>
                                <span className="text-[10px] text-zinc-500">{shortDate}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-300" /> Total posts</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Published posts</span>
                </div>
            </div>
        </div>
    );
}
