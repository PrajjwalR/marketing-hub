'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullWidth =
        pathname === '/dashboard' || pathname === '/dashboard/calendar';

    return (
        <div
            className={cn(
                'animate-in fade-in slide-in-from-bottom-4 duration-500',
                isFullWidth ? 'w-full max-w-none' : 'mx-auto max-w-7xl'
            )}
        >
            {children}
        </div>
    );
}
