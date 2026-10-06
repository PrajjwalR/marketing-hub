'use client';

import type { ComponentType } from 'react';
import { format, parseISO } from 'date-fns';
import { Cake, Facebook, FileText, Gift, ImageIcon, Instagram, Linkedin, Mail, RefreshCw, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TikTokIcon, XIcon } from '@/components/dashboard/social-brand-icons';
import type { CalendarEvent, SocialConnection } from './calendar-context';
import { EventApprovalBadge } from './event-approval-badge';

type PlatformMeta = {
    label: string;
    Icon: ComponentType<{ className?: string }>;
    /** Icon chip background + foreground. */
    chip: string;
    /** Solid accent used for the card's left edge. */
    accent: string;
    /** Soft pastel block colours for calendar cards (applied via inline style). */
    pastel: { bg: string; fg: string };
};

const PLATFORMS: Record<string, PlatformMeta> = {
    instagram: { label: 'Instagram', Icon: Instagram, chip: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white', accent: '#e1306c', pastel: { bg: '#E9E6FA', fg: '#5A4BB8' } },
    facebook: { label: 'Facebook', Icon: Facebook, chip: 'bg-[#1877F2] text-white', accent: '#1877F2', pastel: { bg: '#DFE8FB', fg: '#2457C5' } },
    linkedin: { label: 'LinkedIn', Icon: Linkedin, chip: 'bg-[#0A66C2] text-white', accent: '#0A66C2', pastel: { bg: '#DCEAF8', fg: '#1C6CB8' } },
    youtube: { label: 'YouTube', Icon: Youtube, chip: 'bg-[#FF0000] text-white', accent: '#FF0000', pastel: { bg: '#F5F0C6', fg: '#86700F' } },
    tiktok: { label: 'TikTok', Icon: TikTokIcon, chip: 'bg-black text-white', accent: '#111111', pastel: { bg: '#FBE3EC', fg: '#B0336A' } },
    x: { label: 'X', Icon: XIcon, chip: 'bg-zinc-900 text-white', accent: '#18181b', pastel: { bg: '#ECEDEF', fg: '#33363B' } },
    twitter: { label: 'X', Icon: XIcon, chip: 'bg-zinc-900 text-white', accent: '#18181b', pastel: { bg: '#ECEDEF', fg: '#33363B' } },
    email: { label: 'Newsletter', Icon: Mail, chip: 'bg-sky-500 text-white', accent: '#0ea5e9', pastel: { bg: '#DDF5DD', fg: '#2E8B3A' } },
};

const CRM_BIRTHDAY: PlatformMeta = { label: 'Birthday', Icon: Cake, chip: 'bg-rose-500 text-white', accent: '#f43f5e', pastel: { bg: '#FCE4E6', fg: '#C2394A' } };
const CRM_LOYALTY: PlatformMeta = { label: 'Loyalty', Icon: Gift, chip: 'bg-rose-500 text-white', accent: '#f43f5e', pastel: { bg: '#FCE4E6', fg: '#C2394A' } };
const GENERIC: PlatformMeta = { label: 'Post', Icon: FileText, chip: 'bg-brand-700 text-gold-200', accent: 'var(--color-brand-600)', pastel: { bg: '#E3F1EA', fg: '#17553C' } };

export function resolvePlatform(event: CalendarEvent, connections: SocialConnection[]): { meta: PlatformMeta; account?: SocialConnection } {
    const account = event.account_id ? connections.find((c) => c.id === event.account_id) : undefined;
    if (event.type === 'crm_birthday') return { meta: CRM_BIRTHDAY, account };
    if (event.type === 'crm_loyalty') return { meta: CRM_LOYALTY, account };
    const key = (account?.platform || event.platform || event.platforms?.[0] || '').toLowerCase();
    return { meta: PLATFORMS[key] ?? GENERIC, account };
}

export function PlatformChip({ meta, size = 'md' }: { meta: PlatformMeta; size?: 'sm' | 'md' | 'lg' }) {
    return (
        <span
            className={cn(
                'flex shrink-0 items-center justify-center',
                meta.chip,
                size === 'sm' && 'h-5 w-5 rounded-md [&_svg]:h-3 [&_svg]:w-3',
                size === 'md' && 'h-7 w-7 rounded-lg [&_svg]:h-3.5 [&_svg]:w-3.5',
                size === 'lg' && 'h-10 w-10 rounded-xl [&_svg]:h-5 [&_svg]:w-5'
            )}
            title={meta.label}
        >
            <meta.Icon />
        </span>
    );
}

type StatusKey = 'published' | 'scheduled' | 'cancelled' | 'draft';

export function statusOf(event: CalendarEvent): StatusKey {
    if (event.status === 'completed' || event.status === 'published') return 'published';
    if (event.status === 'scheduled') return 'scheduled';
    if (event.status === 'cancelled') return 'cancelled';
    return 'draft';
}

const STATUS_STYLE: Record<StatusKey, { label: string; pill: string; dot: string }> = {
    published: { label: 'Published', pill: 'bg-brand-50 text-brand-700 ring-brand-100', dot: 'bg-brand-500' },
    scheduled: { label: 'Scheduled', pill: 'bg-gold-50 text-gold-800 ring-gold-200', dot: 'bg-gold-500' },
    cancelled: { label: 'Cancelled', pill: 'bg-zinc-100 text-zinc-500 ring-zinc-200', dot: 'bg-zinc-400' },
    draft: { label: 'Draft', pill: 'bg-sky-50 text-sky-700 ring-sky-100', dot: 'bg-sky-400' },
};

export function StatusPill({ event, className }: { event: CalendarEvent; className?: string }) {
    const s = STATUS_STYLE[statusOf(event)];
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1', s.pill, className)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
            {s.label}
        </span>
    );
}

