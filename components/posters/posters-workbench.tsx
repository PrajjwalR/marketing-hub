'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { PostersAiHelpSheet, type AiHelpSelection } from './posters-ai-help-sheet';
import { PostersRegenerateModal, type PosterGenerationRecord } from './posters-regenerate-modal';
import { AddToStrategyModal } from './add-to-strategy-modal';
import type { StrategyPostersContext } from '@/lib/strategy-posters-context';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Download,
    Image as ImageIcon,
    Upload,
    Wand2,
    Film,
    Sparkles,
    CheckCircle2,
    ThumbsUp,
    RotateCcw,
    ImagePlus,
    CalendarPlus,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

const LANDING_BTN =
    'bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 rounded-full font-medium text-[15px] shadow-md transition-all';

export type WorkbenchType = 'image' | 'video';

function StepHeader({
    step,
    title,
    hint,
    icon,
}: {
    step: number;
    title: string;
    hint?: string;
    icon: ReactNode;
}) {
    return (
        <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                {step}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <div className="text-zinc-700">{icon}</div>
                    <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                </div>
                {hint ? <p className="mt-0.5 text-xs text-zinc-500">{hint}</p> : null}
            </div>
        </div>
    );
}

function UploadTile({
    label,
    accept,
    onFile,
    previewUrl,
    previewAsVideo,
}: {
    label: string;
    accept: string;
    onFile: (file: File) => void;
    previewUrl?: string | null;
    previewAsVideo?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = '';
                    onFile(file);
                }}
            />
            <button
                type="button"
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-5 text-left transition-colors hover:bg-zinc-100"
                onClick={() => inputRef.current?.click()}
            >
                {previewUrl ? (
                    previewAsVideo ? (
                        <video src={previewUrl} muted playsInline className="absolute inset-0 h-full w-full object-contain" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            alt=""
                            src={previewUrl}
                            className="absolute inset-0 h-full w-full object-contain"
                        />
                    )
                ) : null}
                <div
                    className={`relative z-10 flex flex-col items-center gap-2 transition-opacity ${
                        previewUrl ? 'opacity-0 group-hover:opacity-100' : ''
                    }`}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
                        <Upload className="h-5 w-5 text-zinc-700" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-zinc-900">
                            {previewUrl ? 'Click to change' : label}
                        </p>
                            {!previewUrl && (
                            <p className="mt-0.5 text-xs text-zinc-500">
                                Click to upload
                                <span className="text-zinc-400"> ({accept.includes('video') ? 'MP4, WebM' : 'PNG/JPG'})</span>
                            </p>
                        )}
                    </div>
                </div>
                <div
                    className={`absolute inset-0 transition-opacity ${
                        previewUrl ? 'bg-black/40 opacity-0 group-hover:opacity-100' : ''
                    }`}
                />
            </button>
        </div>
    );
}

function GalleryPickerContent({ onSelect }: { onSelect: (url: string) => void }) {
    const [media, setMedia] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const auth = getAuth(app);
        auth.currentUser?.getIdToken(true).then((token) => {
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            return fetch('/api/media?all=true', { headers });
        }).then((res) => res.json()).then((data) => {
            if (cancelled) return;
            const items = Array.isArray(data) ? data : [];
            setMedia(items.filter((m: { type?: string }) => m.type?.startsWith('image/')));
        }).catch(() => {}).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <p className="text-sm text-zinc-500">Loading gallery…</p>
                </div>
            ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ImageIcon className="h-12 w-12 text-zinc-300 mb-3" />
                    <p className="text-sm font-medium text-zinc-600">No images in gallery</p>
                    <p className="text-xs text-zinc-500 mt-1">Upload images in the Gallery section first.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1">
                    {media.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item.url)}
                            className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-[#f2d412] hover:ring-2 hover:ring-[#f2d412]/30 transition-all"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ResultPreview({ type, previewUrl }: { type: WorkbenchType; previewUrl?: string | null }) {
    const emptyLabel = type === 'image' ? 'Your poster will appear here' : 'Your video will appear here';
    return (
        <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Output
                </div>
                <div className="aspect-video w-full bg-zinc-100">
                    {previewUrl ? (
                        type === 'video' ? (
                            <video src={previewUrl} controls loop playsInline className="h-full w-full object-contain" />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewUrl} alt="" className="h-full w-full object-contain" />
                        )
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
                            <Skeleton className="h-20 w-32 rounded-lg" />
                            <p className="text-xs text-zinc-500">{emptyLabel}</p>
                        </div>
                    )}
                </div>
            </div>
            {/* actions are rendered by parent */}
        </div>
    );
}

