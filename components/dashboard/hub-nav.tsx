'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApps } from '@/context/apps-context';
import { APP_SECTIONS, locateRoute, type AppDefinition, type AppSection } from '@/lib/apps';

export type HubTab = {
    id: string;
    name: string;
    icon: AppSection['icon'];
    /** Where the tab opens: the first enabled app in the section. */
    href: string;
    external?: boolean;
    /** Number of enabled features in this tab. */
    featureCount: number;
};

export const EXPLORE_TAB_HREF = '/dashboard/apps';

/** Sidebar tabs: one per section that has at least one enabled app, in catalogue order. */
export function useHubTabs(): HubTab[] {
    const { isEnabled } = useApps();
    return APP_SECTIONS.flatMap((section) => {
        const enabled = section.apps.filter((a) => isEnabled(a.id));
        if (enabled.length === 0) return [];
        const first = enabled.find((a) => !a.external) ?? enabled[0];
        return [{ id: section.id, name: section.navLabel, icon: section.icon, href: first.href, external: first.external, featureCount: enabled.length }];
    });
}

/** Which sidebar tab is active for the current route. */
export function useActiveHubId(): string | null {
    const pathname = usePathname();
    if (pathname === EXPLORE_TAB_HREF) return 'explore';
    return locateRoute(pathname)?.section.id ?? null;
}

/** The current section, its enabled apps (the sub-tabs) and the active one. */
export function useCurrentHub(): { section: AppSection; apps: AppDefinition[]; active: AppDefinition } | null {
    const pathname = usePathname();
    const { isEnabled } = useApps();
    const located = locateRoute(pathname);
    if (!located) return null;
    const apps = located.section.apps.filter((a) => isEnabled(a.id) || a.id === located.app.id);
    return { section: located.section, apps, active: located.app };
}

/**
 * Sub-tab pills for the current section, shown in the green page banner.
 * Renders nothing when the section has a single feature, so the breadcrumb shows instead.
 */
export function HubTabs({ className }: { className?: string }) {
    const hub = useCurrentHub();
    if (!hub || hub.apps.length < 2) return null;

    return (
        <nav aria-label={`${hub.section.navLabel} sections`} className={cn('relative -mx-1 overflow-x-auto px-1 pb-1', className)}>
            <div className="flex w-max items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
                {hub.apps.map((app) => {
                    const active = app.id === hub.active.id;
                    return (
                        <Link
                            key={app.id}
                            href={app.href}
                            target={app.external ? '_blank' : undefined}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all',
                                active ? 'bg-white text-brand-900 shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <span aria-hidden className="text-sm leading-none">{app.emoji}</span>
                            {app.tabLabel ?? app.name}
                        </Link>
                    );
                })}
                <Link
                    href={EXPLORE_TAB_HREF}
                    title="Add more features"
                    className="ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-950 transition-colors hover:bg-gold-300"
                >
                    <Plus className="h-4 w-4" strokeWidth={2.75} />
                    <span className="sr-only">Add more features</span>
                </Link>
            </div>
        </nav>
    );
}

export { LayoutGrid as ExploreIcon };
