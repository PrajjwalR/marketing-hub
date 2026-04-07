'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const PLATFORMS = ['instagram', 'linkedin', 'facebook', 'youtube'];
const CONTENT_TYPES = ['reel', 'carousel', 'image', 'video', 'text_post'];
const GOALS = ['increase_followers', 'increase_sales', 'brand_awareness', 'engagement'];

const formatLabel = (s: string) =>
    s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export interface StrategyPost {
    id: string;
    day: number;
    platform: string;
    content_type: string;
    theme: string;
    idea: string;
    caption: string;
    description?: string;
    goal: string;
    status: string;
    include_in_calendar: boolean;
    media_url?: string | null;
    isCRM?: boolean;
    post_time?: string;
}

interface EditStrategyPostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: StrategyPost | null;
    strategyId: string;
    durationDays: number;
    startDate?: string | null;
    onSave: () => void;
    isCreate?: boolean;
    initialDay?: number;
    /** Pre-fill form from this post and create a new one (clone) */
    cloneFrom?: StrategyPost | null;
}

export function EditStrategyPostModal({
    open,
    onOpenChange,
    post,
    strategyId,
    durationDays,
    startDate: strategyStartDate = null,
    onSave,
    isCreate = false,
    initialDay = 1,
    cloneFrom = null,
}: EditStrategyPostModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [day, setDay] = useState(1);
    const [platform, setPlatform] = useState('instagram');
    const [contentType, setContentType] = useState('image');
    const [idea, setIdea] = useState('');
    const [description, setDescription] = useState('');
    const [caption, setCaption] = useState('');
    const [goal, setGoal] = useState('engagement');
    const [theme, setTheme] = useState('');
    const [postTime, setPostTime] = useState('10:00 AM');

    useEffect(() => {
        if (post) {
            setDay(post.day);
            setPlatform(post.platform);
            setContentType(post.content_type);
            setIdea(post.idea || '');
            setDescription(post.description || '');
            setCaption(post.caption || '');
            setGoal(post.goal);
            setTheme(post.theme || '');
            setPostTime(post.post_time || '10:00 AM');
        } else if (cloneFrom) {
            setDay(initialDay);
            setPlatform(cloneFrom.platform);
            setContentType(cloneFrom.content_type);
            setIdea(cloneFrom.idea || '');
            setDescription(cloneFrom.description || '');
            setCaption(cloneFrom.caption || '');
            setGoal(cloneFrom.goal);
            setTheme(cloneFrom.theme || '');
            setPostTime(cloneFrom.post_time || '10:00 AM');
        } else if (isCreate) {
            setDay(initialDay);
            setPlatform('instagram');
            setContentType('image');
            setIdea('');
            setDescription('');
            setCaption('');
            setGoal('engagement');
            setTheme('');
            setPostTime('10:00 AM');
        }
    }, [post, isCreate, open, initialDay, cloneFrom]);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const isClone = !!cloneFrom && !post;

            // If cloning and nothing changed (same day, platform, content, idea, etc.), do nothing
            if (isClone && cloneFrom) {
                const trimmedIdea = idea.trim();
                const trimmedDescription = description.trim();
                const trimmedCaption = caption.trim();
                const trimmedTheme = theme.trim();

                const noChanges =
                    day === cloneFrom.day &&
                    platform === cloneFrom.platform &&
                    contentType === cloneFrom.content_type &&
                    (trimmedIdea || '') === (cloneFrom.idea || '') &&
                    (trimmedDescription || '') === (cloneFrom.description || '') &&
                    (trimmedCaption || '') === (cloneFrom.caption || '') &&
                    goal === cloneFrom.goal &&
                    (trimmedTheme || '') === (cloneFrom.theme || '') &&
                    postTime === cloneFrom.post_time;

                if (noChanges) {
                    toast.info('No changes detected. Duplicate post was not created.');
                    onOpenChange(false);
                    return;
                }
            }

            if (isCreate || isClone) {
                const res = await fetch(`/api/strategy/${strategyId}/posts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        day,
                        platform,
                        content_type: contentType,
                        idea: idea.trim(),
                        description: description.trim(),
                        caption: caption.trim(),
                        goal,
                        theme: theme.trim() || undefined,
                        post_time: postTime,
                    }),
                });
                if (!res.ok) throw new Error((await res.json()).error);
                toast.success(isClone ? 'Post cloned to new day.' : 'Post created.');
            } else if (post) {
                const res = await fetch(`/api/strategy/${strategyId}/posts/${post.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        day,
                        platform,
                        content_type: contentType,
                        idea: idea.trim(),
                        description: description.trim(),
                        caption: caption.trim(),
                        goal,
                        theme: theme.trim() || undefined,
                        post_time: postTime,
                    }),
                });
                if (!res.ok) throw new Error((await res.json()).error);
                toast.success('Post updated.');
            }
            onSave();
            onOpenChange(false);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Something went wrong while saving the post';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = cloneFrom ? 'Clone to Another Day' : isCreate ? 'Add Post' : 'Edit Post';

    return (
        <SlidePanel
            open={open}
            onClose={() => onOpenChange(false)}
            title={title}
            size="half"
            footer={
                <div className="flex justify-end gap-3 bg-white">
                    <Button 
                        variant="ghost" 
                        onClick={() => onOpenChange(false)} 
                        className="rounded-full font-bold text-[15px] border border-zinc-300 text-zinc-900 bg-white hover:bg-zinc-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="rounded-full font-medium text-[15px] bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4 px-6 py-4">
                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Day</Label>
                        <div className="mt-1.5 flex items-center gap-3">
                            <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
                                <SelectTrigger className="h-11 rounded-xl border-zinc-200 w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: durationDays }, (_, i) => i + 1).map((d) => (
                                        <SelectItem key={d} value={String(d)}>
                                            Day {d}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {strategyStartDate && (
                                <span className="text-xs text-zinc-500">
                                    {(() => {
                                        const base = new Date(strategyStartDate);
                                        if (Number.isNaN(base.getTime())) return null;
                                        const date = new Date(base);
                                        date.setDate(base.getDate() + (day - 1));
                                        return new Intl.DateTimeFormat('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                        }).format(date);
                                    })()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Platform</Label>
                        <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="mt-1.5 h-11 rounded-xl border-zinc-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PLATFORMS.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {formatLabel(p)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Content Type</Label>
                        <Select value={contentType} onValueChange={setContentType}>
                            <SelectTrigger className="mt-1.5 h-11 rounded-xl border-zinc-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CONTENT_TYPES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {formatLabel(c)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Idea Title</Label>
                        <Input
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="e.g. Behind the scenes of product creation"
                            className="mt-1.5 h-11 rounded-xl border-zinc-200"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Post description..."
                            className="mt-1.5 min-h-[80px] rounded-xl border-zinc-200 resize-none"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Caption Suggestion</Label>
                        <Textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Short caption suggestion..."
                            className="mt-1.5 min-h-[60px] rounded-xl border-zinc-200 resize-none"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Goal</Label>
                        <Select value={goal} onValueChange={setGoal}>
                            <SelectTrigger className="mt-1.5 h-11 rounded-xl border-zinc-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {GOALS.map((g) => (
                                    <SelectItem key={g} value={g}>
                                        {formatLabel(g)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Theme</Label>
                        <Input
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g. Festival, Educational, Promotion"
                            className="mt-1.5 h-11 rounded-xl border-zinc-200"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-600">Optimal Post Time</Label>
                        <Input
                            value={postTime}
                            onChange={(e) => setPostTime(e.target.value)}
                            placeholder="e.g. 10:00 AM"
                            className="mt-1.5 h-11 rounded-xl border-zinc-200"
                        />
                    </div>
                </div>
        </SlidePanel>
    );
}
