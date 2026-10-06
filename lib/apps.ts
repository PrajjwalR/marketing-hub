/**
 * Catalogue of the dashboard "apps" a user can switch on from Explore Apps.
 * Each section is one sidebar tab whose enabled apps are shown as sub-tabs inside
 * the screen; ALWAYS_ON apps can't be turned off.
 */

import { CalendarDays, Camera, Film, LayoutDashboard, Settings, Target, Users, type LucideIcon } from 'lucide-react';

export type AppId =
    | 'launchpad'
    | 'analytics'
    | 'strategy-planner'
    | 'strategy-prompts'
    | 'competitors'
    | 'calendar'
    | 'auto-reply'
    | 'whathub'
    | 'series'
    | 'gallery'
    | 'create-content'
    | 'designer'
    | 'create-new'
    | 'photoshoot-generations'
    | 'photoshoot-studio'
    | 'academy'
    | 'contacts'
    | 'events'
    | 'companies'
    | 'lists'
    | 'data-enrichment'
    | 'settings';

export type AppDefinition = {
    id: AppId;
    name: string;
    description: string;
    href: string;
    /** Emoji shown on a pastel tile in Explore Apps. */
    emoji: string;
    /** Tailwind background for the icon tile. */
    tint: string;
    external?: boolean;
    /** Extra route prefixes that belong to this app (detail pages etc.). */
    alsoMatches?: string[];
    /** Short label for the in-page sub-tab bar (defaults to name). */
    tabLabel?: string;
};

/** A section is one sidebar tab; its enabled apps become that tab's sub-tabs. */
export type AppSection = {
    id: string;
    label: string;
    /** Short name used for the sidebar tab. */
    navLabel: string;
    icon: LucideIcon;
    /** One-line summary shown on the Explore All Apps card. */
    description: string;
    emoji: string;
    tint: string;
    apps: AppDefinition[];
};

