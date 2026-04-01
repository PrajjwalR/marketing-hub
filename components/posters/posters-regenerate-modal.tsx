'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, RotateCcw } from 'lucide-react';
import type { WorkbenchType } from './posters-workbench';
import type { StrategyPostersContext } from '@/lib/strategy-posters-context';

const LANDING_BTN =
    'bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 rounded-full font-medium text-[15px] shadow-md transition-all';

export interface PosterGenerationRecord {
    id: string;
    type?: 'image' | 'video';
    output_url: string | null;
    description: string;
    requirements?: string | null;
    format?: string | null;
    style?: string | null;
    tone?: string | null;
    /** Final prompt sent to the image/video model (from `buildPowerPrompt`) */
    prompt?: string | null;
    negative_prompt?: string | null;
    parent_id?: string | null;
    saved?: boolean;
}

interface PostersRegenerateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: WorkbenchType;
    /** The generation we're regenerating from (has the prompt we used) */
    generation: PosterGenerationRecord | null;
    strategyContext?: StrategyPostersContext | null;
    onRegenerate: (params: {
        description: string;
        requirements: string;
        format: string;
        style: string;
        tone: string;
        parentId: string;
    }) => void;
}

export function PostersRegenerateModal({
    open,
    onOpenChange,
    type,
    generation,
    strategyContext = null,
    onRegenerate,
}: PostersRegenerateModalProps) {
    const [feedback, setFeedback] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const [step, setStep] = useState<'feedback' | 'pick'>('feedback');

    useEffect(() => {
        if (!open) {
            setFeedback('');
            setSuggestions([]);
            setSelectedPrompt(null);
            setStep('feedback');
        }
    }, [open]);

    const originalPrompt = generation?.description ?? '';

    const handleGetRefined = async () => {
        if (!originalPrompt) return;
        setLoading(true);
        try {
            const auth = getAuth(app);
            const token = await auth.currentUser?.getIdToken(true);
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/posters/suggestions', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    type,
                    refine: { originalPrompt, feedback: feedback.trim() || undefined },
                    ...(strategyContext ? { strategyContext } : {}),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to get suggestions');
            setSuggestions(data.suggestions ?? []);
            setSelectedPrompt(null);
            setStep('pick');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = () => {
        const description = selectedPrompt?.trim();
        if (!description || !generation?.id) return;
        onRegenerate({
            description,
            requirements: generation.requirements ?? '',
            format: generation.format ?? 'landscape-16-9',
            style: generation.style ?? 'clean-modern',
            tone: generation.tone ?? 'brand-safe',
            parentId: generation.id,
        });
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex flex-col w-full sm:max-w-xl md:max-w-2xl overflow-hidden"
                showCloseButton={true}
            >
                <SheetHeader className="space-y-2">
                    <SheetTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-[#f2d412]" />
                        Regenerate with feedback
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                {step === 'feedback' ? (
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-zinc-600">
                            The prompt that was used:
                        </p>
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800">
                            {originalPrompt}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-zinc-700">
                                What didn&apos;t you like? Add your suggestions
                            </p>
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="E.g. Make it brighter, less cluttered, different colors, more minimalist..."
                                className="min-h-20"
                            />
                        </div>
                        <Button
                            className={`w-full h-11 gap-2 ${LANDING_BTN}`}
                            disabled={loading}
                            onClick={handleGetRefined}
                        >
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Getting refined prompts…' : 'Get refined prompts'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-zinc-600">
                            Choose a refined prompt:
                        </p>
                        {suggestions.length === 0 ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="max-h-80 overflow-y-auto space-y-3">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedPrompt(s)}
                                        className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                                            selectedPrompt === s
                                                ? 'border-[#f2d412] bg-[#f2d412]/10'
                                                : 'border-zinc-200 hover:border-zinc-300'
                                        }`}
                                    >
                                        <span className="line-clamp-2">{s}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep('feedback')}
                            >
                                Back
                            </Button>
                            <Button
                                className={`flex-1 gap-2 ${LANDING_BTN}`}
                                disabled={!selectedPrompt}
                                onClick={handleRegenerate}
                            >
                                <RotateCcw className="h-4 w-4" />
                                Regenerate
                            </Button>
                        </div>
                    </div>
                )}
                </div>

                <SheetFooter className="pt-4" />
            </SheetContent>
        </Sheet>
    );
}
