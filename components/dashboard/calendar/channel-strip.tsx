'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { Check, Facebook, Instagram, Linkedin, Loader2, Plus, Settings2, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TikTokIcon, XIcon } from '@/components/dashboard/social-brand-icons';

type Connection = {
    id: string;
    platform: string;
    profile_name?: string;
    status?: 'connected' | 'disconnected' | 'error';
};

type Platform = {
    id: string;
    name: string;
    Icon: ComponentType<{ className?: string }>;
    /** Brand colours for the icon chip. */
    chip: string;
    comingSoon?: boolean;
};

const PLATFORMS: Platform[] = [
    { id: 'instagram', name: 'Instagram', Icon: Instagram, chip: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white' },
    { id: 'facebook', name: 'Facebook', Icon: Facebook, chip: 'bg-[#1877F2] text-white' },
    { id: 'linkedin', name: 'LinkedIn', Icon: Linkedin, chip: 'bg-[#0A66C2] text-white' },
    { id: 'youtube', name: 'YouTube', Icon: Youtube, chip: 'bg-[#FF0000] text-white' },
    { id: 'tiktok', name: 'TikTok', Icon: TikTokIcon, chip: 'bg-black text-white' },
    { id: 'x', name: 'X', Icon: XIcon, chip: 'bg-zinc-900 text-white', comingSoon: true },
];

/** Social channels row for the calendar toolbar: shows connection state with one-click connect. */
export function ChannelStrip() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/settings/social?t=${Date.now()}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (!cancelled) setConnections(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!cancelled) setConnections([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const connectedFor = (platform: string) =>
        connections.filter((c) => c.platform === platform && (c.status ?? 'connected') === 'connected');

    const connectedCount = PLATFORMS.filter((p) => connectedFor(p.id).length > 0).length;

    const connect = (platform: string) => {
        setConnecting(platform);
        // Same OAuth entry points the Settings page uses; the callback returns to Settings.
        window.location.href = `/api/settings/social/connect/${platform}`;
    };

    return (
        <div className="border-t border-dashed border-zinc-200 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <p className="ae-section-label">Your channels</p>
                    {!loading && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                            {connectedCount} connected
                        </span>
                    )}
                </div>
                <Link
                    href="/dashboard/settings#settings-social"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    Manage
                </Link>
            </div>

            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
                {PLATFORMS.map((p) => {
                    const accounts = connectedFor(p.id);
                    const isConnected = accounts.length > 0;
                    return (
                        <div
                            key={p.id}
                            className={cn(
                                'flex min-w-[168px] shrink-0 items-center gap-2.5 rounded-xl border p-2 pr-2.5 transition-colors',
                                isConnected ? 'border-brand-200 bg-brand-50/60' : 'border-zinc-200/80 bg-white'
                            )}
                        >
                            <span className={cn('relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', p.chip, p.comingSoon && 'opacity-60')}>
                                <p.Icon className="h-[18px] w-[18px]" />
                                {isConnected && (
                                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 ring-2 ring-white">
                                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                                    </span>
                                )}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-bold leading-tight text-zinc-900">{p.name}</span>
                                <span className="block truncate text-[11px] text-zinc-500">
                                    {loading
                                        ? 'Checking…'
                                        : p.comingSoon
                                            ? 'Coming soon'
                                            : isConnected
                                                ? accounts[0].profile_name || `${accounts.length} account${accounts.length > 1 ? 's' : ''}`
                                                : 'Not connected'}
                                </span>
                            </span>
                            {!loading && !isConnected && !p.comingSoon && (
                                <button
                                    type="button"
                                    onClick={() => connect(p.id)}
                                    disabled={connecting !== null}
                                    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-gold-400 px-2.5 text-[11px] font-bold text-brand-950 transition-colors hover:bg-gold-300 disabled:opacity-60"
                                >
                                    {connecting === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" strokeWidth={3} />}
                                    Connect
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
