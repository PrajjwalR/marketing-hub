'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, Menu, Plus, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { buildNavSections } from '@/components/dashboard/sidebar';
import { EXPLORE_TAB_HREF, useActiveHubId, useHubTabs } from '@/components/dashboard/hub-nav';
import { useApps } from '@/context/apps-context';
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher';

const isActivePath = (pathname: string, href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

function Brand() {
    return (
        <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gold-100 ring-1 ring-gold-300/60">
                <Image src="/logo.png" alt="Agent Elephant" width={36} height={36} className="scale-125 object-cover" />
            </span>
            <span className="text-lg lowercase tracking-tight text-white">
                <span className="font-bold">agent</span>
                <span className="font-extralight">elephant</span>
            </span>
        </Link>
    );
}

/** Full navigation drawer for small screens (the desktop sidebar is hidden below md). */
function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const pathname = usePathname();
    const close = () => onOpenChange(false);
    const navSections = buildNavSections(useHubTabs());
    const activeHubId = useActiveHubId();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" showCloseButton={false} className="w-[86vw] max-w-[320px] gap-0 border-none bg-brand-900 p-0 text-white">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
                    <Brand />
                    <SheetClose
                        aria-label="Close menu"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </SheetClose>
                </div>
                <div className="border-b border-white/[0.08] px-3 py-2">
                    <WorkspaceSwitcher isCollapsed={false} />
                </div>
                <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
                    {navSections.map((section) => {
                        const Icon = section.icon;
                        if (section.items) {
                            return (
                                <div key={section.name}>
                                    <p className="mb-1.5 flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                                        <Icon className="h-3.5 w-3.5" />
                                        {section.name}
                                    </p>
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={close}
                                                className={cn(
                                                    'flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                                                    isActivePath(pathname, item.href)
                                                        ? 'bg-white text-brand-900'
                                                        : 'text-white/85 hover:bg-white/10'
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        const active = section.hubId ? activeHubId === section.hubId : !section.external && isActivePath(pathname, section.href!);
                        return (
                            <a
                                key={section.name}
                                href={section.href}
                                target={section.external ? '_blank' : undefined}
                                rel={section.external ? 'noopener noreferrer' : undefined}
                                onClick={close}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors',
                                    active ? 'bg-white text-brand-900' : 'text-white/90 hover:bg-white/10'
                                )}
                            >
                                <Icon className={cn('h-4 w-4', active ? 'text-brand-700' : 'text-white/75')} />
                                {section.name}
                            </a>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

export function MobileTopBar({ onMenu }: { onMenu: () => void }) {
    return (
        <header className="ae-hero flex h-16 shrink-0 items-center justify-between px-4 md:hidden">
            <Brand />
            <button
                type="button"
                onClick={onMenu}
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
            >
                <Menu className="h-5 w-5" />
            </button>
        </header>
    );
}

type BottomTab = { name: string; href: string; icon: LucideIcon; hubId: string };

export function MobileBottomNav() {
    const { isEnabled } = useApps();
    const hubTabs = useHubTabs();
    const activeHubId = useActiveHubId();

    const showCreate = isEnabled('create-content');
    // Same tabs as the sidebar, capped at three so "Apps" always fits as the last item.
    const tabs: BottomTab[] = [
        ...hubTabs.filter((t) => !t.external && !(showCreate && t.id === 'create')).slice(0, 3).map((t) => ({ name: t.name, href: t.href, icon: t.icon, hubId: t.id })),
        { name: 'Apps', href: EXPLORE_TAB_HREF, icon: LayoutGrid, hubId: 'explore' },
    ];
    const half = Math.ceil(tabs.length / 2);
    const row: (BottomTab | null)[] = showCreate ? [...tabs.slice(0, half), null, ...tabs.slice(half)] : tabs;

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden"
            aria-label="Primary"
        >
            <div className="mx-auto flex h-16 max-w-md items-end justify-around px-2">
                {row.map((tab) => {
                    if (!tab) {
                        return (
                            <Link
                                key="create"
                                href="/dashboard/posters"
                                className="-mt-6 flex flex-col items-center gap-1 pb-1.5"
                                aria-label="Create content"
                            >
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-brand-950 shadow-lg shadow-gold-600/30 ring-[6px] ring-gold-100">
                                    <Plus className="h-6 w-6" strokeWidth={2.5} />
                                </span>
                                <span className="text-[10px] font-bold text-brand-900">Create</span>
                            </Link>
                        );
                    }
                    const active = activeHubId === tab.hubId;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                'flex w-16 flex-col items-center gap-1 pb-2 text-[11px] transition-colors',
                                active ? 'font-bold text-brand-900' : 'font-medium text-zinc-500'
                            )}
                        >
                            <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export function MobileNav() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <MobileTopBar onMenu={() => setOpen(true)} />
            <MobileMenu open={open} onOpenChange={setOpen} />
        </>
    );
}
