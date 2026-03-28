'use client';

import { useCalendar, CalendarEvent, SocialConnection, LabelItem } from './calendar-context';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CalendarDays, Loader2, Youtube, Instagram, Video, Bell, Calendar as CalendarIcon, Flag, Megaphone, Trash2, Image as ImageIcon, Linkedin, Facebook, FileVideo, Upload, ChevronRight, ArrowUp, Folder, Search, LayoutGrid, List, FileText, Tags, Plus, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useRef } from 'react';

const EVENT_TYPES = [
    { value: 'event', label: 'Event', icon: CalendarIcon },
    { value: 'post', label: 'Social Post', icon: Megaphone },
    { value: 'reminder', label: 'Reminder', icon: Bell },
    { value: 'deadline', label: 'Deadline', icon: Flag },
];

const COLOR_OPTIONS = [
    { value: 'indigo', label: 'Indigo', swatch: 'bg-indigo-500' },
    { value: 'emerald', label: 'Green', swatch: 'bg-emerald-500' },
    { value: 'rose', label: 'Rose', swatch: 'bg-rose-500' },
    { value: 'amber', label: 'Amber', swatch: 'bg-amber-500' },
    { value: 'violet', label: 'Violet', swatch: 'bg-violet-500' },
    { value: 'cyan', label: 'Cyan', swatch: 'bg-cyan-500' },
];

function PlatformIcon({ platform, className }: { platform: string, className?: string }) {
    switch(platform?.toLowerCase()) {
        case 'youtube': return <Youtube className={cn("text-red-500", className)} />;
        case 'instagram': return <Instagram className={cn("text-pink-500", className)} />;
        case 'tiktok': return <Video className={cn("text-black dark:text-zinc-900", className)} />;
        case 'linkedin': return <Linkedin className={cn("text-blue-600", className)} />;
        case 'facebook': return <Facebook className={cn("text-blue-500", className)} />;
        default: return <Megaphone className={className} />;
    }
}