function defaultFormatForStrategyPost(contentType: string, workbenchType: WorkbenchType): string {
    const c = contentType.toLowerCase();
    if (workbenchType === 'video') return 'reels-9-16';
    if (c === 'reel' || c === 'video') return 'reels-9-16';
    if (c === 'carousel') return 'portrait-4-5';
    if (c === 'text_post') return 'landscape-16-9';
    return 'square-1-1';
}

export function PostersWorkbench({
    title,
    subtitle,
    type,
    strategyContext = null,
}: {
    title: string;
    subtitle: string;
    type: WorkbenchType;
    /** Loaded from ?strategyId=&postId= — keeps AI Help aligned with that strategy post */
    strategyContext?: StrategyPostersContext | null;
}) {
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [referenceGalleryUrl, setReferenceGalleryUrl] = useState<string | null>(null);
    const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [format, setFormat] = useState(type === 'image' ? 'landscape-16-9' : 'reels-9-16');
    const [style, setStyle] = useState('clean-modern');
    const [tone, setTone] = useState('brand-safe');
    const [isGenerating, setIsGenerating] = useState(false);
    const [outputUrl, setOutputUrl] = useState<string | null>(null);
    const [lastGeneration, setLastGeneration] = useState<PosterGenerationRecord | null>(null);
    const [currentGenerations, setCurrentGenerations] = useState<PosterGenerationRecord[]>([]);
    const [projects, setProjects] = useState<Array<{ id: number; referencePreview: string; generations: PosterGenerationRecord[] }>>([]);
    const [previousGenerations, setPreviousGenerations] = useState<PosterGenerationRecord[]>([]);
    const [selectedProjectKey, setSelectedProjectKey] = useState<string>('1');
    const projectIdRef = useRef(0);
    const projectPreviewsRef = useRef<string[]>([]);
    const [aiHelpOpen, setAiHelpOpen] = useState(false);
    const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
    const [addToStrategyModalOpen, setAddToStrategyModalOpen] = useState(false);
    const [addToStrategyMediaUrl, setAddToStrategyMediaUrl] = useState<string | null>(null);
    const didApplyStrategyDefaults = useRef(false);
    const didPrefillDescription = useRef(false);

    const previewUrl = useMemo(() => {
        if (referenceFile) return URL.createObjectURL(referenceFile);
        if (referenceGalleryUrl) return referenceGalleryUrl;
        return null;
    }, [referenceFile, referenceGalleryUrl]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    function handleReferenceChange(newFile: File | null, galleryUrl?: string | null) {
        if (type === 'image' && (referenceFile || referenceGalleryUrl) && currentGenerations.length > 0) {
            const refPreview = referenceFile ? URL.createObjectURL(referenceFile) : referenceGalleryUrl!;
            projectPreviewsRef.current.push(refPreview);
            projectIdRef.current += 1;
            setProjects((prev) => [...prev, { id: projectIdRef.current, referencePreview: refPreview, generations: currentGenerations }]);
        }
        setReferenceFile(newFile ?? null);
        setReferenceGalleryUrl(galleryUrl ?? null);
        setOutputUrl(null);
        setLastGeneration(null);
        setCurrentGenerations([]);
        setDescription('');
        setRequirements('');
    }

    useEffect(() => {
        return () => {
            projectPreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
            projectPreviewsRef.current = [];
        };
    }, []);

    useEffect(() => {
        const auth = getAuth(app);
        const p = auth.currentUser ? auth.currentUser.getIdToken(true) : Promise.resolve(null);
        p.then((token) => {
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            return fetch(`/api/posters/generations?limit=50&type=${type}`, { headers });
        })
            .then((res) => res.json())
            .then((data) => {
                if (data?.generations) setPreviousGenerations(data.generations);
            })
            .catch(() => {});
    }, [type]);

    useEffect(() => {
        didApplyStrategyDefaults.current = false;
        didPrefillDescription.current = false;
    }, [strategyContext?.strategyId, strategyContext?.post.id]);

    useEffect(() => {
        if (!strategyContext || didApplyStrategyDefaults.current) return;
        didApplyStrategyDefaults.current = true;
        setFormat(defaultFormatForStrategyPost(strategyContext.post.contentType, type));
    }, [strategyContext, type]);

    useEffect(() => {
        if (!strategyContext || didPrefillDescription.current) return;
        const parts = [strategyContext.post.idea, strategyContext.post.caption].filter(
            (x): x is string => typeof x === 'string' && x.trim().length > 0
        );
        if (parts.length) {
            setDescription(parts.join('\n\n'));
            didPrefillDescription.current = true;
        }
    }, [strategyContext]);

    const canGenerate = description.trim().length > 0;

    const projectOptions = useMemo(() => {
        const opts: Array<{ key: string; label: string; previewUrl: string | null; generations: PosterGenerationRecord[] }> = [];
        if (previousGenerations.length > 0) {
            opts.push({
                key: '1',
                label: 'Project 1',
                previewUrl: previousGenerations[0]?.output_url ?? null,
                generations: previousGenerations,
            });
        }
        projects.forEach((p, i) => {
            opts.push({
                key: `proj-${p.id}`,
                label: `Project ${(previousGenerations.length > 0 ? 1 : 0) + i + 1}`,
                previewUrl: p.referencePreview,
                generations: p.generations,
            });
        });
        if (currentGenerations.length > 0) {
            opts.push({
                key: 'current',
                label: 'Current project',
                previewUrl: previewUrl ?? currentGenerations[0]?.output_url ?? null,
                generations: currentGenerations,
            });
        }
        return opts;
    }, [previousGenerations, projects, currentGenerations, previewUrl]);

    const selectedProject = useMemo(
        () => projectOptions.find((o) => o.key === selectedProjectKey) ?? projectOptions[0],
        [projectOptions, selectedProjectKey]
    );

    useEffect(() => {
        if (projectOptions.length > 0 && !projectOptions.some((o) => o.key === selectedProjectKey)) {
            setSelectedProjectKey(projectOptions[0]!.key);
        }
    }, [projectOptions, selectedProjectKey]);

    function addGeneration(gen: PosterGenerationRecord) {
        setLastGeneration(gen);
        setOutputUrl(gen.output_url ?? null);
        setCurrentGenerations((prev) => [gen, ...prev]);
    }

    async function doSaveGeneration(id: string) {
        try {
            await fetch(`/api/posters/generations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ saved: true }),
            });
            setLastGeneration((g) => (g?.id === id ? { ...g, saved: true } : g));
            setCurrentGenerations((prev) => prev.map((g) => (g.id === id ? { ...g, saved: true } : g)));
            setProjects((prev) => prev.map((p) => ({ ...p, generations: p.generations.map((g) => (g.id === id ? { ...g, saved: true } : g)) })));
            toast.success('Saved');
        } catch {
            toast.error('Failed to save');
        }
    }

    async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
        if (file.type.startsWith('video/')) {
            return videoToFirstFrameBase64(file);
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.includes(',') ? result.split(',')[1]! : result;
                resolve({ base64, mimeType: file.type || 'image/png' });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
        const res = await fetch(url, { mode: 'cors' });
        const blob = await res.blob();
        const mimeType = blob.type || 'image/png';
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.includes(',') ? result.split(',')[1]! : result;
                resolve({ base64, mimeType });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    }

    async function videoToFirstFrameBase64(file: File): Promise<{ base64: string; mimeType: string }> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.onloadeddata = () => {
                video.currentTime = 0.1;
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1]! : dataUrl;
                URL.revokeObjectURL(video.src);
                resolve({ base64, mimeType: 'image/png' });
            };
            video.onerror = () => {
                URL.revokeObjectURL(video.src);
                reject(new Error('Failed to load video'));
            };
            video.src = URL.createObjectURL(file);
        });
    }

    return (
        <>
        <Card className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold tracking-widest uppercase text-[#239047]">
                            Content Creation
                        </p>
                        <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-900">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
                        {strategyContext && (
                            <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs text-indigo-950">
                                <span className="font-semibold">Strategy post:</span>{' '}
                                {strategyContext.strategyName} · Day {strategyContext.post.day} ·{' '}
                                <span className="capitalize">{strategyContext.post.platform}</span> ·{' '}
                                <span className="capitalize">{strategyContext.post.contentType.replace(/_/g, ' ')}</span>
                                {strategyContext.scheduledDateLabel
                                    ? ` · ${strategyContext.scheduledDateLabel}`
                                    : ''}
                                . AI Help suggestions will match this post.
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-600">
                        <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                        AI assisted prompt builder
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {/* Step 1 */ }
                    <Card className="rounded-lg border border-zinc-200 bg-white p-3 shadow-none">
                        <StepHeader
                            step={1}
                            title="Pick your reference"
                            hint={type === 'image' ? 'Upload a brand asset or inspiration image.' : 'Upload a video as reference.'}
                            icon={type === 'image' ? <ImageIcon className="h-4 w-4" /> : <Film className="h-4 w-4" />}
                        />
                        <div className="mt-3 space-y-2">
                            {type === 'image' ? (
                                <>
                                    <UploadTile
                                        label="Upload image"
                                        accept="image/*"
                                        previewUrl={previewUrl}
                                        onFile={(file) => handleReferenceChange(file, null)}
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 rounded-lg gap-2 border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                                        onClick={() => setGalleryPickerOpen(true)}
                                    >
                                        <ImagePlus className="h-5 w-5 text-zinc-600" />
                                        Upload from gallery
                                    </Button>
                                </>
                            ) : (
                                <UploadTile
                                    label="Upload video"
                                    accept="video/*"
                                    previewUrl={previewUrl}
                                    previewAsVideo
                                    onFile={(file) => setReferenceFile(file)}
                                />
                            )}
                        </div>
                    </Card>

                    {/* Step 2 */ }
                    <Card className="rounded-lg border border-zinc-200 bg-white p-3 shadow-none">
                        <StepHeader
                            step={2}
                            title="What do you want to generate?"
                            hint="Describe your idea or use AI help for suggestions."
                            icon={<Wand2 className="h-4 w-4" />}
                        />
                        <div className="mt-3 space-y-2">
                            <div className="space-y-1">
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={type === 'image' ? 'Example: A clean promo poster for 50% OFF summer sale' : 'Example: A short reel for product launch with smooth zoom-in'}
                                    className="min-h-16"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 pb-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Regional Trend (Style)</label>
                                    <Select value={style} onValueChange={setStyle}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-zinc-50 border-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="clean-modern">Standard (Corporate)</SelectItem>
                                            <SelectItem value="bollywood-drama">Bollywood Dramatic ✨</SelectItem>
                                            <SelectItem value="ipl-fever">Cricket / Match Day 🏏</SelectItem>
                                            <SelectItem value="desi-wedding">Big Fat Indian Wedding 🎊</SelectItem>
                                            <SelectItem value="gully-rap">Indian Street / Gully Rap 🎤</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Local Tone</label>
                                    <Select value={tone} onValueChange={setTone}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-zinc-50 border-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="brand-safe">Brand Safe (Pro)</SelectItem>
                                            <SelectItem value="gen-z-hinglish">Hinglish Slang</SelectItem>
                                            <SelectItem value="dramatic-desi">Desi Emotional</SelectItem>
                                            <SelectItem value="cricket-hype">Sports Hype</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-9 rounded-full gap-1.5 text-sm"
                                onClick={() => setAiHelpOpen(true)}
                            >
                                <Sparkles className="h-4 w-4" />
                                AI Help – get prompt suggestions
                            </Button>

                            {outputUrl && lastGeneration && (
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-2.5 space-y-1.5">
                                    <p className="text-sm font-medium text-zinc-800">Did you like the content?</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full gap-1.5"
                                            disabled={lastGeneration.saved}
                                            onClick={() => doSaveGeneration(lastGeneration.id)}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            {lastGeneration.saved ? 'Saved' : 'Save'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className={`rounded-full gap-1.5 ${LANDING_BTN}`}
                                            onClick={() => setRegenerateModalOpen(true)}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button
                                className={`mt-0.5 w-full h-10 px-5 gap-2 ${LANDING_BTN}`}
                                disabled={!canGenerate || isGenerating || !!outputUrl}
                                onClick={async () => {
                                    setIsGenerating(true);
                                    try {
                                        let referenceImageBase64: string | undefined;
                                        let referenceImageMimeType: string | undefined;
                                        if (referenceFile) {
                                            const { base64, mimeType } = await fileToBase64(referenceFile);
                                            referenceImageBase64 = base64;
                                            referenceImageMimeType = mimeType;
                                        } else if (referenceGalleryUrl) {
                                            const { base64, mimeType } = await urlToBase64(referenceGalleryUrl);
                                            referenceImageBase64 = base64;
                                            referenceImageMimeType = mimeType;
                                        }
                                        const auth = getAuth(app);
                                        const token = await auth.currentUser?.getIdToken(true);
                                        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                        if (token) headers['Authorization'] = `Bearer ${token}`;
                                        const res = await fetch('/api/posters/generate', {
                                            method: 'POST',
                                            headers,
                                            body: JSON.stringify({
                                                type,
                                                description: description.trim(),
                                                requirements: requirements.trim() || undefined,
                                                format,
                                                style,
                                                tone,
                                                referenceImageBase64,
                                                referenceImageMimeType,
                                            }),
                                        });
                                        const data = await res.json().catch(() => ({}));
                                        if (!res.ok) throw new Error(data.error || 'Failed to generate');

                                        if (data.generationId && data.outputUrl) {
                                            const gen: PosterGenerationRecord = {
                                                id: data.generationId,
                                                type,
                                                output_url: data.outputUrl,
                                                description: description.trim(),
                                                requirements: requirements.trim() || null,
                                                format,
                                                style,
                                                tone,
                                                prompt: typeof data.prompt === 'string' ? data.prompt : null,
                                                negative_prompt:
                                                    typeof data.negativePrompt === 'string' ? data.negativePrompt : null,
                                                parent_id: data.parentId ?? null,
                                                saved: false,
                                            };
                                            addGeneration(gen);
                                        } else {
                                            setOutputUrl(data.outputUrl ?? null);
                                        }

                                        toast.success(type === 'image' ? 'Poster generated' : 'Video generated');
                                    } catch (e) {
                                        const msg = e instanceof Error ? e.message : 'Failed to generate';
                                        toast.error(msg);
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                }}
                            >
                                <Sparkles className="h-5 w-5" />
                                {isGenerating ? 'Generating…' : type === 'image' ? 'Generate poster' : 'Generate video'}
                            </Button>
                        </div>
                    </Card>

                    {/* Step 3 */ }
                    <Card className="rounded-lg border border-zinc-200 bg-white p-3 shadow-none">
                        <StepHeader
                            step={3}
                            title="Download result"
                            hint="Preview your output, then download when ready."
                            icon={<Download className="h-4 w-4" />}
                        />
                        <div className="mt-3">
                            <ResultPreview type={type} previewUrl={outputUrl} />
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Button
                                    className="rounded-full"
                                    variant="outline"
                                    disabled={!outputUrl}
                                    asChild={!!outputUrl}
                                >
                                    {outputUrl ? (
                                        <a href={outputUrl} download target="_blank" rel="noreferrer">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </a>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Download
                                        </>
                                    )}
                                </Button>
                            </div>

                            {!outputUrl && (
                                <p className="mt-2 text-xs text-zinc-500">
                                    Generate to see your output.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                {type === 'image' && (
                    <div className="border-t border-zinc-200 px-4 py-3">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-zinc-800">My generated posters</p>
                            {projectOptions.length > 1 && (
                                <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                                    <SelectTrigger className="w-[140px] h-9 border-zinc-200 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectOptions.map((opt) => (
                                            <SelectItem key={opt.key} value={opt.key}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        {projectOptions.length === 0 || !selectedProject ? (
                            <p className="text-sm text-zinc-500 py-4 text-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50">
                                No posters yet. Generate your first one above.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {selectedProject.generations.map((g, idx) => {
                                    const num = selectedProject.generations.length - idx;
                                    const url = g.output_url ?? null;
                                    return (
                                        <div
                                            key={g.id}
                                            className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 hover:border-zinc-300 hover:shadow-md transition-all"
                                        >
                                            <a
                                                href={url ?? '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block w-full h-full"
                                            >
                                                {url ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full" />
                                                )}
                                            </a>
                                            <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-semibold text-white">
                                                {num}
                                            </div>
                                            {url && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="absolute bottom-2 right-2 h-8 px-2 gap-1 rounded-full text-xs font-medium bg-white/95 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setAddToStrategyMediaUrl(url);
                                                        setAddToStrategyModalOpen(true);
                                                    }}
                                                >
                                                    <CalendarPlus className="h-3.5 w-3.5" />
                                                    Add to strategy
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>

        <PostersRegenerateModal
            open={regenerateModalOpen}
            onOpenChange={setRegenerateModalOpen}
            type={type}
            generation={lastGeneration}
            strategyContext={strategyContext}
            onRegenerate={async (params) => {
                setIsGenerating(true);
                try {
                    let referenceImageBase64: string | undefined;
                    let referenceImageMimeType: string | undefined;
                    if (referenceFile) {
                        const { base64, mimeType } = await fileToBase64(referenceFile);
                        referenceImageBase64 = base64;
                        referenceImageMimeType = mimeType;
                    } else if (referenceGalleryUrl) {
                        const { base64, mimeType } = await urlToBase64(referenceGalleryUrl);
                        referenceImageBase64 = base64;
                        referenceImageMimeType = mimeType;
                    }
                    const auth = getAuth(app);
                    const token = await auth.currentUser?.getIdToken(true);
                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;
                    const res = await fetch('/api/posters/generate', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            type,
                            description: params.description,
                            requirements: params.requirements || undefined,
                            format: params.format,
                            style: params.style,
                            tone: params.tone,
                            referenceImageBase64,
                            referenceImageMimeType,
                            parentId: params.parentId,
                        }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data.error || 'Failed to generate');
                    if (data.generationId && data.outputUrl) {
                        const gen: PosterGenerationRecord = {
                            id: data.generationId,
                            type,
                            output_url: data.outputUrl,
                            description: params.description,
                            requirements: params.requirements || null,
                            format: params.format,
                            style: params.style,
                            tone: params.tone,
                            prompt: typeof data.prompt === 'string' ? data.prompt : null,
                            negative_prompt:
                                typeof data.negativePrompt === 'string' ? data.negativePrompt : null,
                            parent_id: params.parentId,
                            saved: false,
                        };
                        addGeneration(gen);
                        setDescription(params.description);
                        setRequirements(params.requirements);
                        setFormat(params.format);
                        setStyle(params.style);
                        setTone(params.tone);
                    }
                    toast.success('Regenerated');
                } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Failed to regenerate');
                } finally {
                    setIsGenerating(false);
                }
            }}
        />

        <Sheet open={galleryPickerOpen} onOpenChange={setGalleryPickerOpen}>
            <SheetContent side="right" className="flex flex-col w-full sm:max-w-xl overflow-hidden">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ImagePlus className="h-5 w-5" />
                        Pick from gallery
                    </SheetTitle>
                </SheetHeader>
                <GalleryPickerContent
                    onSelect={(url) => {
                        handleReferenceChange(null, url);
                        setGalleryPickerOpen(false);
                    }}
                />
            </SheetContent>
        </Sheet>

        {addToStrategyMediaUrl && (
            <AddToStrategyModal
                open={addToStrategyModalOpen}
                onClose={() => {
                    setAddToStrategyModalOpen(false);
                    setAddToStrategyMediaUrl(null);
                }}
                mediaUrl={addToStrategyMediaUrl}
            />
        )}

        <PostersAiHelpSheet
            open={aiHelpOpen}
            onOpenChange={setAiHelpOpen}
            type={type}
            currentStyle={style}
            currentTone={tone}
            strategyContext={strategyContext}
            onApply={(sel: AiHelpSelection) => {
                setDescription(sel.description);
                setRequirements(sel.requirements);
                setFormat(sel.format);
            }}
        />
    </>
    );
}

