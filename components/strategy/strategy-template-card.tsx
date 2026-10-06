'use client';

import { ArrowRight, Calendar, Rocket, FileText, Palette, Megaphone, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StrategyTemplatePrefill {
    businessType?: string;
    goal?: string;
    theme?: string;
    /**
     * High-level "strategy focus" that tweaks the AI output.
     * Examples: social_growth, marketing_plan, knowledge_based, customer_engagement
     */
    strategyType?: string;
    platforms?: string[];
    durationDays?: number;
}

export interface StrategyTemplate {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    prefill: StrategyTemplatePrefill;
}

const STRATEGY_BADGE: Record<string, string> = {
    social_growth: 'Growth-Based',
    marketing_plan: 'Marketing Plan',
    knowledge_based: 'Knowledge-Based',
    customer_engagement: 'Challenge-Based',
};

const STRATEGY_GRADIENT: Record<string, string> = {
    social_growth: 'bg-linear-to-br from-sky-50 via-cyan-50 to-blue-100/70',
    marketing_plan: 'bg-linear-to-br from-orange-50 via-amber-50 to-orange-100/70',
    knowledge_based: 'bg-linear-to-br from-indigo-50 via-blue-50 to-cyan-100/70',
    customer_engagement: 'bg-linear-to-br from-emerald-50 via-lime-50 to-emerald-100/70',
};

function titleCaseWords(value: string) {
    return value
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('-');
}

function getCardMeta(template: StrategyTemplate) {
    const strategyType = template.prefill.strategyType ?? '';
    const badge = STRATEGY_BADGE[strategyType] ?? titleCaseWords(strategyType || 'Strategy');
    const gradient = STRATEGY_GRADIENT[strategyType] ?? 'bg-linear-to-br from-zinc-50 to-zinc-100/70';
    const inspiredByMatch = template.subtitle.match(/inspired by ([^)]+)\)?/i);
    const inspiredBy = inspiredByMatch?.[1]?.trim() ?? 'Proven brand playbooks';
    return { badge, gradient, inspiredBy };
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
    {
        id: 'content-calendar',
        title: 'Content Calendar',
        subtitle: '30-day content plan',
        icon: Calendar,
        iconBg: 'bg-amber-100 text-amber-600',
        prefill: {
            businessType: 'Other',
            goal: 'brand_awareness',
            theme: 'content_calendar',
            platforms: ['instagram', 'linkedin'],
            durationDays: 30,
        },
    },
    {
        id: 'product-launch',
        title: 'Product Launch Plan',
        subtitle: 'Launch campaigns',
        icon: Rocket,
        iconBg: 'bg-emerald-100 text-emerald-600',
        prefill: {
            businessType: 'Ecommerce',
            goal: 'increase_sales',
            theme: 'product_launch',
            platforms: ['instagram', 'linkedin', 'youtube'],
            durationDays: 14,
        },
    },
    {
        id: 'marketing-strategy',
        title: 'Marketing Strategy Doc',
        subtitle: 'Brand & campaign planning',
        icon: FileText,
        iconBg: 'bg-blue-100 text-blue-600',
        prefill: {
            businessType: 'Agency',
            goal: 'brand_awareness',
            theme: 'marketing_strategy',
            platforms: ['instagram', 'linkedin', 'facebook'],
            durationDays: 30,
        },
    },
    {
        id: 'brand-guidelines',
        title: 'Brand Guidelines',
        subtitle: 'Consistent brand voice',
        icon: Palette,
        iconBg: 'bg-violet-100 text-violet-600',
        prefill: {
            businessType: 'Personal Brand',
            goal: 'brand_awareness',
            theme: 'brand_guidelines',
            platforms: ['instagram', 'linkedin'],
            durationDays: 30,
        },
    },
    {
        id: 'campaign-brief',
        title: 'Campaign Brief',
        subtitle: 'Targeted campaigns',
        icon: Megaphone,
        iconBg: 'bg-rose-100 text-rose-600',
        prefill: {
            businessType: 'Other',
            goal: 'engagement',
            theme: 'campaign',
            platforms: ['instagram', 'facebook', 'youtube'],
            durationDays: 14,
        },
    },
    {
        id: 'social-media',
        title: 'Social Media',
        subtitle: 'Cross-platform presence',
        icon: Sparkles,
        iconBg: 'bg-indigo-100 text-indigo-600',
        prefill: {
            businessType: 'Other',
            goal: 'increase_followers',
            theme: 'social_media',
            platforms: ['instagram', 'linkedin', 'facebook', 'youtube'],
            durationDays: 30,
        },
    },
    {
        id: 'ecommerce-promo',
        title: 'E-commerce Promotions',
        subtitle: 'Sales & offers',
        icon: ShoppingBag,
        iconBg: 'bg-orange-100 text-orange-600',
        prefill: {
            businessType: 'Ecommerce',
            goal: 'increase_sales',
            theme: 'promotional',
            platforms: ['instagram', 'facebook'],
            durationDays: 14,
        },
    },
];

interface StrategyTemplateCardProps {
    template: StrategyTemplate;
    onClick: () => void;
    className?: string;
}

export function StrategyTemplateCard({ template, onClick, className }: StrategyTemplateCardProps) {
    const Icon = template.icon;
    const { badge, inspiredBy } = getCardMeta(template);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'ae-tile ae-tile-interactive ae-contour group flex min-h-[176px] w-[200px] shrink-0 flex-col items-start p-4 text-left sm:w-[214px]',
                className
            )}
        >
            <div className="relative flex w-full items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff7dc_0%,#f9c02a_45%,#c98009_100%)] shadow-[inset_0_-3px_0_rgba(109,60,18,0.35),inset_0_2px_0_rgba(255,255,255,0.6)]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-800 text-gold-200">
                        <Icon className="h-4 w-4" />
                    </span>
                </span>
                <span className="rounded-md bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-800">{badge}</span>
            </div>
            <h3 className="relative mt-auto pt-4 text-base font-extrabold leading-snug text-zinc-900">{template.title}</h3>
            <p className="relative mt-0.5 text-[13px] text-zinc-500">{template.subtitle}</p>
            <div className="relative mt-3 flex w-full items-center justify-between border-t border-dashed border-zinc-200 pt-2.5">
                <span className="truncate text-[11px] text-zinc-500">
                    by <span className="font-semibold text-zinc-700">{inspiredBy}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-1" />
            </div>
        </button>
    );
}
