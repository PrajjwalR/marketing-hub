'use client';

import { addDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash2, Copy, Share2, MoreVertical, ImagePlus, Calendar, Check, Clock, AlertCircle } from 'lucide-react';
import { Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StrategyPost } from './edit-strategy-post-modal';
import { strategyPostHasMedia } from '@/lib/strategy-schedule';
import { SocialPlatformMixIcon, type SocialMixPlatform } from '@/components/social/social-platform-mix-icons';

const PLATFORM_BG: Record<SocialMixPlatform, string> = {
    instagram: 'bg-[#FCE7F1]',
    youtube: 'bg-[#FEEAEA]',
    linkedin: 'bg-[#EAF3FF]',
    x: 'bg-zinc-100',
    facebook: 'bg-[#E7F0FF]',
};

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

function formatLabel(s: string) {
    return s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** First listed platform for icon lookup (e.g. "Instagram, YouTube" → instagram). */
function firstPlatformKey(platform: string | undefined): string {
    if (!platform) return '';
    const segment =
        platform
            .split(/,|\/|&|\+|\band\b/gi)
            .map((s) => s.trim())
            .filter(Boolean)[0] || platform;
    const p = segment.toLowerCase();
    if (p.includes('instagram') || p === 'ig') return 'instagram';
    if (p.includes('linkedin')) return 'linkedin';
    if (p.includes('youtube')) return 'youtube';
    if (p.includes('twitter') || p === 'x' || p.startsWith('x ')) return 'x';
    if (p.includes('facebook')) return 'facebook';
    return p.split(/\s+/)[0] || '';
}

function isSocialMixPlatform(platform: string): platform is SocialMixPlatform {
    return (
        platform === 'instagram' ||
        platform === 'youtube' ||
        platform === 'linkedin' ||
        platform === 'x' ||
        platform === 'facebook'
    );
}

interface StrategyTableViewProps {
    posts: StrategyPost[];
    startDate?: string | null;
    readonly?: boolean;
    allowReadonlyRowClick?: boolean;
    onRowClick: (post: StrategyPost) => void;
    onEdit: (post: StrategyPost) => void;
    onClone: (post: StrategyPost) => void;
    onPostToPlatforms: (post: StrategyPost) => void;
    onScheduleToCalendar?: (post: StrategyPost) => void;
    onContent: (post: StrategyPost) => void;
    onDelete: (post: StrategyPost) => void;
    onIncludeChange: (post: StrategyPost, checked: boolean) => void;
    onAddPost?: () => void;
}

export function StrategyTableView({
    posts,
    startDate,
    readonly = false,
    allowReadonlyRowClick = false,
    onRowClick,
    onEdit,
    onClone,
    onPostToPlatforms,
    onScheduleToCalendar,
    onContent,
    onDelete,
    onIncludeChange,
}: StrategyTableViewProps) {
    let baseDate: Date | null = null;
    if (startDate) baseDate = new Date(startDate);

    const getDateLabel = (day: number) => {
        if (!baseDate) return `Day ${day}`;
        return format(addDays(baseDate, day - 1), 'MMM d, yyyy');
    };

    const sortedPosts = [...posts].sort((a, b) => a.day - b.day || 0);

    return (
        <div className="rounded-[14px] border border-zinc-200 bg-white/90 shadow-sm transition-shadow hover:shadow-md">
            <Table className="text-[13px]">
                <TableHeader>
                    <TableRow className="border-zinc-200 bg-zinc-50/80">
                        {!readonly && (
                            <TableHead className="w-8 px-3 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]"></TableHead>
                        )}
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Day</TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Date</TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Idea</TableHead>
                        <TableHead className="w-14 px-2 py-2.5 text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">
                            Platform
                        </TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Content type</TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Goal</TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Status</TableHead>
                        {!readonly && (
                            <TableHead className="w-16 px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]"></TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPosts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={readonly ? 7 : 9} className="py-8 text-center text-zinc-400 text-[13px]">
                                No posts match this filter.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedPosts.map((post) => {
                            const platformKey = firstPlatformKey(post.platform);
                            const isMixPlatform = isSocialMixPlatform(platformKey);
                            const platformTitle = post.platform?.trim() || 'Platform';
                            const typeStyle = TYPE_PILL[post.content_type?.toLowerCase()] || TYPE_PILL.text_post;
                            const statusStyle = STATUS_PILL[post.status] || STATUS_PILL.planned;

                            return (
                                <TableRow
                                    key={post.id}
                                    className={cn(
                                        'border-zinc-100 group transition-colors odd:bg-white even:bg-zinc-50/60',
                                        readonly
                                            ? (allowReadonlyRowClick ? 'cursor-pointer hover:bg-zinc-50' : 'cursor-default hover:bg-zinc-50')
                                            : 'cursor-pointer hover:bg-zinc-50',
                                        (post as any).isCRM && 'bg-amber-50/30 hover:bg-amber-50/50 border-l-4 border-l-amber-400'
                                    )}
                                    onClick={() => {
                                        if ((allowReadonlyRowClick || !readonly) && !(post as any).isCRM) onRowClick(post);
                                    }}
                                >
                                    {!readonly && (
                                        <TableCell className="px-3 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                                            {!(post as any).isCRM && (
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors',
                                                        (post.include_in_calendar !== false)
                                                            ? 'bg-zinc-900 text-white'
                                                            : 'bg-white border border-zinc-300'
                                                    )}
                                                    onClick={() =>
                                                        onIncludeChange(post, !(post.include_in_calendar !== false))
                                                    }
                                                >
                                                    {(post.include_in_calendar !== false) && <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />}
                                                </button>
                                            )}
                                            {(post as any).isCRM && <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center"><Calendar className="h-2.5 w-2.5 text-white" /></div>}
                                        </TableCell>
                                    )}
                                    <TableCell className="px-3.5 py-3">
                                        <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 rounded-xl px-2 py-0.5">
                                            Day {post.day}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 min-w-[100px]">
                                                <Calendar className="h-3 w-3 text-zinc-400" />
                                                <span className="text-xs font-semibold text-zinc-900">{getDateLabel(post.day)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                <Clock className="h-3 w-3 text-zinc-400" />
                                                <span className="font-medium leading-none">{post.post_time || '10:00 AM'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3 max-w-[220px]">
                                        <div className="font-medium text-[13px] text-zinc-900 line-clamp-2 truncate">
                                            {post.idea || 'Untitled'}
                                        </div>
                                        {(post as any).isCRM && (
                                             <span className="inline-flex text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-1 tracking-wider uppercase">CRM AUTOMATION</span>
                                        )}
                                        {post.caption && (
                                            <p className="text-[11px] text-zinc-400 line-clamp-1 truncate mt-0.5">{post.caption}</p>
                                        )}
                                        {!(post as any).isCRM && !strategyPostHasMedia(post) && (
                                            <span
                                                className="inline-flex items-center gap-1 mt-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700"
                                                title="Add media before this can go live as a published post"
                                            >
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                No content
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-center align-middle">
                                        {(post as any).isCRM ? (
                                            <div
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900"
                                                title="Sync channels"
                                                aria-label="Sync channels"
                                            >
                                                <Share2 className="h-6 w-6 text-white" aria-hidden />
                                            </div>
                                        ) : (
                                            <div
                                                className={cn(
                                                    'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                                                    isMixPlatform ? PLATFORM_BG[platformKey] : 'bg-zinc-600'
                                                )}
                                                title={platformTitle}
                                                aria-label={platformTitle}
                                            >
                                                {isMixPlatform ? (
                                                    <SocialPlatformMixIcon platform={platformKey} className="h-6 w-6" />
                                                ) : (
                                                    <Video className="h-6 w-6 text-white" aria-hidden />
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3">
                                        <span
                                            className={cn(
                                                'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-xl',
                                                (post as any).isCRM ? 'bg-zinc-100 text-zinc-500' : typeStyle.bg,
                                                (post as any).isCRM ? '' : typeStyle.text
                                            )}
                                        >
                                            {(post as any).isCRM ? 'Message' : formatLabel(post.content_type)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3 text-xs text-zinc-600">
                                        {(post as any).isCRM ? (post as any).goal || 'CRM Sync' : (post.goal ? formatLabel(post.goal) : '—')}
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3">
                                        <span
                                            className={cn(
                                                'inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-xl uppercase',
                                                (post as any).isCRM ? 'bg-emerald-100 text-emerald-800' : statusStyle.bg,
                                                (post as any).isCRM ? '' : (statusStyle.text),
                                                statusStyle.border
                                            )}
                                        >
                                            {(post as any).isCRM ? 'ENABLED' : formatLabel(post.status)}
                                        </span>
                                    </TableCell>
                                    {!readonly && (
                                        <TableCell className="px-3.5 py-3" onClick={(e) => e.stopPropagation()}>
                                            {!(post as any).isCRM && (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        className="w-7 h-7 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
                                                        onClick={() => onEdit(post)}
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7 shrink-0 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-lg border border-zinc-200">
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                                                                className="gap-2 rounded-md"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); onClone(post); }}
                                                                className="gap-2 rounded-md"
                                                            >
                                                                <Copy className="h-3.5 w-3.5" />
                                                                Clone
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); onPostToPlatforms(post); }}
                                                                className="gap-2 rounded-md"
                                                            >
                                                                <Share2 className="h-3.5 w-3.5" />
                                                                Post to more
                                                            </DropdownMenuItem>
                                                            {onScheduleToCalendar && (
                                                                <DropdownMenuItem
                                                                    onClick={(e) => { e.stopPropagation(); onScheduleToCalendar(post); }}
                                                                    className="gap-2 rounded-md"
                                                                >
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                    Schedule to calendar
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); onContent(post); }}
                                                                className="gap-2 rounded-md"
                                                            >
                                                                <ImagePlus className="h-3.5 w-3.5" />
                                                                Create / Upload content
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); onDelete(post); }}
                                                                className="gap-2 rounded-md text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                            {(post as any).isCRM && <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Locked</span>}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
