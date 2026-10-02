'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutGrid, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EmptyState, PageHero } from '@/components/dashboard/page-hero';
import { useApps } from '@/context/apps-context';
import { ALWAYS_ON, APP_SECTIONS, type AppSection } from '@/lib/apps';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={(e) => {
                e.stopPropagation();
                onChange(!checked);
            }}
            className={cn(
                'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2',
                checked ? 'bg-emerald-500' : 'bg-zinc-200'
            )}
        >
            <span className={cn('inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform', checked ? 'translate-x-7' : 'translate-x-1')} />
        </button>
    );
}

/**
 * One card per sidebar tab. Turning a tab on enables every feature in it; they then
 * show up as sub-tabs inside that tab. Always-on features (the calendar) stay on.
 */
function TabCard({ section }: { section: AppSection }) {
    const { isEnabled, setManyEnabled } = useApps();
    const optional = section.apps.filter((a) => !ALWAYS_ON.includes(a.id));
    const hasLocked = optional.length < section.apps.length;
    const on = optional.some((a) => isEnabled(a.id));
    const firstOpen = section.apps.find((a) => isEnabled(a.id) && !a.external);

    const toggle = (next: boolean) => {
        setManyEnabled(optional.map((a) => a.id), next);
        toast.success(next ? `${section.navLabel} tab added to your sidebar` : hasLocked ? `${section.navLabel} reduced to the essentials` : `${section.navLabel} tab removed from your sidebar`);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => toggle(!on)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(!on);
                }
            }}
            className={cn(
                'group flex cursor-pointer flex-col gap-4 rounded-2xl border p-5 transition-all',
                on
                    ? 'border-brand-200 bg-brand-50/50 shadow-[0_1px_2px_rgba(16,32,24,0.04)]'
                    : 'border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-[0_12px_28px_-16px_rgba(17,58,43,0.25)]'
            )}
        >
            <div className="flex items-start gap-4">
                <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[28px] leading-none shadow-sm ring-1 ring-black/5', section.tint)} aria-hidden>
                    {section.emoji}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-zinc-900">{section.navLabel}</h3>
                        {hasLocked && (
                            <span className="rounded-md bg-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-gold-800">Always in sidebar</span>
                        )}
                    </div>
                    <p className="mt-0.5 text-sm leading-snug text-zinc-500">{section.description}</p>
                </div>
                <Toggle checked={on} onChange={toggle} label={`${on ? 'Turn off' : 'Turn on'} ${section.navLabel}`} />
            </div>

            {/* What this tab contains, shown as sub-tabs once it's on */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-dashed border-zinc-200 pt-3">
                {section.apps.map((app) => {
                    const appOn = isEnabled(app.id);
                    return (
                        <span
                            key={app.id}
                            className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold',
                                appOn ? 'bg-white text-brand-800 ring-1 ring-brand-200' : 'bg-zinc-100 text-zinc-500'
                            )}
                        >
                            <span aria-hidden className="text-[13px] leading-none">{app.emoji}</span>
                            {app.tabLabel ?? app.name}
                        </span>
                    );
                })}
                {(on || hasLocked) && firstOpen && (
                    <Link
                        href={firstOpen.href}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                    >
                        Open <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function ExploreAppsPage() {
    const { isEnabled } = useApps();
    const [query, setQuery] = useState('');

    const sections = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return APP_SECTIONS;
        return APP_SECTIONS.filter(
            (s) =>
                s.navLabel.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.apps.some((a) => a.name.toLowerCase().includes(q))
        );
    }, [query]);

    const tabsOn = APP_SECTIONS.filter((s) => s.apps.some((a) => isEnabled(a.id))).length;

    return (
        <div className="mx-auto w-full max-w-6xl pb-10">
            <PageHero
                title="Explore all apps"
                breadcrumb={['Explore All Apps']}
                icon={LayoutGrid}
                description="Each card is one sidebar tab. Turn it on and its tools appear as sub-tabs inside it."
                stats={[{ label: 'Tabs in sidebar', value: `${tabsOn} of ${APP_SECTIONS.length}`, icon: LayoutGrid }]}
                overlap={
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search apps or tools..."
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        />
                    </div>
                }
            />

            {sections.length === 0 ? (
                <EmptyState icon={Search} title="No apps found" description={`Nothing matches "${query}".`} />
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {sections.map((section) => (
                        <TabCard key={section.id} section={section} />
                    ))}
                </div>
            )}
        </div>
    );
}