export function CalendarModal() {
    const { isCreateOpen, setIsCreateOpen, editingEvent, fetchEvents, handleDelete, currentDate, socialConnections } = useCalendar();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState('event');
    const [formAccountId, setFormAccountId] = useState('');
    const [formColor, setFormColor] = useState('indigo');
    const [formStatus, setFormStatus] = useState<'draft' | 'scheduled' | 'published' | 'cancelled'>('scheduled');
    const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [formTime, setFormTime] = useState('09:00');
    const [formEndDate, setFormEndDate] = useState('');
    const [formEndTime, setFormEndTime] = useState('');
    const [formMediaUrl, setFormMediaUrl] = useState('');
    
    // Video Library Selection States
    const [isVideoSelectorOpen, setIsVideoSelectorOpen] = useState(false);
    const [libraryVideos, setLibraryVideos] = useState<any[]>([]);
    const [libraryFolders, setLibraryFolders] = useState<any[]>([]);
    const [libraryMedia, setLibraryMedia] = useState<any[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [currentLibraryFolder, setCurrentLibraryFolder] = useState<any>(null);
    const [libraryBreadcrumbs, setLibraryBreadcrumbs] = useState<any[]>([]);
    const [librarySearchQuery, setLibrarySearchQuery] = useState('');
    const [libraryViewMode, setLibraryViewMode] = useState<'grid' | 'list'>('grid');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [labels, setLabels] = useState<LabelItem[]>([]);
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
    const [newLabelName, setNewLabelName] = useState('');
    const [isSavingLabel, setIsSavingLabel] = useState(false);
    const [reviewers, setReviewers] = useState<Array<{ user_id: string; name: string | null; email: string | null }>>([]);
    const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
    const [approvalRequired, setApprovalRequired] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState<'none' | 'pending' | 'approved' | 'rejected' | 'changes_requested'>('none');

    const selectedAccount = socialConnections.find(c => c.id === formAccountId);

    const fetchLabels = async () => {
        try {
            const res = await fetch('/api/labels');
            if (res.ok) {
                const data = await res.json();
                setLabels(data || []);
            }
        } catch (error) {
            toast.error('Failed to load labels');
        }
    };

    const fetchReviewers = async () => {
        try {
            const res = await fetch('/api/approvals/reviewers');
            if (!res.ok) return;
            const data = await res.json();
            setReviewers(data || []);
        } catch {
            // no-op
        }
    };

    const fetchLibrary = async () => {
        try {
            setIsLoadingLibrary(true);
            const folderId = currentLibraryFolder ? currentLibraryFolder.id : 'null';
            
            const [foldersRes, mediaRes, videosRes] = await Promise.all([
                fetch(`/api/folders?parentId=${folderId}`),
                fetch(`/api/media?folderId=${folderId}`),
                currentLibraryFolder === null ? fetch('/api/videos') : Promise.resolve({ ok: true, json: () => [] }) 
            ]);

            if (foldersRes.ok) setLibraryFolders(await foldersRes.json());
            if (mediaRes.ok) setLibraryMedia(await mediaRes.json());
            if (videosRes.ok && currentLibraryFolder === null) {
                setLibraryVideos(await videosRes.json());
            } else {
                setLibraryVideos([]);
            }
        } catch (error) {
            console.error("Error fetching library:", error);
            toast.error("Failed to load library");
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/media', {
                    method: 'POST',
                    body: formData
                });
                
                if (res.ok) {
                    const data = await res.json();
                    uploadedUrls.push(data.url);
                } else {
                    toast.error(`Failed to upload ${file.name}`);
                }
            }
            
            if (uploadedUrls.length > 0) {
                const currentUrls = formMediaUrl ? formMediaUrl.split(',').map((u: string) => u.trim()) : [];
                const newUrls = [...currentUrls, ...uploadedUrls].join(', ');
                setFormMediaUrl(newUrls);
                toast.success(`Uploaded ${uploadedUrls.length} file(s)`);
            }
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormType('event');
        setFormAccountId('');
        setFormColor('indigo');
        setFormStatus('scheduled');
        setFormDate(format(currentDate, 'yyyy-MM-dd'));
        setFormTime('09:00');
        setFormEndDate('');
        setFormEndTime('');
        setFormMediaUrl('');
        setApprovalRequired(false);
        setApprovalStatus('none');
        setSelectedReviewerIds([]);
    };

    useEffect(() => {
        if (isCreateOpen) {
            if (editingEvent) {
                setFormTitle(editingEvent.title);
                setFormDescription(editingEvent.description || '');
                setFormType(editingEvent.type || 'event');
                setFormAccountId(editingEvent.account_id || '');
                setFormColor(editingEvent.color || 'indigo');
                setFormStatus(((editingEvent.status as 'draft' | 'scheduled' | 'published' | 'cancelled') || 'scheduled'));
                setFormMediaUrl(editingEvent.media_url || '');
                const scheduled = parseISO(editingEvent.scheduled_at);
                setFormDate(format(scheduled, 'yyyy-MM-dd'));
                setFormTime(format(scheduled, 'HH:mm'));
                if (editingEvent.end_at) {
                    const end = parseISO(editingEvent.end_at);
                    setFormEndDate(format(end, 'yyyy-MM-dd'));
                    setFormEndTime(format(end, 'HH:mm'));
                }
                setSelectedLabelIds((editingEvent.labels || []).map((label) => label.id));
                setApprovalRequired(!!editingEvent.approval_required);
                setApprovalStatus((editingEvent.approval_status as any) || 'none');
            } else {
                resetForm();
                if (currentDate) {
                    setFormDate(format(currentDate, 'yyyy-MM-dd'));
                }
                setSelectedLabelIds([]);
            }
            fetchLabels();
            fetchReviewers();
        }
    }, [isCreateOpen, editingEvent, currentDate]);

    useEffect(() => {
        if (!isCreateOpen || !editingEvent || (editingEvent.type || '').toLowerCase() !== 'post') {
            return;
        }
        let cancelled = false;
        setSelectedReviewerIds([]);
        fetch(`/api/approvals/post/${editingEvent.id}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data: { reviewerIds?: string[] }) => {
                if (cancelled) return;
                setSelectedReviewerIds(Array.isArray(data.reviewerIds) ? data.reviewerIds : []);
            })
            .catch(() => {
                if (!cancelled) setSelectedReviewerIds([]);
            });
        return () => {
            cancelled = true;
        };
    }, [isCreateOpen, editingEvent?.id, editingEvent?.type]);

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return;
        setIsSavingLabel(true);
        try {
            const res = await fetch('/api/labels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newLabelName.trim() }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Failed to create label');
            }
            const created = await res.json();
            setLabels((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedLabelIds((prev) => [...prev, created.id]);
            setNewLabelName('');
            toast.success('Label created');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create label');
        } finally {
            setIsSavingLabel(false);
        }
    };

    const handleDeleteLabel = async (labelId: string) => {
        try {
            const res = await fetch(`/api/labels/${labelId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete label');
            setLabels((prev) => prev.filter((label) => label.id !== labelId));
            setSelectedLabelIds((prev) => prev.filter((id) => id !== labelId));
            toast.success('Label deleted');
        } catch {
            toast.error('Failed to delete label');
        }
    };

    const handleRenameLabel = async (label: LabelItem) => {
        const name = window.prompt('Rename label', label.name)?.trim();
        if (!name || name === label.name) return;
        try {
            const res = await fetch(`/api/labels/${label.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error('Failed to rename label');
            const updated = await res.json();
            setLabels((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Label renamed');
        } catch {
            toast.error('Failed to rename label');
        }
    };

    const handleSubmit = async () => {
        if (!formTitle.trim() || !formDate) {
            toast.error('Title and selected date are required');
            return;
        }

        setIsSubmitting(true);
        const scheduled_at = new Date(`${formDate}T${formTime}:00`).toISOString();
        const end_at = formEndDate && formEndTime
            ? new Date(`${formEndDate}T${formEndTime}:00`).toISOString()
            : null;

        const payload: any = {
            title: formTitle.trim(),
            description: formDescription.trim() || null,
            media_url: formMediaUrl.trim() || null,
            type: formType,
            account_id: formType === 'post' ? (formAccountId || null) : null,
            platform: formType === 'post' && selectedAccount ? selectedAccount.platform : null,
            platforms: formType === 'post' && selectedAccount ? [selectedAccount.platform] : [],
            color: formColor,
            scheduled_at,
            end_at,
            label_ids: selectedLabelIds,
            approval_required: approvalRequired,
        };

        if (formType === 'post') {
            payload.status = formStatus;
            payload.published_at = formStatus === 'published' ? new Date().toISOString() : null;
        }

        if (
            editingEvent &&
            formType === 'post' &&
            approvalRequired &&
            approvalStatus === 'pending'
        ) {
            if (selectedReviewerIds.length === 0) {
                toast.error('Pick at least one reviewer while approval is pending.');
                setIsSubmitting(false);
                return;
            }
            payload.reviewer_ids = selectedReviewerIds;
        }

        try {
            if (editingEvent) {
                const res = await fetch(`/api/schedule/${editingEvent.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    toast.success('Event updated');
                    setIsCreateOpen(false);
                    fetchEvents();
                } else {
                    const data = await res.json().catch(() => ({}));
                    toast.error(data?.error || 'Failed to update');
                }
            } else {
                const res = await fetch('/api/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    toast.success(formType === 'post' ? 'Post scheduled!' : 'Event added!');
                    setIsCreateOpen(false);
                    fetchEvents();
                } else {
                    const data = await res.json().catch(() => ({}));
                    toast.error(data?.error || 'Failed to create');
                }
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (editingEvent) {
            await handleDelete(editingEvent.id);
            setDeleteConfirmOpen(false);
            setIsCreateOpen(false);
        }
    };

    const handlePublishNow = async () => {
        if (!editingEvent) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/schedule/${editingEvent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'publish_now' }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to publish');
            toast.success('Post published');
            setFormStatus('published');
            setIsCreateOpen(false);
            fetchEvents();
        } catch (error: any) {
            const message = error?.message || 'Failed to publish now';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitForApproval = async () => {
        if (!editingEvent) return;
        if (!approvalRequired) {
            toast.error('Enable approval required before submitting.');
            return;
        }
        if (selectedReviewerIds.length === 0) {
            toast.error('Pick at least one reviewer.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/approvals/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: editingEvent.id,
                    reviewerIds: selectedReviewerIds,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to submit for approval');
            toast.success('Submitted for approval');
            setApprovalStatus('pending');
            setIsCreateOpen(false);
            fetchEvents();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to submit for approval');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateOpen(false);
                }
            }}>
                <DialogContent className={cn("rounded-[12px] border border-zinc-200 bg-white p-0 overflow-hidden text-zinc-900 shadow-2xl flex flex-col transition-all duration-300", formType === 'post' ? "min-w-7xl w-[95vw] h-[85vh]" : "max-w-xl w-[95vw] h-auto max-h-[85vh]")}>
                    <DialogHeader className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 shrink-0">
                        <DialogTitle className="text-lg font-black text-zinc-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-indigo-600" />
                                {editingEvent ? 'Edit Item' : 'Create New'}
                            </div>
                            {editingEvent && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-zinc-100 hover:text-red-500 rounded-full transition-colors" onClick={() => setDeleteConfirmOpen(true)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex overflow-hidden text-zinc-900">
                        {/* Editor Column */}
                        <div className={cn("p-6 overflow-y-auto no-scrollbar space-y-6", formType === 'post' ? "w-1/2 border-r border-zinc-200" : "w-full")}>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-500">Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {EVENT_TYPES.map(t => {
                                        const Icon = t.icon;
                                        const isSelected = formType === t.value;
                                        return (
                                            <button
                                                key={t.value}
                                                onClick={() => setFormType(t.value)}
                                                className={cn(
                                                    'flex flex-col items-center gap-1.5 rounded-xl p-3 border-2 transition-all text-center',
                                                    isSelected
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                                        : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100'
                                                )}
                                            >
                                                <Icon className={cn('h-5 w-5', isSelected ? 'text-indigo-600' : 'text-zinc-500')} />
                                                <span className="text-xs font-bold">{t.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {formType === 'post' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-zinc-500">Select Account to Publish To</label>
                                        <a href="/dashboard/settings" className="text-xs text-indigo-600 hover:underline">From Settings →</a>
                                    </div>
                                    {socialConnections.length === 0 ? (
                                        <div className="text-sm text-zinc-500 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                                            No social accounts connected. Connect Instagram, LinkedIn, YouTube, etc. in Settings → Social first.
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-3">
                                            {socialConnections.map(account => {
                                                const isSelected = formAccountId === account.id;
                                                return (
                                                    <button
                                                        key={account.id}
                                                        onClick={() => setFormAccountId(account.id)}
                                                        className={cn(
                                                            "relative flex items-center justify-center p-1 rounded-full border-2 transition-all",
                                                            isSelected ? "border-[#fc69ff] scale-105" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                                                        )}
                                                        title={account.profile_name}
                                                    >
                                                        {account.profile_image ? (
                                                            <img src={account.profile_image} alt={account.profile_name} className="w-12 h-12 rounded-full object-cover bg-zinc-100" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
                                                                <PlatformIcon platform={account.platform} className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-200">
                                                            <PlatformIcon platform={account.platform} className="h-3.5 w-3.5" />
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {formType === 'post' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-500">Publishing Status</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['draft', 'scheduled', 'published'] as const).map((status) => {
                                            const selected = formStatus === status;
                                            return (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setFormStatus(status)}
                                                    className={cn(
                                                        'rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors',
                                                        selected
                                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                                            : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                                                    )}
                                                >
                                                    {status}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {formType === 'post' && (
                                <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-zinc-700">Approval Workflow</label>
                                        <button
                                            type="button"
                                            onClick={() => setApprovalRequired((prev) => !prev)}
                                            className={cn(
                                                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold transition-colors",
                                                approvalRequired
                                                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                                    : "border-zinc-200 bg-white text-zinc-600"
                                            )}
                                        >
                                            {approvalRequired ? 'Required' : 'Optional'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Current status: <span className="font-semibold uppercase">{approvalStatus}</span>
                                    </p>
                                    {approvalRequired && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500">Reviewers</label>
                                            <div className="flex flex-wrap gap-2">
                                                {reviewers.map((reviewer) => {
                                                    const selected = selectedReviewerIds.includes(reviewer.user_id);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={reviewer.user_id}
                                                            onClick={() =>
                                                                setSelectedReviewerIds((prev) =>
                                                                    prev.includes(reviewer.user_id)
                                                                        ? prev.filter((id) => id !== reviewer.user_id)
                                                                        : [...prev, reviewer.user_id]
                                                                )
                                                            }
                                                            className={cn(
                                                                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold transition-colors",
                                                                selected
                                                                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                                                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                                                            )}
                                                        >
                                                            {reviewer.name || reviewer.email || reviewer.user_id}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-500 flex items-center gap-2">
                                    <Tags className="h-4 w-4" />
                                    Content Labels
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Add new label..."
                                        value={newLabelName}
                                        onChange={(e) => setNewLabelName(e.target.value)}
                                        className="rounded-xl h-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-indigo-600"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleCreateLabel}
                                        disabled={isSavingLabel || !newLabelName.trim()}
                                        variant="outline"
                                        className="rounded-xl h-10 border-zinc-200 bg-white font-bold"
                                    >
                                        {isSavingLabel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {labels.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {labels.map((label) => {
                                            const selected = selectedLabelIds.includes(label.id);
                                            return (
                                                <div key={label.id} className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedLabelIds((prev) =>
                                                                prev.includes(label.id)
                                                                    ? prev.filter((id) => id !== label.id)
                                                                    : [...prev, label.id]
                                                            );
                                                        }}
                                                        className={cn(
                                                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold transition-colors",
                                                            selected
                                                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                                                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                                                        )}
                                                    >
                                                        {label.name}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRenameLabel(label)}
                                                        className="text-zinc-400 hover:text-zinc-700 text-xs"
                                                        aria-label={`Rename ${label.name}`}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteLabel(label.id)}
                                                        className="text-zinc-400 hover:text-red-500 text-xs"
                                                        aria-label={`Delete ${label.name}`}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500">No labels yet. Create your first label.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-500">Title *</label>
                                <Input
                                    placeholder={formType === 'post' ? 'e.g. Tips for growth...' : 'e.g. Team standup'}
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="rounded-xl h-11 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-indigo-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-500 flex items-center justify-between">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="Add post caption or event details..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="rounded-xl resize-none bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-indigo-600 min-h-[120px]"
                                />
                            </div>

                            {formType === 'post' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-zinc-500">Media (Required for Post)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={(e) => handleFileUpload(e.target.files)} 
                                                className="hidden"
                                                multiple
                                                accept="image/*,video/*"
                                            />
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-xs font-bold rounded-lg border-zinc-200 text-zinc-600 hover:bg-zinc-50 bg-white"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Upload className="h-3.5 w-3.5 mr-1.5 text-blue-500" />}
                                                Upload
                                            </Button>
                                            <Dialog open={isVideoSelectorOpen} onOpenChange={(open) => {
                                                if (open) fetchLibrary();
                                                setIsVideoSelectorOpen(open);
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs font-bold rounded-lg border-zinc-200 text-zinc-600 hover:bg-zinc-50 bg-white">
                                                        <FileVideo className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                                                        Add from Library
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-5xl bg-white border-zinc-200 text-zinc-900 h-[80vh] flex flex-col p-0 overflow-hidden">
                                                    <DialogHeader className="p-6 pb-2 border-b">
                                                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                                                            <Folder className="h-5 w-5 text-amber-500" />
                                                            Select Media from Library
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    
                                                    {/* Library Explorer logic integrated */}
                                                    <div className="flex-1 flex flex-col overflow-hidden">
                                                        {/* Navigation Bar */}
                                                        <div className="p-3 border-b bg-zinc-50 flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 disabled:opacity-30" 
                                                                    onClick={() => {
                                                                        if (libraryBreadcrumbs.length > 0) {
                                                                            const newC = libraryBreadcrumbs.slice(0, -1);
                                                                            setLibraryBreadcrumbs(newC);
                                                                            setCurrentLibraryFolder(newC[newC.length-1] || null);
                                                                            setLibrarySearchQuery('');
                                                                            // Re-fetch handled by useEffect or manual call
                                                                            setTimeout(fetchLibrary, 0);
                                                                        }
                                                                    }}
                                                                    disabled={libraryBreadcrumbs.length === 0}
                                                                >
                                                                    <ArrowUp className="h-4 w-4" />
                                                                </Button>
                                                                <div className="flex-1 flex items-center gap-1 px-3 py-1.5 border border-zinc-200 rounded-md bg-white text-sm">
                                                                    <button onClick={() => { setCurrentLibraryFolder(null); setLibraryBreadcrumbs([]); setTimeout(fetchLibrary, 0); }} className="hover:underline text-zinc-500">Home</button>
                                                                    {libraryBreadcrumbs.map((c, i) => (
                                                                        <div key={c.id} className="flex items-center gap-1">
                                                                            <ChevronRight className="h-3 w-3 text-zinc-400" />
                                                                            <button onClick={() => { 
                                                                                const newC = libraryBreadcrumbs.slice(0, i+1);
                                                                                setLibraryBreadcrumbs(newC);
                                                                                setCurrentLibraryFolder(c);
                                                                                setTimeout(fetchLibrary, 0);
                                                                            }} className="hover:underline text-zinc-500 truncate max-w-[100px]">{c.name}</button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="relative w-64">
                                                                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                                <Input 
                                                                    placeholder="Search..." 
                                                                    className="h-9 pl-9 border-zinc-200 focus-visible:ring-indigo-600" 
                                                                    value={librarySearchQuery}
                                                                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Grid/List */}
                                                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                                            {isLoadingLibrary ? (
                                                                <div className="flex h-full items-center justify-center">
                                                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-6">
                                                                    {/* Folders */}
                                                                    {libraryFolders.length > 0 && (
                                                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                                                            {libraryFolders.filter(f => f.name.toLowerCase().includes(librarySearchQuery.toLowerCase())).map(folder => (
                                                                                <div 
                                                                                    key={folder.id} 
                                                                                    className="flex flex-col items-center gap-2 cursor-pointer group"
                                                                                    onClick={() => { setCurrentLibraryFolder(folder); setLibraryBreadcrumbs([...libraryBreadcrumbs, folder]); setTimeout(fetchLibrary, 0); }}
                                                                                >
                                                                                    <Folder className="h-12 w-12 text-amber-400 fill-amber-400/20 group-hover:scale-110 transition-transform" />
                                                                                    <span className="text-xs font-medium text-zinc-700 truncate w-full text-center">{folder.name}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Media & Videos */}
                                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                                                        {/* Assets */}
                                                                        {libraryMedia.filter(m => m.name.toLowerCase().includes(librarySearchQuery.toLowerCase())).map(asset => {
                                                                            const isSelected = formMediaUrl.split(',').map(u => u.trim()).includes(asset.url);
                                                                            return (
                                                                                <div 
                                                                                    key={asset.id} 
                                                                                    className={cn(
                                                                                        "aspect-square rounded-xl border-2 overflow-hidden relative cursor-pointer group transition-all",
                                                                                        isSelected ? "border-indigo-600 shadow-md ring-2 ring-indigo-600/20" : "border-zinc-100 hover:border-zinc-300"
                                                                                    )}
                                                                                    onClick={() => { 
                                                                                        const urls = formMediaUrl ? formMediaUrl.split(',').map(u => u.trim()) : [];
                                                                                        if (isSelected) {
                                                                                            setFormMediaUrl(urls.filter(u => u !== asset.url).join(', '));
                                                                                        } else {
                                                                                            setFormMediaUrl([...urls, asset.url].join(', '));
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {asset.type.startsWith('image/') ? (
                                                                                        <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                                                                                            <FileText className="h-8 w-8 text-zinc-300" />
                                                                                        </div>
                                                                                    )}
                                                                                    <div className={cn(
                                                                                        "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center",
                                                                                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                                                    )}>
                                                                                        <Button variant={isSelected ? "default" : "secondary"} size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                                                                            {isSelected ? "Selected" : "Select"}
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {/* Videos */}
                                                                        {libraryVideos.filter(v => (v.title||'').toLowerCase().includes(librarySearchQuery.toLowerCase())).map(video => {
                                                                            const isSelected = video.video_url && formMediaUrl.split(',').map(u => u.trim()).includes(video.video_url);
                                                                            return (
                                                                                <div 
                                                                                    key={video.id} 
                                                                                    className={cn(
                                                                                        "aspect-video rounded-xl border-2 overflow-hidden relative cursor-pointer group transition-all",
                                                                                        isSelected ? "border-indigo-600 shadow-md ring-2 ring-indigo-600/20" : "border-zinc-100 hover:border-zinc-300"
                                                                                    )}
                                                                                    onClick={() => { 
                                                                                        if(!video.video_url) return;
                                                                                        const urls = formMediaUrl ? formMediaUrl.split(',').map(u => u.trim()) : [];
                                                                                        if (isSelected) {
                                                                                            setFormMediaUrl(urls.filter(u => u !== video.video_url).join(', '));
                                                                                        } else {
                                                                                            setFormMediaUrl([...urls, video.video_url].join(', '));
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Image src={video.images?.[0]?.url || video.series?.video_style_image || '/placeholder.png'} alt="thumb" fill className="object-cover" />
                                                                                    <div className={cn(
                                                                                        "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center",
                                                                                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                                                    )}>
                                                                                        <Button variant={isSelected ? "default" : "secondary"} size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                                                                            {isSelected ? "Selected" : "Select Video"}
                                                                                        </Button>
                                                                                    </div>
                                                                                    <div className="absolute top-1 left-1">
                                                                                        <Badge className="text-[9px] py-0 px-1 bg-indigo-600 text-white border-0">Generated</Badge>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-4 border-t bg-zinc-50 flex items-center justify-between">
                                                            <div className="text-sm font-medium text-zinc-500">
                                                                {formMediaUrl ? formMediaUrl.split(',').length : 0} items selected
                                                            </div>
                                                            <Button onClick={() => setIsVideoSelectorOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9">
                                                                Done
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            
                                            {formMediaUrl && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setFormMediaUrl('')}
                                                >
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="e.g. https://example.com/image.jpg"
                                        value={formMediaUrl}
                                        onChange={(e) => setFormMediaUrl(e.target.value)}
                                        className="rounded-xl h-11 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-indigo-600"
                                    />
                                    <p className="text-xs text-zinc-500">Paste a direct URL, upload a file, or pick from Library.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-500">Color</label>
                                <div className="flex items-center gap-2">
                                    {COLOR_OPTIONS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setFormColor(c.value)}
                                            className={cn(
                                                'h-8 w-8 rounded-full transition-all border-2',
                                                c.swatch,
                                                formColor === c.value ? 'border-zinc-900 scale-110' : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                                            )}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-zinc-500">Start Date *</label>
                                    <Input
                                        type="date"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="rounded-xl h-11 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-indigo-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-zinc-500">Start Time</label>
                                    <Input
                                        type="time"
                                        value={formTime}
                                        onChange={(e) => setFormTime(e.target.value)}
                                        className="rounded-xl h-11 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-indigo-600"
                                    />
                                </div>
                            </div>

                            {(formType === 'event') && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-500">End Date</label>
                                        <Input
                                            type="date"
                                            value={formEndDate}
                                            onChange={(e) => setFormEndDate(e.target.value)}
                                            className="rounded-xl h-11 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-indigo-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-500">End Time</label>
                                        <Input
                                            type="time"
                                            value={formEndTime}
                                            onChange={(e) => setFormEndTime(e.target.value)}
                                            className="rounded-xl h-11 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-indigo-600"
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Preview Column */}
                        {formType === 'post' && (
                        <div className="w-1/2 bg-zinc-50 p-6 flex flex-col relative overflow-hidden">
                            <h3 className="text-lg font-bold text-zinc-900 mb-6">Preview</h3>
                            
                            <div className="flex-1 flex items-center justify-center">
                                {!selectedAccount ? (
                                    <div className="text-zinc-500 text-center max-w-xs">
                                        <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                        <p>Select a social account to see how your post will look on that specific platform.</p>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden border border-zinc-200 relative" style={{ color: '#000' }}>
                                        {/* Dynamic Platform Preview Headers */}
                                        <div className="p-3 border-b flex items-center gap-3">
                                            {selectedAccount.profile_image ? (
                                                <img src={selectedAccount.profile_image} className="w-10 h-10 rounded-full object-cover bg-zinc-100" alt="Profile" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                                     <PlatformIcon platform={selectedAccount.platform} className="h-5 w-5" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-sm leading-tight flex items-center gap-1">
                                                    {selectedAccount.profile_name}
                                                    {selectedAccount.platform.toLowerCase() === 'linkedin' && <Linkedin className="w-3 h-3 text-blue-600 ml-1" />}
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    {format(new Date(`${formDate}T${formTime}`), 'MMM dd, h:mm a')} • {selectedAccount.platform}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mock Media Placeholder */}
                                        <div className="w-full aspect-video bg-zinc-50 flex flex-col items-center justify-center text-zinc-300 border-b relative overflow-hidden">
                                            {formMediaUrl ? (
                                                (() => {
                                                    const urls = formMediaUrl.split(',').map(u => u.trim());
                                                    if (urls.length > 1) {
                                                        return (
                                                            <div className="w-full h-full relative overflow-hidden flex flex-col">
                                                                <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
                                                                    {urls.map((url, idx) => (
                                                                        <div key={idx} className="min-w-full h-full snap-center relative border-r last:border-0 border-zinc-200 bg-black flex items-center justify-center">
                                                                            {url.match(/\.(mp4|webm|ogg)$/i) ? (
                                                                                <video src={url} className="w-full h-full object-contain" controls={false} />
                                                                            ) : (
                                                                                <img src={url} alt={`Slide ${idx+1}`} className="w-full h-full object-contain" />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                    Carousel: {urls.length} items
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    const url = urls[0];
                                                    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('youtube.com') || url.includes('vimeo.com') ? (
                                                        <div className="w-full h-full bg-black flex items-center justify-center relative">
                                                            <video src={url} className="w-full h-full object-contain" controls={false} />
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <Video className="h-10 w-10 text-white/50" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <img src={url} alt="Post media" className="w-full h-full object-contain" />
                                                    );
                                                })()
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-10 w-10 mb-2 opacity-30" />
                                                    <span className="text-xs font-medium">Visual Media Placeholder</span>
                                                </>
                                            )}
                                        </div>


                                        {/* Dynamic Text Body */}
                                        <div className="p-4 space-y-2">
                                            {selectedAccount.platform.toLowerCase() === 'youtube' ? (
                                                <>
                                                    <h3 className="font-bold text-lg leading-tight">{formTitle || "Video Title Placeholder"}</h3>
                                                    <p className="text-sm text-zinc-600 line-clamp-2">{formDescription || "Description..."}</p>
                                                </>
                                            ) : (
                                                <>
                                                    {formTitle && <h3 className="font-bold text-sm mb-1">{formTitle}</h3>}
                                                    <p className="text-sm text-zinc-800 whitespace-pre-wrap">
                                                        {formDescription || "Write a caption for your post..."}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* Platform specific footers Mock */}
                                        {selectedAccount.platform.toLowerCase() === 'linkedin' && (
                                            <div className="px-4 pb-3 pt-1 border-t flex items-center gap-4 text-zinc-500 text-xs font-semibold">
                                                <span>👍 Like</span>
                                                <span>💬 Comment</span>
                                                <span>🔄 Repost</span>
                                            </div>
                                        )}
                                        {selectedAccount.platform.toLowerCase() === 'instagram' && (
                                            <div className="px-4 pb-3 pt-2 text-zinc-800 font-bold text-sm">
                                                ♡ 〇 ⩶
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-3 shrink-0">
                        {editingEvent && formType === 'post' && formStatus !== 'published' && (
                            <Button
                                onClick={handlePublishNow}
                                disabled={isSubmitting || (approvalRequired && approvalStatus !== 'approved')}
                                className="h-11 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Publish now
                            </Button>
                        )}
                        {editingEvent && formType === 'post' && approvalRequired && approvalStatus !== 'pending' && approvalStatus !== 'approved' && (
                            <Button
                                onClick={handleSubmitForApproval}
                                disabled={isSubmitting || selectedReviewerIds.length === 0}
                                className="h-11 px-6 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white border-0 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Submit for approval
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            className="h-11 px-6 rounded-xl font-bold border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-all bg-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formTitle.trim() || !formDate || (formType === 'post' && formStatus !== 'draft' && !formAccountId)}
                            className="h-11 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white border-0 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                            ) : editingEvent ? 'Save Changes' : (formType === 'post' ? (formStatus === 'draft' ? 'Save Draft' : formStatus === 'published' ? 'Publish Post' : 'Schedule Post') : 'Add to Calendar')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-2xl border border-zinc-200 bg-white overflow-hidden text-zinc-900 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500">
                            This will permanently remove this calendar item. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl font-bold bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition-all active:scale-95 border-0"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    );
}

