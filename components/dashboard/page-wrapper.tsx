'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullWidth =
        pathname === '/dashboard' ||
        pathname === '/dashboard/calendar' ||
        pathname === '/dashboard/inbox-activity' ||
        pathname === '/dashboard/ad-insights' ||
        pathname.startsWith('/dashboard/academy') ||
        pathname.startsWith('/dashboard/ai-photoshoot') ||
        pathname.startsWith('/dashboard/designer');
        
    const isDashboardHome =
        pathname === '/dashboard' || 
        pathname === '/dashboard/' || 
        pathname.startsWith('/dashboard/academy');

    const shouldStartAtTop =
        isDashboardHome ||
        // Screens using <PageHero> manage their own top spacing.
        pathname.startsWith('/dashboard/designer');

    return (
        <div
            className={cn(
                'animate-in fade-in slide-in-from-bottom-4 duration-500',
                isFullWidth ? 'w-full max-w-none' : 'mx-auto max-w-7xl',
                // Keep selected dashboard routes flush to the top; others leave room above the hero on desktop.
                !shouldStartAtTop && 'md:pt-6'
            )}
        >
            {children}
        </div>
    );
}