export function StatusDot({ event }: { event: CalendarEvent }) {
    const s = STATUS_STYLE[statusOf(event)];
    return <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', s.dot)} title={s.label} />;
}

export function firstMedia(event: CalendarEvent): string | undefined {
    return event.media_url?.split(',')[0]?.trim() || undefined;
}

export function isVideoUrl(url: string) {
    return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);
}

/** Small media preview; falls back to a soft tile when there's no media. */
export function MediaThumb({ src, className }: { src?: string; className?: string }) {
    if (!src) {
        return (
            <span className={cn('flex items-center justify-center bg-gradient-to-br from-brand-50 to-gold-50 text-brand-300', className)}>
                <ImageIcon className="h-4 w-4" />
            </span>
        );
    }
    return isVideoUrl(src) ? (
        <video src={src} muted playsInline preload="metadata" className={cn('object-cover', className)} />
    ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={cn('object-cover', className)} />
    );
}

/** Compact post card used in the Week view columns. */
export function PostCard({
    event,
    connections,
    onOpen,
}: {
    event: CalendarEvent;
    connections: SocialConnection[];
    onOpen: () => void;
}) {
    const { meta, account } = resolvePlatform(event, connections);
    const media = firstMedia(event);
    const cancelled = statusOf(event) === 'cancelled';

    return (
        <button
            type="button"
            onClick={onOpen}
            className={cn(
                'group relative w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-white text-left shadow-[0_1px_2px_rgba(16,32,24,0.05)] transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_10px_24px_-14px_rgba(17,58,43,0.35)]',
                cancelled && 'opacity-55'
            )}
        >
            <span className="absolute inset-y-0 left-0 w-1" style={{ background: meta.accent }} />
            <div className="py-2.5 pl-3.5 pr-2.5">
                <div className="flex items-center gap-1.5">
                    <PlatformChip meta={meta} size="sm" />
                    <span className="text-[11px] font-bold tabular-nums text-zinc-800">{format(parseISO(event.scheduled_at), 'h:mm a')}</span>
                    {event.is_recurring && <RefreshCw className="h-3 w-3 text-gold-600" aria-label="Recurring" />}
                    <span className="ml-auto">
                        <StatusDot event={event} />
                    </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[12.5px] font-semibold leading-snug text-zinc-900">{event.title || 'Untitled post'}</p>
                {account?.profile_name && <p className="mt-0.5 truncate text-[11px] text-zinc-500">@{account.profile_name}</p>}
                <EventApprovalBadge event={event} compact className="mt-1.5" />
                {media && <MediaThumb src={media} className="mt-2 aspect-[4/3] w-full rounded-lg" />}
                {(event.labels?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {event.labels!.slice(0, 2).map((l) => (
                            <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                                {l.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
}

/**
 * Soft pastel post block (platform name + outlined icon, caption below in the same hue).
 * `detailed` adds the time, thumbnail and approval state for the Week view.
 */
export function PastelPostCard({
    event,
    connections,
    onOpen,
    detailed = false,
}: {
    event: CalendarEvent;
    connections: SocialConnection[];
    onOpen: () => void;
    detailed?: boolean;
}) {
    const { meta } = resolvePlatform(event, connections);
    const media = detailed ? firstMedia(event) : undefined;
    const status = statusOf(event);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onOpen();
            }}
            title={event.title}
            className={cn(
                'group w-full rounded-xl px-2.5 py-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_rgba(0,0,0,0.25)]',
                status === 'cancelled' && 'opacity-50'
            )}
            style={{ backgroundColor: meta.pastel.bg, color: meta.pastel.fg }}
        >
            <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-bold">{meta.label}</span>
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border opacity-80 [&_svg]:h-3 [&_svg]:w-3" style={{ borderColor: meta.pastel.fg }}>
                    <meta.Icon />
                </span>
            </span>
            <span className={cn('mt-1 block text-[12px] font-medium leading-snug opacity-90', detailed ? 'line-clamp-3' : 'line-clamp-2')}>
                {event.title || 'Untitled post'}
            </span>
            {media && <MediaThumb src={media} className="mt-2 block aspect-[4/3] w-full rounded-lg" />}
            {detailed && (
                <span className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap text-[10.5px] font-semibold opacity-75">
                    {format(parseISO(event.scheduled_at), 'h:mm a')}
                    {event.is_recurring && <RefreshCw className="h-3 w-3" aria-label="Recurring" />}
                    <span className="ml-auto inline-flex items-center gap-1">
                        <StatusDot event={event} />
                        {STATUS_STYLE[status].label}
                    </span>
                </span>
            )}
            {detailed && <EventApprovalBadge event={event} compact className="mt-1.5" />}
        </button>
    );
}

/** Festival highlight shown on a day. */
export function FestivalTag({ title, description, size = 'md' }: { title: string; description?: string | null; size?: 'sm' | 'md' }) {
    return (
        <div
            className={cn(
                'flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-100 to-gold-50 font-bold text-gold-900 ring-1 ring-gold-200',
                size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'
            )}
            title={description || title}
        >
            <span aria-hidden>🪔</span>
            <span className="truncate">{title}</span>
        </div>
    );
}

export const isNote = (e: CalendarEvent) => (e.type || '').toLowerCase() === 'note';
export const isFestival = (e: CalendarEvent) => e.type === 'festival';
