'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlidePanelProps {
    /** Whether the panel is open */
    open: boolean;
    /** Called when the panel should close (backdrop click or X button) */
    onClose: () => void;
    /** Panel title shown in the header */
    title?: string;
    /** Optional subtitle under the title */
    subtitle?: string;
    /** Width of the panel – defaults to "md" (480 px). "half" = 50% of viewport */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'half' | 'full';
    /** Content rendered inside the scrollable body */
    children: React.ReactNode;
    /** Optional sticky footer content (actions, save buttons, etc.) */
    footer?: React.ReactNode;
    /** Extra class names applied to the panel surface */
    className?: string;
}

const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    half: 'w-full max-w-[50vw]',
    full: 'max-w-full',
};

/**
 * SlidePanel – a right-side drawer that slides in from the right edge.
 *
 * Usage:
 *   <SlidePanel open={open} onClose={() => setOpen(false)} title="Edit Contact">
 *     <p>Panel body content here</p>
 *   </SlidePanel>
 */
export function SlidePanel({
    open,
    onClose,
    title,
    subtitle,
    size = 'md',
    children,
    footer,
    className,
}: SlidePanelProps) {
    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Lock body scroll while open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={cn(
                    'fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white text-zinc-900 shadow-2xl border-l border-zinc-200 w-full transition-transform duration-300 ease-in-out scheme-light',
                    sizeClass[size],
                    open ? 'translate-x-0' : 'translate-x-full',
                    className
                )}
            >
                {/* Header */}
                {(title || subtitle) && (
                    <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4">
                        <div className="min-w-0">
                            {title && (
                                <h2 className="text-[17px] font-bold text-zinc-900 leading-snug truncate">{title}</h2>
                            )}
                            {subtitle && (
                                <p className="text-sm text-zinc-500 mt-0.5 truncate">{subtitle}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors mt-0.5"
                            aria-label="Close panel"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Close button only (no title) */}
                {!title && !subtitle && (
                    <div className="flex flex-shrink-0 justify-end px-4 py-3">
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                            aria-label="Close panel"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

                {/* Optional sticky footer */}
                {footer && (
                    <div className="flex-shrink-0 border-t border-zinc-200 bg-white px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
}
