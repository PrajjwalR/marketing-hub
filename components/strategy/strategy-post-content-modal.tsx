'use client';

import { useEffect, useRef, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Link from 'next/link';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Upload, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { StrategyPost } from './edit-strategy-post-modal';

async function bearerHeaders(): Promise<Record<string, string>> {
    const token = await getAuth(app).currentUser?.getIdToken(true);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

function PickFromGeneratedSection({
    strategyId,
    postId,
    onSuccess,
}: {
    strategyId: string;
    postId: string;
    onSuccess: () => void;
}) {
    const [items, setItems] = useState<Array<{ id: string; output_url: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        bearerHeaders()
            .then((headers) => fetch('/api/posters/generations?limit=20&type=image', { headers }))
            .then((res) => res.json())
            .then((data) => setItems((data?.generations ?? []).filter((g: { output_url?: string }) => g.output_url)))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const handleSelect = async (url: string) => {
        setSubmitting(true);
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(await bearerHeaders()),
            };
            const res = await fetch(`/api/strategy/${strategyId}/posts/${postId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ media_url: url, status: 'content_ready' }),
            });
            if (!res.ok) throw new Error('Failed');
            toast.success('Content attached');
            onSuccess();
        } catch {
            toast.error('Failed to attach');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Or pick from generated posters
            </p>
            {loading ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
            ) : items.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4 text-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50">
                    No generated posters yet. Create some in Create Content first.
                </p>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {items.map((g) => (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => handleSelect(g.output_url)}
                            disabled={submitting}
                            className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-[#f2d412] hover:ring-2 hover:ring-[#f2d412]/30 transition-all group"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={g.output_url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            {submitting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface StrategyPostContentModalProps {
    post: StrategyPost | null;
    open: boolean;
    onClose: () => void;
    strategyId: string;
    onSuccess: () => void;
}

export function StrategyPostContentModal({
    post,
    open,
    onClose,
    strategyId,
    onSuccess,
}: StrategyPostContentModalProps) {
    const [activeTab, setActiveTab] = useState<'create' | 'upload'>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!post) return null;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        const file = files[0];
        if (!file) return;

        // Clear the input only after reading the File — clearing first invalidates `files` in some browsers.
        e.target.value = '';

        const mime = file.type || '';
        if (!mime.startsWith('image/') && !mime.startsWith('video/')) {
            toast.error('Please upload an image or video');
            return;
        }

        setIsUploading(true);
        try {
            const auth = await bearerHeaders();
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: auth,
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            const mediaUrl = data.url;
            const patchHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                ...auth,
            };
            const patchRes = await fetch(`/api/strategy/${strategyId}/posts/${post.id}`, {
                method: 'PATCH',
                headers: patchHeaders,
                body: JSON.stringify({
                    media_url: mediaUrl,
                    status: 'content_ready',
                }),
            });
            if (!patchRes.ok) throw new Error('Failed to link media to post');

            toast.success('Content uploaded');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <SlidePanel
            open={open}
            onClose={onClose}
            title="Content for this post"
            subtitle={post.idea || 'Untitled'}
            size="md"
        >
            <div className="px-6 py-4 space-y-6">
                <div className="flex gap-2 p-1 rounded-lg bg-zinc-100">
                    <button
                        type="button"
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'create'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                    >
                        Create with AI
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'upload'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                    >
                        Upload
                    </button>
                </div>

                {activeTab === 'create' ? (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 text-center">
                            <div className="flex justify-center mb-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                    <Sparkles className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-zinc-900 mb-2">Create with AI</h3>
                            <p className="text-sm text-zinc-500 mb-4 max-w-sm mx-auto">
                                Generate posters or videos in Create Content, then add them to this post.
                            </p>
                            <Button asChild className="rounded-full font-medium bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 gap-2">
                                <Link
                                    href={`/dashboard/posters?strategyId=${encodeURIComponent(strategyId)}&postId=${encodeURIComponent(post.id)}`}
                                >
                                    Go to Create Content
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <PickFromGeneratedSection
                            strategyId={strategyId}
                            postId={post.id}
                            onSuccess={() => { onSuccess(); onClose(); }}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-8 cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
                                    <p className="text-sm font-medium text-zinc-600">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-zinc-900">Upload your content</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Image or video for Day {post.day} • {post.platform}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="rounded-full bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-medium"
                                    >
                                        Choose file
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </SlidePanel>
    );
}