export const APP_SECTIONS: AppSection[] = [
    {
        id: 'home', label: 'Overview', navLabel: 'Home', icon: LayoutDashboard, emoji: '🏠', tint: 'bg-brand-50',
        description: 'Your launchpad and analytics overview in one place.',
        apps: [
            { id: 'launchpad', name: 'Launchpad', description: 'Your home screen with quick links to every tool.', href: '/dashboard', emoji: '🚀', tint: 'bg-brand-50' },
            { id: 'analytics', tabLabel: 'Analytics', name: 'Analytics Dashboard', description: 'Publishing stats, approvals and performance at a glance.', href: '/dashboard/analytics-dashboard', emoji: '📊', tint: 'bg-sky-50' },
        ],
    },
    {
        id: 'publish', label: 'Publishing & engagement', navLabel: 'Publish', icon: CalendarDays, emoji: '🗓️', tint: 'bg-gold-50',
        description: 'Schedule posts, auto-reply to comments and run WhatsApp campaigns.',
        apps: [
            { id: 'calendar', tabLabel: 'Calendar', name: 'Postings Calendar', description: 'Plan, schedule and approve posts across platforms.', href: '/dashboard/calendar', emoji: '🗓️', tint: 'bg-gold-50' },
            { id: 'auto-reply', name: 'Auto Reply', description: 'Automatically reply to comments on Instagram & X.', href: '/dashboard/auto-reply', emoji: '💬', tint: 'bg-violet-50' },
            { id: 'whathub', name: 'Whathub', description: 'WhatsApp campaigns and conversations.', href: '/api/whathub/sso', emoji: '📱', tint: 'bg-emerald-50', external: true },
        ],
    },
    {
        id: 'strategy', label: 'Strategy', navLabel: 'Strategy', icon: Target, emoji: '🎯', tint: 'bg-rose-50',
        description: 'AI content strategies, ready-made playbooks and competitor tracking.',
        apps: [
            { id: 'strategy-planner', tabLabel: 'Planner', name: 'Strategy Planner', description: 'Generate 30-day AI content strategies and edit them.', href: '/dashboard/strategy', emoji: '🎯', tint: 'bg-rose-50', alsoMatches: ['/dashboard/strategy-generator'] },
            { id: 'strategy-prompts', tabLabel: 'Prompts', name: 'Prebuilt Strategy Prompts', description: 'Category-specific playbooks for your business.', href: '/dashboard/prebuilt-strategy-prompts', emoji: '💡', tint: 'bg-gold-50', alsoMatches: ['/dashboard/prebuilt-strategy'] },
            { id: 'competitors', name: 'Competitors', description: 'Compare your performance head-to-head with rivals.', href: '/dashboard/competitors', emoji: '⚔️', tint: 'bg-zinc-100' },
        ],
    },
    {
        id: 'create', label: 'Content creation', navLabel: 'Create', icon: Film, emoji: '🎨', tint: 'bg-orange-50',
        description: 'Posters, video series, the designer and your media gallery.',
        apps: [
            { id: 'create-content', tabLabel: 'Create', name: 'Create Content', description: 'AI posters, image edits and short videos.', href: '/dashboard/posters', emoji: '🎨', tint: 'bg-orange-50' },
            { id: 'series', name: 'Series', description: 'Automated recurring video series.', href: '/dashboard/series', emoji: '🎬', tint: 'bg-indigo-50' },
            { id: 'gallery', name: 'Gallery', description: 'All your videos, images and files in folders.', href: '/dashboard/videos', emoji: '🖼️', tint: 'bg-sky-50' },
            { id: 'designer', name: 'Designer', description: 'Drag-and-drop canvas editor for graphics.', href: '/dashboard/designer', emoji: '✏️', tint: 'bg-rose-50' },
            { id: 'create-new', tabLabel: 'New series', name: 'Create New Series', description: 'Step-by-step builder for a new video series.', href: '/dashboard/create', emoji: '✨', tint: 'bg-gold-50' },
        ],
    },
    {
        id: 'photoshoot', label: 'AI photoshoot', navLabel: 'Photoshoot', icon: Camera, emoji: '📸', tint: 'bg-pink-50',
        description: 'Studio-grade AI product photos on real models.',
        apps: [
            { id: 'photoshoot-studio', tabLabel: 'Studio', name: 'Photoshoot Studio', description: 'Studio-grade product shots on real models.', href: '/dashboard/ai-photoshoot/studio', emoji: '📸', tint: 'bg-pink-50' },
            { id: 'photoshoot-generations', tabLabel: 'Generations', name: 'My Generations', description: 'Photos and videos you have generated.', href: '/dashboard/ai-photoshoot/generations', emoji: '🗂️', tint: 'bg-amber-50' },
        ],
    },
    {
        id: 'crm', label: 'CRM', navLabel: 'CRM', icon: Users, emoji: '👥', tint: 'bg-sky-50',
        description: 'Contacts, events, companies, lists and data enrichment.',
        apps: [
            { id: 'contacts', name: 'Contacts', description: 'Customers, birthdays and loyalty reminders.', href: '/dashboard/contacts', emoji: '👥', tint: 'bg-brand-50' },
            { id: 'events', tabLabel: 'Events', name: 'Events & Notifications', description: 'Festival and campaign automations.', href: '/dashboard/events', emoji: '🔔', tint: 'bg-gold-50' },
            { id: 'companies', name: 'Companies', description: 'Search and save companies to reach.', href: '/dashboard/companies', emoji: '🏢', tint: 'bg-zinc-100' },
            { id: 'lists', name: 'Lists', description: 'Group contacts and accounts into targeted lists.', href: '/dashboard/lists', emoji: '📋', tint: 'bg-sky-50' },
            { id: 'data-enrichment', tabLabel: 'Enrichment', name: 'Data Enrichment', description: 'Fill in missing contact and company data.', href: '/dashboard/data-enrichment', emoji: '🧬', tint: 'bg-violet-50' },
        ],
    },
    {
        id: 'account', label: 'Learn & account', navLabel: 'Account', icon: Settings, emoji: '⚙️', tint: 'bg-zinc-100',
        description: 'Academy courses plus profile, business and social settings.',
        apps: [
            { id: 'academy', name: 'Academy', description: 'Short courses on hooks, funnels and growth.', href: '/dashboard/academy', emoji: '🎓', tint: 'bg-indigo-50' },
            { id: 'settings', tabLabel: 'Settings', name: 'Admin Settings', description: 'Profile, business details and social connections.', href: '/dashboard/settings', emoji: '⚙️', tint: 'bg-zinc-100', alsoMatches: ['/dashboard/billing'] },
        ],
    },
];

export const ALL_APPS: AppDefinition[] = APP_SECTIONS.flatMap((s) => s.apps);

/** Apps that are always visible and can't be switched off. */
export const ALWAYS_ON: AppId[] = ['calendar'];

export const DEFAULT_ENABLED: AppId[] = [...ALWAYS_ON];

function matchLength(pathname: string, prefix: string): number {
    if (prefix === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/' ? prefix.length : -1;
    return pathname === prefix || pathname.startsWith(`${prefix}/`) ? prefix.length : -1;
}

/** The section (sidebar tab) and app (sub-tab) that own a route, by longest matching prefix. */
export function locateRoute(pathname: string): { section: AppSection; app: AppDefinition } | null {
    let best: { section: AppSection; app: AppDefinition; len: number } | null = null;
    for (const section of APP_SECTIONS) {
        for (const app of section.apps) {
            if (app.external) continue;
            for (const prefix of [app.href, ...(app.alsoMatches ?? [])]) {
                const len = matchLength(pathname, prefix);
                if (len >= 0 && (!best || len > best.len)) best = { section, app, len };
            }
        }
    }
    return best ? { section: best.section, app: best.app } : null;
}
