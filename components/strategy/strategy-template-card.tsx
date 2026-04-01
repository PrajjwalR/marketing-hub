'use client';

import { Calendar, Rocket, FileText, Palette, Megaphone, ShoppingBag, Sparkles } from 'lucide-react';
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
}

export function StrategyTemplateCard({ template, onClick }: StrategyTemplateCardProps) {
    const Icon = template.icon;
    const { badge, gradient, inspiredBy } = getCardMeta(template);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group flex flex-col items-start text-left rounded-2xl border min-w-[180px] sm:min-w-[200px]',
                'border-zinc-200 bg-white shadow-sm transition-all duration-300 overflow-hidden',
                'hover:shadow-lg hover:-translate-y-0.5 hover:border-zinc-300'
            )}
        >
            <div className={cn('w-full p-4 border-b border-zinc-100', gradient)}>
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-white/90 text-zinc-700 border border-zinc-200">
                    {badge}
                </span>
                <div className="mt-3 flex items-center gap-2">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shadow-sm bg-white', template.iconBg)}>
                        <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-900 leading-tight">{template.title}</h3>
                </div>
            </div>
            <div className="w-full p-4">
                <p className="text-sm text-zinc-600 leading-relaxed">{template.subtitle}</p>
                <p className="text-xs text-zinc-500 mt-2">
                    Inspired by: <span className="font-semibold text-zinc-700">{inspiredBy}</span>
                </p>
            </div>
        </button>
    );
}
