'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, Loader2, Calendar, Clock, User, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

type PostDetail = {
    id: string;
    title: string;
    description: string | null;
    media_url: string | null;
    status: string;
    approval_status: string;
    scheduled_at: string;
    published_at: string | null;
    platform: string | null;
    platforms: string[] | unknown;
    type: string;
    account_id: string | null;
    color: string | null;
    approval_required?: boolean;
    submitted_for_approval_at?: string | null;
};

type ReviewerRow = {
    reviewer_user_id: string;
    decision: string;
    comment: string | null;
    decision_at: string | null;
    user: { user_id: string; name: string | null; email: string | null } | null;
};

type ApprovalItem = {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    requested_at: string;
    decision_note?: string | null;
    post: PostDetail | null;
    requester?: {
        user_id: string;
        name: string | null;
        email: string | null;
    } | null;
    reviewers: ReviewerRow[];
};

function firstMediaUrl(media_url: string | null | undefined): string | null {
    if (!media_url?.trim()) return null;
    const u = media_url.split(',')[0]?.trim();
    return u || null;
}

function normalizePlatforms(row: PostDetail | null): string[] {
    if (!row) return [];
    const raw = row.platforms;
    if (Array.isArray(raw)) {
        return raw.filter((p): p is string => typeof p === 'string' && p.length > 0);
    }
    if (row.platform) return [row.platform];
    return [];
}

