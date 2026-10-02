'use client';

import {
    SquarePen,
    Bell,
    MessageCircle,
    FileText,
    Keyboard,
    HelpCircle,
    UserCircle,
    MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const railBtn =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-transparent text-zinc-600 transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300';

const railBtnActive =
    'bg-brand-800 border-brand-800 text-white shadow-md shadow-brand-900/20 hover:bg-brand-800 hover:text-white';

const composeBtn =
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-950 ring-4 ring-gold-100 shadow-md shadow-gold-600/25 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-gold-200';

const composeBtnActive = 'ring-gold-200';

/**
 * Sprout-style narrow right rail: compose (blue tile), notifications, messages, docs, add, more;
 * bottom: keyboard shortcuts, help, profile.
 */
export function DashboardRightRail() {
    const pathname = usePathname();

    // Lightweight mapping: keep active styling on the icon that best matches the current route.
    const activeKey = (() => {
        if (pathname === '/dashboard' || pathname.startsWith('/dashboard/posters') || pathname.startsWith('/dashboard/create')) return 'compose';
        if (pathname.startsWith('/dashboard/cases') || pathname.startsWith('/dashboard/approvals') || pathname.startsWith('/dashboard/reviews')) return 'notifications';
        if (pathname.startsWith('/dashboard/emails') || pathname.startsWith('/dashboard/sequences') || pathname.startsWith('/dashboard/inbox')) return 'messages';
        if (pathname.startsWith('/dashboard/analytics') || pathname.startsWith('/dashboard/reports') || pathname.startsWith('/dashboard/deliverability')) return 'documents';
        if (pathname.startsWith('/dashboard/billing')) return 'more';
        if (pathname.startsWith('/dashboard/settings')) return 'account';
        if (pathname.startsWith('/dashboard/calendar')) return 'documents';
        return null;
    })();

    return (
        <aside
            className="font-sans flex h-screen w-[68px] shrink-0 flex-col items-center border-l border-zinc-200/80 bg-white"
            aria-label="Quick actions"
        >
            <div className="flex w-full flex-col items-center gap-2.5 py-4">
                <button
                    type="button"
                    className={cn(composeBtn, activeKey === 'compose' && composeBtnActive)}
                    aria-label="Compose"
                    title="Compose"
                >
                    <SquarePen className="h-[19px] w-[19px]" strokeWidth={2} />
                </button>
                <button type="button" className={cn(railBtn, activeKey === 'notifications' && railBtnActive)} aria-label="Notifications" title="Notifications">
                    <Bell className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </button>
                <button type="button" className={cn(railBtn, activeKey === 'messages' && railBtnActive)} aria-label="Messages" title="Messages">
                    <MessageCircle className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </button>
                <button type="button" className={cn(railBtn, activeKey === 'documents' && railBtnActive)} aria-label="Documents" title="Documents">
                    <FileText className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </button>
                
                <button type="button" className={cn(railBtn, activeKey === 'more' && railBtnActive)} aria-label="More" title="More">
                    <MoreHorizontal className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </button>
            </div>

            <div className="mt-auto flex w-full flex-col items-center gap-2 border-t border-zinc-200/80 py-4">
                <button
                    type="button"
                    className={railBtn}
                    aria-label="Keyboard shortcuts"
                    title="Keyboard shortcuts"
                >
                    <Keyboard className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </button>
                <button type="button" className={railBtn} aria-label="Help" title="Help">
                    <HelpCircle className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </button>
                <Link
                    href="/dashboard/settings"
                    className={cn(railBtn, activeKey === 'account' && railBtnActive)}
                    aria-label="Account"
                    title="Account"
                >
                    <UserCircle className="h-[19px] w-[19px]" strokeWidth={1.5} />
                </Link>
            </div>
        </aside>
    );
}
