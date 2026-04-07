'use client';

import { useState, useEffect } from 'react';
import type { StrategyTemplatePrefill } from './strategy-template-card';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
    'Gym',
    'Jewellery',
    'Ecommerce',
    'SaaS',
    'Restaurant',
    'Personal Brand',
    'Agency',
    'Other',
];
const GOALS = ['Increase Followers', 'Increase Sales', 'Brand Awareness', 'Engagement'];
const STRATEGY_TYPES = [
    { id: 'social_growth', label: 'Grow on Social Media' },
    { id: 'marketing_plan', label: 'Marketing Strategy' },
    { id: 'knowledge_based', label: 'Knowledge-based' },
    { id: 'customer_engagement', label: 'Customer Engagement' },
] as const;
const PLATFORMS = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'youtube', label: 'YouTube' },
];
const DURATIONS = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
];

interface GenerateStrategyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (strategy: { id: string; name: string }) => void;
    prefill?: StrategyTemplatePrefill | null;
}

export function GenerateStrategyModal({
    open,
    onOpenChange,
    onSuccess,
    prefill,
}: GenerateStrategyModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, getIdToken } = useAuth();
    const isTemplateFlow = !!prefill;
    const [businessType, setBusinessType] = useState('');
    const [brandName, setBrandName] = useState('');
    const [isBrandNameLocked, setIsBrandNameLocked] = useState(false);
    const [targetAudience, setTargetAudience] = useState('');
    const [goal, setGoal] = useState('');
    const [strategyType, setStrategyType] = useState<string>('');
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [theme, setTheme] = useState('');
    const [durationDays, setDurationDays] = useState(30);
    const [startDate, setStartDate] = useState<string>('');
    const [coverImage, setCoverImage] = useState<File | null>(null);

    useEffect(() => {
        if (open) {
            setCoverImage(null);
            setIsBrandNameLocked(false);

            // Default to today's date so prebuilt templates don't require manual entry.
            // Users can still edit the date after it's filled.
            setStartDate((prev) => {
                if (prev) return prev;
                const now = new Date();
                const localIsoDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                return localIsoDate;
            });

            if (prefill) {
                if (prefill.businessType) setBusinessType(prefill.businessType);
                if (prefill.goal) setGoal(prefill.goal);
                if (prefill.strategyType) setStrategyType(prefill.strategyType);
                if (prefill.theme) setTheme(prefill.theme);
                if (prefill.platforms?.length) setPlatforms(prefill.platforms);
                if (prefill.durationDays) setDurationDays(prefill.durationDays);
            }

            // For prefilled/template flows: pick brand name from user's settings/profile.
            if (prefill) {
                const fromFirebase = user?.displayName?.trim();
                if (fromFirebase) {
                    setBrandName(fromFirebase);
                    setIsBrandNameLocked(true);
                    return;
                }

                if (!brandName.trim()) {
                    let cancelled = false;

                    (async () => {
                        try {
                            const token = await getIdToken();
                            const res = await fetch('/api/user', {
                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                            });
                            if (!res.ok) return;
                            const data = (await res.json()) as { name?: string };
                            const fromDb = data?.name?.trim();
                            if (!fromDb || cancelled) return;
                            setBrandName(fromDb);
                            setIsBrandNameLocked(true);
                        } catch {
                            // Keep unlocked so user can enter manually.
                        }
                    })();

                    return () => {
                        cancelled = true;
                    };
                }
            }
        }
    }, [open, prefill, user?.displayName, getIdToken]);

    const togglePlatform = (id: string) => {
        setPlatforms((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!brandName.trim()) {
            toast.error('Brand name is required');
            return;
        }
        if (platforms.length === 0) {
            toast.error('Select at least one platform');
            return;
        }
        if (!startDate) {
            toast.error('Start date is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/strategy/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessType: businessType || 'Other',
                    brandName: brandName.trim(),
                    targetAudience: targetAudience.trim(),
                    goal: goal || 'brand_awareness',
                    strategyType: strategyType.trim() || undefined,
                    platforms,
                    theme: theme.trim() || undefined,
                    durationDays,
                    startDate,
                    is_prebuilt: isTemplateFlow,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate strategy');
            }

            if (coverImage && data.strategy?.id) {
                const formData = new FormData();
                formData.append('file', coverImage);
                const imgRes = await fetch(`/api/strategy/${data.strategy.id}/image`, {
                    method: 'POST',
                    body: formData,
                });
                const imgData = await imgRes.json().catch(() => ({}));
                if (!imgRes.ok) {
                    toast.warning(imgData.error || 'Strategy created, but cover image upload failed');
                }
            }

            toast.success('Strategy generated successfully!');
            onSuccess(data.strategy);
            onOpenChange(false);

            // Reset form
            setBusinessType('');
            setBrandName('');
            setIsBrandNameLocked(false);
            setTargetAudience('');
            setGoal('');
            setStrategyType('');
            setPlatforms([]);
            setTheme('');
            setDurationDays(30);
            setStartDate('');
            setCoverImage(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to generate strategy');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SlidePanel
            open={open}
            onClose={() => onOpenChange(false)}
            title="Generate AI Strategy"
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
                        onClick={handleSubmit}
                        disabled={isSubmitting || !brandName.trim() || platforms.length === 0}
                        className="rounded-full font-medium text-[15px] bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate Strategy'
                        )}
                    </Button>
                </div>
            }
        >
            <div className="space-y-5 px-6 py-4 text-zinc-900">
                    <div>
                        <Label className="text-sm font-bold text-zinc-900">Business Type</Label>
                        <Select value={businessType} onValueChange={setBusinessType}>
                            <SelectTrigger
                                disabled={isTemplateFlow}
                                className="mt-1.5 h-11 rounded-xl border-zinc-300 bg-white text-zinc-900"
                            >
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {BUSINESS_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">
                            Brand Name {isBrandNameLocked ? '' : '*'}
                        </Label>
                        <Input
                            placeholder="e.g. Nike"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            disabled={isBrandNameLocked}
                            className="mt-1.5 h-11 rounded-xl border-zinc-300 text-zinc-900 placeholder:text-zinc-500"
                        />
                        {isBrandNameLocked && (
                            <p className="mt-2 text-[12px] text-zinc-500">
                                Using your settings profile name.
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">Target Audience</Label>
                        <Textarea
                            placeholder="Describe your target audience..."
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="mt-1.5 min-h-[80px] rounded-xl border-zinc-300 resize-none text-zinc-900 placeholder:text-zinc-500"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">Goal</Label>
                        <Select value={goal} onValueChange={setGoal}>
                            <SelectTrigger className="mt-1.5 h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 font-medium">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {GOALS.map((g) => (
                                    <SelectItem key={g} value={g.toLowerCase().replace(/\s/g, '_')}>
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">Strategy Focus</Label>
                        <Select value={strategyType} onValueChange={setStrategyType}>
                            <SelectTrigger className="mt-1.5 h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 font-medium">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {STRATEGY_TYPES.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <Label className="text-sm font-bold text-zinc-900">
                                Platforms {isTemplateFlow ? '' : '*'}
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-8 px-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
                                onClick={() => {
                                    const allIds = PLATFORMS.map((p) => p.id);
                                    const hasAll = allIds.every((id) => platforms.includes(id));
                                    setPlatforms(hasAll ? [] : allIds);
                                }}
                            >
                                {PLATFORMS.map((p) => p.id).every((id) => platforms.includes(id))
                                    ? 'Deselect all'
                                    : 'Select all'}
                            </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3">
                            {PLATFORMS.map((p) => (
                                <label
                                    key={p.id}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Checkbox
                                        className="border-zinc-300 shadow-none data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                                        checked={platforms.includes(p.id)}
                                        onCheckedChange={() => togglePlatform(p.id)}
                                    />
                                    <span className="text-sm font-medium">{p.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">Campaign Theme (optional)</Label>
                        <Input
                            placeholder="e.g. Holi, Product Launch, Summer Sale"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            disabled={isTemplateFlow}
                            className="mt-1.5 h-11 rounded-xl border-zinc-300 text-zinc-900 placeholder:text-zinc-500"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">Strategy Duration</Label>
                        <Select
                            value={String(durationDays)}
                            onValueChange={(v) => setDurationDays(Number(v))}
                        >
                            <SelectTrigger
                                className="mt-1.5 h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 font-medium"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DURATIONS.map((d) => (
                                    <SelectItem key={d.value} value={String(d.value)}>
                                        {d.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">
                            Start Date {isTemplateFlow ? '' : '*'}
                        </Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={false}
                            className="mt-1.5 h-11 rounded-xl border-zinc-300 text-zinc-900"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-bold text-zinc-900">Cover Image (optional)</Label>
                        <div
                            onClick={() => document.getElementById('cover-image-input')?.click()}
                            className="mt-1.5 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-6 cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                        >
                            <input
                                id="cover-image-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f && f.type.startsWith('image/')) setCoverImage(f);
                                    e.target.value = '';
                                }}
                            />
                            {coverImage ? (
                                <>
                                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-zinc-100">
                                        <img
                                            src={URL.createObjectURL(coverImage)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-sm text-zinc-500">{coverImage.name}</p>
                                    <p className="text-xs text-zinc-400">Click to change</p>
                                </>
                            ) : (
                                <>
                                    <ImagePlus className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
                                    <p className="text-sm text-zinc-500">Click to upload cover image</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
        </SlidePanel>
    );
}
