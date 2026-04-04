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
import { Pencil, Trash2, Copy, Share2, MoreVertical, ImagePlus, Calendar, Check } from 'lucide-react';
import { Instagram, Linkedin, Youtube, Facebook, Video } from 'lucide-react';
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

interface StrategyTableViewProps {
    posts: StrategyPost[];
    startDate?: string | null;
    readonly?: boolean;
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
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Idea</TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Day</TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Date</TableHead>
                        <TableHead className="px-3.5 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.18em]">Platform</TableHead>
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
                            const platformKey = post.platform?.toLowerCase() ?? '';
                            const platformCfg = PLATFORM_CONFIG[platformKey];
                            const PlatformIcon = platformCfg?.icon ?? Video;
                            const platformLabel = platformCfg?.label ?? formatLabel(post.platform || '');
                            const typeStyle = TYPE_PILL[post.content_type?.toLowerCase()] || TYPE_PILL.text_post;
                            const statusStyle = STATUS_PILL[post.status] || STATUS_PILL.planned;

                            return (
                                <TableRow
                                    key={post.id}
                                    className={cn(
                                        'border-zinc-100 group transition-colors odd:bg-white even:bg-zinc-50/60',
                                        readonly ? 'cursor-default' : 'cursor-pointer hover:bg-zinc-50',
                                        (post as any).isCRM && 'bg-amber-50/30 hover:bg-amber-50/50 border-l-4 border-l-amber-400'
                                    )}
                                    onClick={() => {
                                        if (!readonly && !(post as any).isCRM) onRowClick(post);
                                    }}
                                >
                                    {!readonly && (
                                        <TableCell className="px-3 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                                            {!(post as any).isCRM && (
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors',
                                                        post.include_in_calendar
                                                            ? 'bg-zinc-900 text-white'
                                                            : 'bg-white border border-zinc-300'
                                                    )}
                                                    onClick={() => onIncludeChange(post, !post.include_in_calendar)}
                                                >
                                                    {post.include_in_calendar && <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />}
                                                </button>
                                            )}
                                            {(post as any).isCRM && <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center"><Calendar className="h-2.5 w-2.5 text-white" /></div>}
                                        </TableCell>
                                    )}
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
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3">
                                        <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 rounded-xl px-2 py-0.5">
                                            Day {post.day}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3">
                                        <span className="text-xs font-medium text-[#C87D3A]">{getDateLabel(post.day)}</span>
                                    </TableCell>
                                    <TableCell className="px-3.5 py-3">
                                        {(post as any).isCRM ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                                                    <Share2 className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                <span className="text-xs text-zinc-600">Sync Channels</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{ background: platformCfg?.gradient ?? 'linear-gradient(135deg, #71717a, #3f3f46)' }}
                                                >
                                                    <PlatformIcon className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                <span className="text-xs text-zinc-600">{platformLabel}</span>
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
