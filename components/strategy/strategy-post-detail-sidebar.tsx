'use client';

import { addDays, format } from 'date-fns';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Instagram, Linkedin, Youtube, Video, Facebook, Pencil, ImagePlus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StrategyPost } from './edit-strategy-post-modal';

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    facebook: Facebook,
};

const PLATFORM_LABELS: Record<string, string> = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    facebook: 'Facebook',
};

const STATUS_LABELS: Record<string, string> = {
    planned: 'Planned',
    content_pending: 'Content pending',
    content_ready: 'Content ready',
    scheduled: 'Scheduled',
    posted: 'Posted',
};

const STATUS_PROGRESS: Record<string, number> = {
    planned: 10,
    content_pending: 25,
    content_ready: 50,
    scheduled: 75,
    posted: 100,
};

function formatLabel(s: string) {
    return s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

interface StrategyPostDetailSidebarProps {
    post: StrategyPost | null;
    open: boolean;
    onClose: () => void;
    startDate?: string | null;
    onEdit: () => void;
    /** Open create/upload flow for this post (receives post so parent state stays correct after sidebar closes). */
    onContent?: (post: StrategyPost) => void;
    onScheduleToCalendar?: (post: StrategyPost) => void;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'half' | 'full';
}

export function StrategyPostDetailSidebar({
    post,
    open,
    onClose,
    startDate,
    onEdit,
    onContent,
    onScheduleToCalendar,
    size = 'lg',
}: StrategyPostDetailSidebarProps) {
    if (!post) return null;

    const PlatformIcon = PLATFORM_ICONS[post.platform?.toLowerCase()] || Video;
    const platformLabel = PLATFORM_LABELS[post.platform?.toLowerCase()] || formatLabel(post.platform || '');

    const getDateLabel = () => {
        if (!startDate) return `Day ${post.day}`;
        return format(addDays(new Date(startDate), post.day - 1), 'MMMM d, yyyy');
    };

    const progress = STATUS_PROGRESS[post.status] ?? 10;
    const categories = [post.theme, post.goal].filter(Boolean).map(formatLabel);

    return (
        <SlidePanel
            open={open}
            onClose={onClose}
            title={post.idea || 'Untitled'}
            size={size}
            footer={
                <div className="flex justify-end gap-2">
                    {onContent && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                const p = post;
                                onClose();
                                onContent(p);
                            }}
                            className="rounded-full font-medium text-[15px] gap-2 border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 [&_svg]:text-zinc-900"
                        >
                            <ImagePlus className="h-4 w-4" />
                            Content
                        </Button>
                    )}
                    {onScheduleToCalendar && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                const p = post;
                                onClose();
                                onScheduleToCalendar(p);
                            }}
                            className="rounded-full font-medium text-[15px] gap-2 border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 [&_svg]:text-zinc-900"
                        >
                            <Calendar className="h-4 w-4" />
                            Schedule
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            onClose();
                            onEdit();
                        }}
                        className="rounded-full font-medium text-[15px] bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 gap-2"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                </div>
            }
        >
            <div className="px-6 py-4 space-y-6">
                {categories.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Category</p>
                        <div className="flex flex-wrap gap-1.5">
                            {categories.map((c, i) => (
                                <Badge
                                    key={c}
                                    variant="secondary"
                                    className={cn(
                                        'text-xs font-medium',
                                        i === 0 && 'bg-orange-100 text-orange-800',
                                        i === 1 && 'bg-amber-100 text-amber-800',
                                        i >= 2 && 'bg-emerald-100 text-emerald-800'
                                    )}
                                >
                                    {c}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Content Type</p>
                    <Badge variant="secondary" className="bg-rose-100 text-rose-800 text-xs font-medium">
                        {formatLabel(post.content_type)}
                    </Badge>
                </div>

                <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Platforms</p>
                    <p className="text-sm text-zinc-700">{platformLabel}</p>
                </div>

                <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Progress</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs font-medium">
                        {STATUS_LABELS[post.status] || formatLabel(post.status)}
                    </Badge>
                </div>

                <div className="flex gap-10">
                    <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Published at</p>
                        <p className="text-sm text-amber-700 font-medium">{getDateLabel()}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Optimal Post Time</p>
                        <p className="text-sm text-zinc-700 font-semibold">{post.post_time || '10:00 AM'}</p>
                    </div>
                </div>

                {post.goal && (
                    <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Topics</p>
                        <p className="text-sm text-zinc-700">{formatLabel(post.goal)}</p>
                    </div>
                )}

                {post.caption && (
                    <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Caption</p>
                        <p className="text-sm text-zinc-700 leading-relaxed">{post.caption}</p>
                    </div>
                )}

                <div>
                    <p className="text-sm font-semibold text-zinc-900 mb-3">Platforms</p>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-zinc-800 text-white shrink-0">
                                <PlatformIcon className="h-7 w-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-zinc-900">{platformLabel}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">Day {post.day}</p>
                                <div className="mt-2 h-2 rounded-full bg-zinc-200 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">{progress}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SlidePanel>
    );
}
