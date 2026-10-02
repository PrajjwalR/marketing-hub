'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight, Home, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HubTabs, useCurrentHub } from '@/components/dashboard/hub-nav';

export type HeroStatItem = { label: string; value: ReactNode; icon?: LucideIcon };

type PageHeroProps = {
    title: ReactNode;
    description?: ReactNode;
    /** Trail after "Home", e.g. ['Content Creation', 'Series'] */
    breadcrumb?: string[];
    icon?: LucideIcon;
    /** Buttons rendered on the right of the banner (use HeroButton for consistent styling). */
    actions?: ReactNode;
    stats?: HeroStatItem[];
    /** White panel that overlaps the bottom edge of the banner (Moneyview "My products" card). */
    overlap?: ReactNode;
    /** id for the h1, used by the product tour. */
    titleId?: string;
    className?: string;
};

/**
 * Green banner header shared by every logged-in screen: breadcrumb, serif title,
 * description, gold actions and optional stat pills.
 */
export function PageHero({
    title,
    description,
    breadcrumb = [],
    icon: Icon,
    actions,
    stats,
    overlap,
    titleId,
    className,
}: PageHeroProps) {
    const hub = useCurrentHub();
    const showSubTabs = !!hub && hub.apps.length >= 2;

    return (
        <div className={cn('mb-5', className)}>
            <section
                className={cn(
                    'ae-hero ae-contour ae-contour-dark -mx-4 px-5 pt-5 sm:-mx-5 sm:px-8 md:mx-0 md:rounded-[24px] md:px-7 md:pt-5',
                    overlap ? 'pb-14 md:pb-16' : 'pb-6'
                )}
            >
                {showSubTabs ? (
                    <HubTabs className="mb-4" />
                ) : (
                <nav aria-label="Breadcrumb" className="relative mb-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-white/55">
                    <Link href="/dashboard" className="flex items-center gap-1 transition-colors hover:text-white">
                        <Home className="h-3.5 w-3.5" />
                        Home
                    </Link>
                    {breadcrumb.map((crumb, i) => (
                        <span key={crumb} className="flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 text-white/35" />
                            <span className={i === breadcrumb.length - 1 ? 'text-gold-300' : undefined}>{crumb}</span>
                        </span>
                    ))}
                </nav>
                )}

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        {Icon && (
                            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_25%,#fff7dc_0%,#f9c02a_45%,#c98009_100%)] text-brand-950 shadow-[inset_0_-3px_0_rgba(109,60,18,0.35),inset_0_2px_0_rgba(255,255,255,0.6)] sm:flex">
                                <Icon className="h-5 w-5" strokeWidth={2} />
                            </span>
                        )}
                        <div className="min-w-0">
                            <h1 id={titleId} className="text-[26px] leading-[1.1] text-white sm:text-[32px]">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/70">{description}</p>
                            )}
                        </div>
                    </div>
                    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
                </div>

                {stats && stats.length > 0 && (
                    <div className="relative mt-4 flex flex-wrap gap-2">
                        {stats.map((s) => (
                            <HeroStat key={s.label} {...s} />
                        ))}
                    </div>
                )}
            </section>

            {overlap && (
                <div className="relative -mt-10 md:mx-5">
                    <div className="ae-tile p-4 shadow-[0_18px_40px_-20px_rgba(17,58,43,0.35)] sm:p-5">{overlap}</div>
                </div>
            )}
        </div>
    );
}

export function HeroStat({ label, value, icon: Icon }: HeroStatItem) {
    return (
        <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] py-1.5 pl-1.5 pr-3.5 backdrop-blur-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-gold-300">
                {Icon ? <Icon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-gold-400" />}
            </span>
            <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">{label}</span>
                <span className="block text-sm font-extrabold text-white">{value}</span>
            </span>
        </div>
    );
}

/** Gold primary / ghost secondary buttons for use inside the green hero. */
export function heroButtonClass(variant: 'gold' | 'ghost' = 'gold') {
    return variant === 'gold'
        ? 'inline-flex h-11 items-center gap-2 rounded-xl bg-gold-400 px-5 text-sm font-bold text-brand-950 shadow-lg shadow-black/20 transition-all hover:bg-gold-300 active:scale-[0.98] disabled:opacity-60'
        : 'inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60';
}

/** "MY PRODUCTS"-style label with optional right-side content. */
export function SectionHeader({
    label,
    title,
    right,
    className,
}: {
    label: string;
    title?: ReactNode;
    right?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
            <div>
                <p className="ae-section-label">{label}</p>
                {title && <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h2>}
            </div>
            {right}
        </div>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('ae-tile ae-contour flex flex-col items-center px-6 py-14 text-center', className)}>
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff7dc_0%,#f9c02a_45%,#c98009_100%)] shadow-[inset_0_-4px_0_rgba(109,60,18,0.35),inset_0_3px_0_rgba(255,255,255,0.6),0_14px_30px_-12px_rgba(160,92,12,0.6)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 text-gold-200">
                    <Icon className="h-6 w-6" />
                </span>
            </span>
            <h3 className="relative mt-5 font-display text-xl font-semibold text-zinc-900">{title}</h3>
            {description && <p className="relative mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>}
            {action && <div className="relative mt-6">{action}</div>}
        </div>
    );
}
