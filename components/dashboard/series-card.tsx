'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Play, Pause, Trash2, Video, Zap, Calendar } from "lucide-react";
import Image from "next/image";
import { VideoStyles } from "@/lib/constants";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SeriesCardProps {
    series: any;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onTogglePause?: (id: string) => void;
    onGenerateNow?: (id: string, testMode?: boolean) => void;
    onViewVideos?: (id: string) => void;
    canExecuteWorkflow?: boolean;
}

export function SeriesCard({
    series,
    onEdit,
    onDelete,
    onTogglePause,
    onGenerateNow,
    onViewVideos,
    canExecuteWorkflow = true
}: SeriesCardProps) {
    const style = VideoStyles.find(s => s.id === series.video_style);
    const thumbnail = style?.image || "/placeholder-video.png";

    return (
        <Card className="ae-tile ae-tile-interactive group relative gap-0 overflow-hidden p-0">
            {/* Thumbnail Area */}
            {/* ... same as before ... */}
            <div className="relative m-2 mb-0 aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-gold-50">
                <Image
                    src={thumbnail}
                    alt={series.series_name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-60" />

                {/* Status Badge */}
                <div className={cn(
                    "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md",
                    series.status === 'paused' ? "bg-amber-500/90 text-white" : "bg-emerald-500/90 text-white"
                )}>
                    {series.status || 'Active'}
                </div>

                {/* Quick Edit Button */}
                <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0"
                    onClick={() => onEdit?.(series.id)}
                >
                    <Edit2 className="h-4 w-4 text-zinc-900" />
                </Button>

                {/* Platform Icons Overlay */}
                <div className="absolute bottom-3 left-3 flex gap-1">
                    {series.platforms?.map((platform: string) => (
                        <div key={platform} className="rounded-md bg-brand-900/70 px-1 py-0.5 backdrop-blur-sm">
                            <div className="px-0.5 text-[9px] font-bold uppercase text-gold-200">{platform}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                        <h3 className="truncate pr-2 text-[15px] font-extrabold text-zinc-900" title={series.series_name}>
                            {series.series_name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(series.created_at), 'MMM dd, yyyy')}
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-indigo-600 transition-colors">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1.5 rounded-xl border-zinc-200">
                            <DropdownMenuItem onClick={() => onEdit?.(series.id)} className="rounded-lg gap-2 font-medium">
                                <Edit2 className="h-4 w-4" /> Edit Series
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTogglePause?.(series.id)} className="rounded-lg gap-2 font-medium">
                                {series.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                {series.status === 'paused' ? 'Resume' : 'Pause'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete?.(series.id)} className="rounded-lg gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-medium">
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 flex-1 gap-2 rounded-xl border-brand-100 bg-brand-50 text-[12px] font-bold text-brand-800 transition-all hover:bg-brand-100 active:scale-95"
                            onClick={() => onViewVideos?.(series.id)}
                        >
                            <Video className="h-4 w-4" />
                            View Videos
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-10 flex-1 gap-2 rounded-xl bg-gold-400 text-[12px] font-bold text-brand-950 shadow-sm transition-all hover:bg-gold-300 active:scale-95"
                            onClick={() => onGenerateNow?.(series.id)}
                        >
                            <Zap className="h-4 w-4 fill-brand-950" />
                            Generate
                        </Button>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    disabled={!canExecuteWorkflow}
                    className={cn(
                        "w-full h-10 font-bold text-[11px] gap-2 rounded-xl shadow-sm transition-all",
                        canExecuteWorkflow
                            ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 active:scale-95"
                            : "bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed opacity-70"
                    )}
                    onClick={() => canExecuteWorkflow && onGenerateNow?.(series.id, true)}
                >
                    {canExecuteWorkflow ? (
                        <Play className="h-4 w-4 fill-indigo-700" />
                    ) : (
                        <Zap className="h-4 w-4 opacity-50" />
                    )}
                    {canExecuteWorkflow ? 'Execute Full Workflow' : 'Workflow Disabled (Pro)'}
                </Button>
            </div>
        </Card>
    );
}
