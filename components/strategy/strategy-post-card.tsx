'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Copy, Share2, MoreVertical, ImagePlus, Calendar, Check } from 'lucide-react';
import { Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { StrategyPost } from './edit-strategy-post-modal';

const PLATFORM_CONFIG: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    gradient: string;
}> = {
    instagram: {
        icon: Instagram,
        label: 'Instagram',
        gradient: 'linear-gradient(135deg, #fd5949 0%, #d6249f 50%, #285AEB 100%)',
    },
    linkedin: {
        icon: Linkedin,
        label: 'LinkedIn',
        gradient: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
    },
    youtube: {
        icon: Youtube,
        label: 'YouTube',
        gradient: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)',
    },
    facebook: {
        icon: Facebook,
        label: 'Facebook',
        gradient: 'linear-gradient(135deg, #1877F2 0%, #0C5FC7 100%)',
    },
    tiktok: {
        icon: Instagram, // fallback icon
        label: 'TikTok',
        gradient: 'linear-gradient(135deg, #010101 0%, #69C9D0 50%, #EE1D52 100%)',
    },
};

function formatLabel(s: string) {
    return s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const TYPE_PILL: Record<string, { bg: string; text: string }> = {
    reel: { bg: 'bg-violet-100', text: 'text-violet-800' },
    carousel: { bg: 'bg-sky-100', text: 'text-sky-800' },
    video: { bg: 'bg-pink-100', text: 'text-pink-800' },
    image: { bg: 'bg-amber-100', text: 'text-amber-800' },
    text_post: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

const STATUS_PILL: Record<string, { bg: string; text: string; border?: string }> = {
    content_ready: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    planned: { bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border border-zinc-200' },
    content_pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
    scheduled: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    posted: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
};

interface StrategyPostCardProps {
    post: StrategyPost;
    dateLabel?: string;
    readonly?: boolean;
    onEdit: () => void;
    onClone: () => void;
    onPostToPlatforms: () => void;
    onScheduleToCalendar?: () => void;
    onContent: () => void;
    onDelete: () => void;
    onIncludeChange: (checked: boolean) => void;
}

export function StrategyPostCard({
    post,
    dateLabel,
    readonly = false,
    onEdit,
    onClone,
    onPostToPlatforms,
    onScheduleToCalendar,
    onContent,
    onDelete,
    onIncludeChange,
}: StrategyPostCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const typeStyle = TYPE_PILL[post.content_type?.toLowerCase()] || TYPE_PILL.text_post;
    const statusStyle = STATUS_PILL[post.status] || STATUS_PILL.planned;
    const platformKey = post.platform?.toLowerCase() ?? '';
    const platformCfg = PLATFORM_CONFIG[platformKey];
    const PlatformIcon = platformCfg?.icon;

    return (
        <div
            className={cn(
                'bg-white border border-zinc-200 rounded-xl p-4 shadow-sm transition-shadow',
                readonly
                    ? 'rounded-2xl p-5 hover:shadow-md bg-linear-to-br from-white to-zinc-50/70'
                    : 'hover:shadow-md'
            )}
        >
            {/* Top: Day badge + Status + More menu */}
            <div className="flex justify-between items-start mb-2.5">
                <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 rounded-xl px-2 py-0.5">
                    Day {post.day}
                </span>
                <div className="flex items-center gap-0.5">
                    <span
                        className={cn(
                            'text-[11px] font-medium px-2 py-0.5 rounded-xl',
                            statusStyle.bg,
                            statusStyle.text,
                            statusStyle.border
                        )}
                    >
                        {formatLabel(post.status)}
                    </span>
                    {!readonly && (
                        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 shrink-0 rounded-lg text-zinc-500 hover:text-zinc-700 -mr-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-lg border border-zinc-200">
                                <DropdownMenuItem onClick={() => { onEdit(); setMenuOpen(false); }} className="gap-2 rounded-md">
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { onClone(); setMenuOpen(false); }} className="gap-2 rounded-md">
                                    <Copy className="h-3.5 w-3.5" />
                                    Clone
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { onPostToPlatforms(); setMenuOpen(false); }} className="gap-2 rounded-md">
                                    <Share2 className="h-3.5 w-3.5" />
                                    Post to more
                                </DropdownMenuItem>
                                {onScheduleToCalendar && (
                                    <DropdownMenuItem onClick={() => { onScheduleToCalendar(); setMenuOpen(false); }} className="gap-2 rounded-md">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Schedule to calendar
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => { onContent(); setMenuOpen(false); }} className="gap-2 rounded-md">
                                    <ImagePlus className="h-3.5 w-3.5" />
                                    Create / Upload content
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => { onDelete(); setMenuOpen(false); }}
                                    className="gap-2 rounded-md text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Platform badge */}
            {platformCfg && PlatformIcon && (
                <div className="flex items-center gap-1.5 mb-2.5">
                    <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: platformCfg.gradient }}
                    >
                        <PlatformIcon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500">{platformCfg.label}</span>
                </div>
            )}

            {/* Title + caption */}
            <div className={cn('text-[13px] font-medium text-zinc-900 mb-1', readonly ? 'text-[15px] leading-6' : 'line-clamp-2')}>
                {post.idea || 'Untitled'}
            </div>
            {post.caption && (
                <div className={cn('text-zinc-500 mb-3', readonly ? 'text-[13px] leading-5' : 'text-[11px] line-clamp-2')}>
                    {post.caption}
                </div>
            )}

            {/* Type pill + Date */}
            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        'inline-flex text-[11px] font-medium px-2 py-0.5 rounded-xl',
                        typeStyle.bg,
                        typeStyle.text
                    )}
                >
                    {formatLabel(post.content_type)}
                </span>
                <span className="text-[11px] text-[#C87D3A] font-medium">
                    {dateLabel || `Day ${post.day}`}
                </span>
            </div>

            {/* Footer: Goal + Checkbox */}
            <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-[11px] text-zinc-500">
                    {post.goal ? formatLabel(post.goal) : '—'}
                </span>
                {!readonly && (
                    <button
                        type="button"
                        className={cn(
                            'w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors',
                            post.include_in_calendar ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-300'
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onIncludeChange(!post.include_in_calendar);
                        }}
                    >
                        {post.include_in_calendar && <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />}
                    </button>
                )}
            </div>
        </div>
    );
}