function ApprovalMedia({ url }: { url: string }) {
    const isVideo =
        /\.(mp4|webm|ogg|mov)$/i.test(url) ||
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com');

    if (isVideo) {
        return (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-950">
                <video src={url} className="h-full w-full object-contain" controls preload="metadata" />
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full max-h-[320px] rounded-xl object-contain bg-zinc-100" />
    );
}

export default function ApprovalsPage() {
    const [inboxItems, setInboxItems] = useState<ApprovalItem[]>([]);
    const [submissionItems, setSubmissionItems] = useState<ApprovalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState<'inbox' | 'submissions'>('inbox');
    const [actingId, setActingId] = useState<string | null>(null);

    const load = async () => {
        try {
            setIsLoading(true);
            const [inboxRes, submissionsRes] = await Promise.all([
                fetch('/api/approvals/inbox'),
                fetch('/api/approvals/inbox?mode=submissions'),
            ]);
            if (!inboxRes.ok || !submissionsRes.ok) throw new Error('Failed to load approvals');
            const [inboxData, submissionsData] = await Promise.all([inboxRes.json(), submissionsRes.json()]);
            setInboxItems(inboxData || []);
            setSubmissionItems(submissionsData || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load approvals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const decide = async (approvalId: string, decision: 'approved' | 'rejected' | 'changes_requested') => {
        try {
            setActingId(approvalId);
            const res = await fetch(`/api/approvals/${approvalId}/decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to save decision');
            toast.success(`Decision saved: ${decision.replace('_', ' ')}`);
            await load();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save decision');
        } finally {
            setActingId(null);
        }
    };

    const activeItems = tab === 'inbox' ? inboxItems : submissionItems;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-zinc-500 font-medium">Loading approvals...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Approvals</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Review full post context, media, and schedule before you decide.
                </p>
            </div>
            <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1">
                <button
                    type="button"
                    onClick={() => setTab('inbox')}
                    className={cn(
                        'rounded-lg px-3 py-1.5 text-sm font-bold',
                        tab === 'inbox' ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600'
                    )}
                >
                    Inbox ({inboxItems.length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab('submissions')}
                    className={cn(
                        'rounded-lg px-3 py-1.5 text-sm font-bold',
                        tab === 'submissions' ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600'
                    )}
                >
                    Submissions ({submissionItems.length})
                </button>
            </div>

            {activeItems.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCheck className="h-7 w-7" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-zinc-900">Nothing pending here</h2>
                    <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
                        Submitted approval requests and reviewer decisions will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {activeItems.map((item) => {
                        const post = item.post;
                        const media = firstMediaUrl(post?.media_url);
                        const platforms = normalizePlatforms(post);
                        const sched = post?.scheduled_at ? format(parseISO(post.scheduled_at), 'EEE, MMM d, yyyy h:mm a') : '—';

                        return (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm"
                            >
                                <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row">
                                    <div className="min-w-0 flex-1 space-y-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-bold text-zinc-900">
                                                    {post?.title || 'Untitled post'}
                                                </h2>
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-full border px-2.5 py-0.5 font-bold capitalize',
                                                            item.status === 'pending' &&
                                                                'border-amber-200 bg-amber-50 text-amber-900',
                                                            item.status === 'approved' &&
                                                                'border-emerald-200 bg-emerald-50 text-emerald-900',
                                                            item.status === 'rejected' &&
                                                                'border-red-200 bg-red-50 text-red-800',
                                                            item.status === 'changes_requested' &&
                                                                'border-violet-200 bg-violet-50 text-violet-900'
                                                        )}
                                                    >
                                                        Approval: {item.status.replace('_', ' ')}
                                                    </span>
                                                    {post?.approval_status && (
                                                        <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-semibold text-zinc-700 capitalize">
                                                            Post: {post.approval_status}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 font-semibold text-zinc-600 capitalize">
                                                        Publish status: {post?.status || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {platforms.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Layers className="h-4 w-4 text-zinc-400" />
                                                {platforms.map((p) => (
                                                    <span
                                                        key={p}
                                                        className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-bold capitalize text-zinc-700"
                                                    >
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {post?.description ? (
                                            <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                                {post.description}
                                            </p>
                                        ) : (
                                            <p className="text-sm italic text-zinc-400">No caption or description.</p>
                                        )}

                                        <div className="grid gap-2 sm:grid-cols-2 text-sm text-zinc-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 shrink-0 text-zinc-400" />
                                                <span>
                                                    <span className="font-semibold text-zinc-800">Scheduled:</span>{' '}
                                                    {sched}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                                                <span>
                                                    <span className="font-semibold text-zinc-800">Requested:</span>{' '}
                                                    {format(parseISO(item.requested_at), 'MMM d, yyyy h:mm a')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 sm:col-span-2">
                                                <User className="h-4 w-4 shrink-0 text-zinc-400" />
                                                <span>
                                                    <span className="font-semibold text-zinc-800">Requested by:</span>{' '}
                                                    {item.requester?.name ||
                                                        item.requester?.email ||
                                                        item.requester?.user_id ||
                                                        'Unknown'}
                                                </span>
                                            </div>
                                        </div>

                                        {item.reviewers.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
                                                    Reviewers
                                                </p>
                                                <ul className="flex flex-wrap gap-2">
                                                    {item.reviewers.map((r) => (
                                                        <li
                                                            key={r.reviewer_user_id}
                                                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
                                                        >
                                                            <span className="font-bold text-zinc-800">
                                                                {r.user?.name || r.user?.email || r.reviewer_user_id}
                                                            </span>
                                                            <span className="mx-1.5 text-zinc-400">·</span>
                                                            <span className="font-semibold capitalize text-zinc-600">
                                                                {r.decision}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {tab === 'inbox' && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                    disabled={actingId === item.id}
                                                    onClick={() => decide(item.id, 'approved')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl font-bold border-amber-200 text-amber-700 hover:bg-amber-50"
                                                    disabled={actingId === item.id}
                                                    onClick={() => decide(item.id, 'changes_requested')}
                                                >
                                                    Request changes
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl font-bold border-red-200 text-red-700 hover:bg-red-50"
                                                    disabled={actingId === item.id}
                                                    onClick={() => decide(item.id, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full shrink-0 lg:w-[340px]">
                                        {media ? (
                                            <ApprovalMedia url={media} />
                                        ) : (
                                            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-400">
                                                No media attached
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
