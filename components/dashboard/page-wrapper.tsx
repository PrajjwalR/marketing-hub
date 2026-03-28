'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullWidth =
        pathname === '/dashboard' ||
        pathname === '/dashboard/calendar' ||
        pathname === '/dashboard/inbox-activity' ||
        pathname === '/dashboard/ad-insights';
    const isDashboardHome =
        pathname === '/dashboard' || pathname === '/dashboard/';

    return (
        <div
            className={cn(
                'animate-in fade-in slide-in-from-bottom-4 duration-500',
                isFullWidth ? 'w-full max-w-none' : 'mx-auto max-w-7xl',
                // Main has no top padding so the dashboard sticky header can sit flush; other routes get spacing here.
                !isDashboardHome && 'pt-8'
            )}
        >
            {children}
        </div>
    );
}
