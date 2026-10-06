'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, Trash2, ImagePlus, MoreVertical, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface StrategyCardProps {
    id: string;
    name: string;
    platforms: string[];
    durationDays: number;
    createdAt: string;
    startDate?: string | null;
    imageUrl?: string | null;
    postsCount?: number;
    onDelete: (id: string) => Promise<void>;
    onImageUpdate?: () => void;
}

export function StrategyCard({
    id,
    name,
    platforms,
    durationDays,
    createdAt,
    startDate,
    imageUrl,
    postsCount = 0,
    onDelete,
    onImageUpdate,
}: StrategyCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [localImageUrl, setLocalImageUrl] = useState<string | null>(imageUrl ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(id);
            setDeleteOpen(false);
            toast.success('Strategy deleted');
        } catch {
            toast.error('Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        e.target.value = '';
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`/api/strategy/${id}/image`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setLocalImageUrl(data.imageUrl);
            onImageUpdate?.();
            toast.success('Image uploaded');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to upload image';
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const displayImageUrl = localImageUrl ?? imageUrl;
    const platformLabels = platforms
        ?.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(', ') || '—';

    const metadata = [
        platformLabels,
        `${durationDays}d`,
        format(new Date(createdAt), 'dd MMM'),
        startDate ? format(new Date(startDate), 'dd MMM') : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <>
            <Card className="ae-tile ae-tile-interactive group gap-0 overflow-hidden p-0">
                {/* Thumbnail - 16:9 aspect ratio for consistent alignment */}
                <Link href={`/dashboard/strategy/${id}`} className="block relative group/thumb">
                    <div className="relative m-2 mb-0 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 via-zinc-50 to-gold-50">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                            disabled={isUploading}
                        />
                        {/* Hover overlay for change cover; when no image, always clickable for upload */}
                        <button
                            type="button"
                            className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity ${
                                displayImageUrl
                                    ? 'bg-black/40 opacity-0 pointer-events-none group-hover/thumb:opacity-100 group-hover/thumb:pointer-events-auto'
                                    : 'bg-transparent opacity-100 pointer-events-auto'
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            aria-label="Change cover image"
                        >
                            {displayImageUrl ? (
                                <span className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-zinc-800">
                                    Change cover
                                </span>
                            ) : null}
                        </button>
                        {displayImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={displayImageUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-brand-400">
                                <ImagePlus className="h-8 w-8" strokeWidth={1.5} />
                                <span className="text-sm font-medium">No image</span>
                                <span className="text-xs">Click to upload</span>
                            </div>
                        )}
                        {/* Post count badge - YouTube-style duration overlay */}
                        <span className="absolute bottom-2 right-2 rounded-lg bg-brand-900/85 px-2 py-0.5 text-[11px] font-bold text-gold-200 backdrop-blur">
                            {postsCount} posts
                        </span>
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                                <span className="text-sm font-medium text-zinc-600">Uploading...</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Details block - YouTube-style layout */}
                <div className="flex gap-3 px-4 pt-3 pb-3">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-800">
                        <FolderOpen className="h-4 w-4 text-gold-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Link href={`/dashboard/strategy/${id}`} className="block">
                            <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-zinc-900 group-hover:text-brand-800">
                                {name}
                            </h3>
                        </Link>
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{metadata}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                                onClick={(e) => e.preventDefault()}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg border border-zinc-200">
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteOpen(true);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }}
                            >
                                <ImagePlus className="h-4 w-4" />
                                Change cover
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Open button */}
                <div className="px-4 pb-4">
                    <Link href={`/dashboard/strategy/${id}`}>
                        <Button
                            size="sm"
                            className="w-full h-10 justify-between rounded-xl bg-brand-50 px-4 text-brand-800 font-bold text-sm hover:bg-brand-800 hover:text-white"
                        >
                            Open strategy
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </Card>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="rounded-xl border border-zinc-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete strategy?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this strategy and all its posts. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 rounded-lg"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
