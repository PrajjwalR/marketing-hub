'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { format, isToday, subDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
    Plus,
    LayoutGrid,
    Loader2,
    ChevronDown,
    ChevronUp,
    Gem,
    Check,
    CalendarDays,
    Clock3,
    MessageSquareText,
    PieChart,
    Sparkles,
    FileText,
    Users,
    Tags,
    FolderKanban,
    CheckCheck,
    Radio,
    Megaphone,
    Inbox,
    Shapes,
    ClipboardList,
    MessagesSquare,
    ArrowUpRight,
    Settings,
    BarChart2,
    type LucideIcon,
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import type { User } from 'firebase/auth';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import {
    GoogleBusinessIcon,
    PinterestIcon,
    SnapchatIcon,
    ThreadsIcon,
    TikTokIcon,
    XIcon,
} from '@/components/dashboard/social-brand-icons';

/** Supabase profile name, then Firebase displayName / provider / email local-part. */
function resolveWelcomeName(
    user: User | null | undefined,
    opts?: { dbName?: string | null }
): string {
    const db = opts?.dbName?.trim();
    if (db) return db;
    if (!user) return 'User';
    const dn = user.displayName?.trim();
    if (dn) return dn;
    for (const p of user.providerData || []) {
        const pd = p.displayName?.trim();
        if (pd) return pd;
    }
    const local = user.email?.split('@')[0]?.trim();
    if (local) return local;
    return 'User';
}

/** Initials from the resolved greeting string (keeps avatar in sync with the banner). */
function getInitialsFromDisplayName(displayName: string): string {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (displayName.trim().length >= 2) return displayName.trim().slice(0, 2).toUpperCase();
    return displayName.trim().slice(0, 1).toUpperCase() || 'U';
}

type ToolItem = {
    name: string;
    description: string;
    tag: 'Core' | 'Premium';
    href: string;
    icon: LucideIcon;
    accent: string;
    soft: string;
    artwork?: 'default' | 'analytics';
};

type CalendarPost = {
    id: string;
    title: string;
    description?: string | null;
    platform?: string | null;
    account_id?: string | null;
    media_url?: string | null;
    scheduled_at: string;
    status: string;
    type?: string;
    labels?: { id: string; name: string; color: string }[];
    post_labels?: { label?: { id: string; name: string; color: string } | null }[];
};

type StrategySummary = {
    id: string;
    name?: string;
};

type StrategyPost = {
    id: string;
    title?: string;
    status: string;
    platform?: string | null;
    strategy_id: string;
};

type StrategyDetail = {
    id: string;
    posts?: StrategyPost[];
};

type LabelItem = {
    id: string;
    name: string;
    color: string;
};

const CORE_TOOLS: ToolItem[] = [
    {
        name: 'Publishing Tools',
        description: 'Easily draft, schedule, or publish a post.',
        icon: CalendarDays,
        tag: 'Core',
        href: '/dashboard/calendar',
        accent: '#f5c543',
        soft: '#fff7d6',
    },
    {
        name: 'Optimal Send Times',
        description: 'Automatically schedule best post times.',
        icon: Clock3,
        tag: 'Core',
        href: '/dashboard/optimal-send-times',
        accent: '#2f80ed',
        soft: '#dff0ff',
    },
    {
        name: 'Brand Sentiment',
        description: 'Uncover what people are saying.',
        icon: Radio,
        tag: 'Core',
        href: '/dashboard/inbox-activity#listening',
        accent: '#5ad0dd',
        soft: '#ddf8fb',
    },
    {
        name: 'Message Prioritization',
        description: 'Quickly know which messages to tackle.',
        icon: MessageSquareText,
        tag: 'Core',
        href: '/dashboard/inbox-activity#prioritization',
        accent: '#0f4c81',
        soft: '#d9ebfb',
    },
    {
        name: 'Performance Overview',
        description: 'Your overall social performance.',
        icon: PieChart,
        tag: 'Core',
        href: '/dashboard/analytics',
        accent: '#31c667',
        soft: '#defbe7',
        artwork: 'analytics',
    },
    {
        name: 'AI Assist',
        description: 'Use AI to write your captions.',
        icon: Sparkles,
        tag: 'Core',
        href: '/dashboard/posters',
        accent: '#5f6fe8',
        soft: '#e6e9ff',
    },
];

const EXTRA_TOOLS: ToolItem[] = [
    {
        name: 'Competitor Analysis',
        description: 'Track competitor brands on YouTube & Facebook.',
        icon: BarChart2,
        tag: 'Core',
        href: '/dashboard/competitors',
        accent: '#e85d4a',
        soft: '#fff0ee',
    },
    {
        name: 'Facebook Pages Report',
        description: "See what's working and what isn't.",
        icon: FileText,
        tag: 'Core',
        href: '/dashboard',
        accent: '#4f8df7',
        soft: '#e2eeff',
    },
    {
        name: 'Connect more profiles',
        description: 'Get a complete view of your performance.',
        icon: Users,
        tag: 'Core',
        href: '/dashboard/settings',
        accent: '#7c5cff',
        soft: '#efe9ff',
    },
    {
        name: 'Content Labels',
        description: 'Easily label and monitor posts.',
        icon: Tags,
        tag: 'Core',
        href: '/dashboard/calendar',
        accent: '#ff79be',
        soft: '#fff0f7',
    },
    {
        name: 'Asset Library',
        description: 'Content storage for repeat usage.',
        icon: FolderKanban,
        tag: 'Core',
        href: '/dashboard/videos',
        accent: '#27b65b',
        soft: '#e3f8ea',
    },
    {
        name: 'Approval Workflows',
        description: 'Add post approvers.',
        icon: CheckCheck,
        tag: 'Core',
        href: '/dashboard/approvals',
        accent: '#1b9bbb',
        soft: '#def6fb',
    },
    {
        name: 'Social Listening',
        description: 'Insights to inform world-class strategies.',
        icon: Radio,
        tag: 'Premium',
        href: '/dashboard/strategy',
        accent: '#ffd84d',
        soft: '#fff7d6',
    },
    {
        name: 'Ad Campaign Insights',
        description: 'Analyze and improve paid ad campaigns.',
        icon: Megaphone,
        tag: 'Core',
        href: '/dashboard/ad-insights',
        accent: '#ff68b0',
        soft: '#fff0f7',
    },
    {
        name: 'Inbox Activity Report',
        description: "See how you're responding to people.",
        icon: Inbox,
        tag: 'Core',
        href: '/dashboard/inbox-activity',
        accent: '#d95bf3',
        soft: '#fbecff',
    },
    {
        name: 'Groups',
        description: 'Easily manage multiple groups.',
        icon: Shapes,
        tag: 'Core',
        href: '/dashboard',
        accent: '#8e72ff',
        soft: '#efeaff',
    },
];

type IntegrationItem = {
    id: string;
    name: string;
    icon: LucideIcon | ComponentType<{ className?: string }>;
    iconClassName?: string;
    bg: string;
    fg: string;
    ready: boolean;
};

type ResourceLinkItem = {
    label: string;
    href: string;
};

type ResourceSection = {
    title: string;
    icon: LucideIcon;
    links: ResourceLinkItem[];
};

const INTEGRATIONS: IntegrationItem[] = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, bg: 'bg-red-50', fg: 'text-red-600', ready: true },
    { id: 'instagram', name: 'Instagram', icon: Instagram, bg: 'bg-pink-50', fg: 'text-pink-600', ready: true },
    { id: 'facebook', name: 'Facebook', icon: Facebook, bg: 'bg-blue-50', fg: 'text-blue-700', ready: true },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, bg: 'bg-sky-50', fg: 'text-sky-700', ready: true },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, bg: 'bg-zinc-100', fg: 'text-zinc-900', ready: true },
    { id: 'x', name: 'X', icon: XIcon, bg: 'bg-zinc-100', fg: 'text-zinc-900', ready: false },
    { id: 'threads', name: 'Threads', icon: ThreadsIcon, bg: 'bg-zinc-100', fg: 'text-zinc-900', ready: false },
    { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, bg: 'bg-rose-50', fg: 'text-rose-600', ready: false },
    { id: 'snapchat', name: 'Snapchat', icon: SnapchatIcon, bg: 'bg-yellow-50', fg: 'text-yellow-500', ready: false },
    { id: 'google-business', name: 'Google Business', icon: GoogleBusinessIcon, bg: 'bg-emerald-50', fg: 'text-emerald-600', ready: false },
];

const RESOURCE_CENTER_PRIMARY: ResourceSection[] = [
    {
        title: 'Support',
        icon: MessagesSquare,
        links: [
            { label: 'Visit Help Center', href: '/dashboard/settings' },
            { label: 'Chat with Support', href: '/dashboard/emails' },
            { label: 'Submit a Support Ticket', href: '/dashboard/cases' },
        ],
    },
    {
        title: 'Sprout Academy',
        icon: Sparkles,
        links: [
            { label: 'Get Started', href: '/dashboard' },
            { label: 'Learn a Skill', href: '/dashboard/strategy' },
            { label: 'Earn a Certification', href: '/dashboard/analytics' },
        ],
    },
    {
        title: 'Community',
        icon: Users,
        links: [
            { label: 'Ask a Question', href: '/dashboard/emails' },
            { label: 'Networking', href: '/dashboard/settings' },
            { label: 'Share Product Ideas', href: '/dashboard/create' },
        ],
    },
];

const RESOURCE_CENTER_SECONDARY: ResourceSection[] = [
    {
        title: 'Your Account',
        icon: Clock3,
        links: [
            { label: 'Billing', href: '/dashboard/settings' },
            { label: 'Language', href: '/dashboard/settings' },
            { label: 'Time Zone', href: '/dashboard/settings' },
            { label: 'Security', href: '/dashboard/settings' },
            { label: 'Profile Picture', href: '/dashboard/settings' },
            { label: 'Users & Permissions', href: '/dashboard/settings' },
        ],
    },
    {
        title: 'Connect Profile',
        icon: Plus,
        links: [
            { label: 'Facebook', href: '/dashboard/settings?platform=facebook' },
            { label: 'Instagram', href: '/dashboard/settings?platform=instagram' },
            { label: 'LinkedIn', href: '/dashboard/settings?platform=linkedin' },
            { label: 'X', href: '/dashboard/settings?platform=x' },
            { label: 'Pinterest', href: '/dashboard/settings?platform=pinterest' },
        ],
    },
    {
        title: 'Integrations',
        icon: Shapes,
        links: [
            { label: 'Bit.ly', href: '/dashboard/settings' },
            { label: 'Google Analytics', href: '/dashboard/settings' },
            { label: 'Zendesk', href: '/dashboard/settings' },
        ],
    },
    {
        title: 'Power Users',
        icon: FolderKanban,
        links: [
            { label: 'Brand Keywords', href: '/dashboard/strategy' },
            { label: 'Chrome Extension', href: '/dashboard/settings' },
            { label: 'iOS/Android apps', href: '/dashboard/settings' },
            { label: 'Keyboard Shortcuts', href: '/dashboard/settings' },
            { label: 'Message Tagging', href: '/dashboard/emails' },
            { label: 'Contact Lists', href: '/dashboard/emails' },
        ],
    },
];

function ToolArtwork({ tool }: { tool: ToolItem }) {
    const TOOL_IMAGE_BY_NAME: Record<string, string> = {
        'Publishing Tools': 'Publishing Tools.f5d604689b.png',
        'Optimal Send Times': 'Optimal Send Times.be65e442b3.png',
        // In the folder it's stored without the space + with pluralization.
        'Brand Sentiment': 'BrandSentiments.b114548dfe.png',
        // In the folder it's stored without the space.
        'Message Prioritization': 'MessagePrioritization.6123d5d91b.png',
        'Performance Overview': 'Performance Overview.6a44fab696.png',
        'AI Assist': 'AI-Assist.b9ed95d483.png',
        // In the folder it's shortened.
        'Facebook Pages Report': 'Facebook Pages.66db1e21a2.png',
        // In the folder it's shortened.
        'Connect more profiles': 'Connect Profiles.ff5b568aa0.png',
        'Content Labels': 'Content Labels.ff56f45295.png',
        'Asset Library': 'Asset Library.2d3aa53e06.png',
        'Approval Workflows': 'Approval Workflows.e264d8d9c7.png',
        'Social Listening': 'Social Listening.6fa44c0b81.png',
        // In the folder it's stored as a compact label.
        'Ad Campaign Insights': 'AdCampaigns.43b3317de4.png',
        'Inbox Activity Report': 'Inbox Activity Report.21ecdd87e3.png',
        'Groups': 'Groups.395177152f.png',
    };

    const imageFile = TOOL_IMAGE_BY_NAME[tool.name];

    // If we have a matching artwork image, render it inside the existing 48x48 artwork frame.
    // These artwork PNGs include the icon on the left side, so we crop with object-left-center.
    if (imageFile) {
        return (
            <div
                className="relative h-12 w-12 rounded-[5px] border border-[#E5E7EB] overflow-hidden shrink-0"
                style={{ backgroundColor: tool.soft }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`/images/dashboard-imgs/${imageFile}`}
                    alt=""
                    className="h-full w-full object-cover object-left-center"
                />
            </div>
        );
    }

    // Fallback: keep the old lucide-based generated artwork if the image isn't mapped.
    const Icon = tool.icon;

    if (tool.artwork === 'analytics') {
        return (
            <div
                className="relative h-12 w-12 rounded-[5px] border border-[#E5E7EB] overflow-hidden shrink-0"
                style={{ backgroundColor: tool.soft }}
            >
                <div
                    className="absolute left-2.5 bottom-2 h-4 w-1.5 rounded-full"
                    style={{ backgroundColor: `${tool.accent}55` }}
                />
                <div
                    className="absolute left-5 bottom-2 h-6 w-1.5 rounded-full"
                    style={{ backgroundColor: `${tool.accent}80` }}
                />
                <div
                    className="absolute left-[1.85rem] bottom-2 h-3 w-1.5 rounded-full"
                    style={{ backgroundColor: `${tool.accent}40` }}
                />
                <div
                    className="absolute right-2 top-2 h-7 w-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tool.accent }}
                >
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
        );
    }

    return (
        <div
                className="relative h-12 w-12 rounded-[5px] border border-[#E5E7EB] overflow-hidden shrink-0"
            style={{ backgroundColor: tool.soft }}
        >
            <div
                className="absolute left-2 right-2 top-3 h-1.5 rounded-full opacity-70"
                style={{ backgroundColor: `${tool.accent}33` }}
            />
            <div
                className="absolute left-2 right-5 top-6 h-1.5 rounded-full opacity-55"
                style={{ backgroundColor: `${tool.accent}26` }}
            />
            <div
                className="absolute bottom-2 right-2 h-7 w-7 rounded-[5px] flex items-center justify-center"
                style={{ backgroundColor: tool.accent }}
            >
                <Icon className="h-4 w-4 text-white" />
            </div>
        </div>
    );
}

function ToolCard({ tool }: { tool: ToolItem }) {
    return (
        <Link
            href={tool.href}
            className="flex items-start gap-4 px-5 py-4 rounded-[5px] border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all group"
        >
            <ToolArtwork tool={tool} />
            <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-600 group-hover:text-zinc-800 transition-colors">
                    {tool.name}
                </div>
                <div className="text-[13px] text-zinc-600 mt-0.5 leading-snug">
                    {tool.description}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600">
                    {tool.tag === 'Premium' ? (
                        <>
                            <Gem className="h-3 w-3 text-[#6B5AED]" />
                            {tool.tag}
                        </>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200">
                                <Settings className="h-3.5 w-3.5 text-zinc-700" />
                            </span>
                            {tool.tag}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

function IntegrationIcon({ integration }: { integration: IntegrationItem }) {
    const Icon = integration.icon;
    return (
        <TooltipProvider delayDuration={120}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={`/dashboard/settings?platform=${integration.id}`}
                        className={cn(
                            "relative h-12 w-12 rounded-[5px] flex items-center justify-center shrink-0 border border-[#E5E7EB] bg-white transition-all hover:border-[#D1D5DB]"
                        )}
                    >
                        <Icon className={cn("h-5 w-5", integration.fg, integration.iconClassName)} />
                    </Link>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    sideOffset={8}
                    showArrow={false}
                    className="rounded-[5px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151]"
                >
                    {integration.name}
                    {!integration.ready ? ' · Coming soon' : ''}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function ResourceLink({
    item,
    underlined = false,
    showArrow = true,
}: {
    item: ResourceLinkItem;
    underlined?: boolean;
    showArrow?: boolean;
}) {
    return (
        <Link
            href={item.href}
            className={cn(
                "flex w-fit items-center gap-1.5 text-[14px] font-bold text-[#0f4ca7] transition-colors hover:text-[#0A336F]",
                underlined && "underline decoration-[#0C3F89] underline-offset-2 hover:decoration-[#0A336F]"
            )}
        >
            {item.label}
            {showArrow && <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />}
        </Link>
    );
}

function ResourceSectionCard({
    section,
    compact = false,
    underlinedLinks = false,
    showArrow = true,
}: {
    section: ResourceSection;
    compact?: boolean;
    underlinedLinks?: boolean;
    showArrow?: boolean;
}) {
    const Icon = section.icon;

    return (
        <div className={cn("flex h-full flex-col", compact ? "px-4 py-4" : "px-5 py-5")}>
            <div className="flex items-center gap-2 text-[#111827]">
                <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[#F3F4F6]">
                    <Icon className="h-4 w-4 text-[#6B7280]" />
                </div>
                <h3 className="text-sm font-bold">{section.title}</h3>
            </div>
            <div className="mt-4 space-y-2.5">
                {section.links.map((item) => (
                    <ResourceLink key={item.label} item={item} underlined={underlinedLinks} showArrow={showArrow} />
                ))}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [calendarPosts, setCalendarPosts] = useState<CalendarPost[]>([]);
    const [approvalPosts, setApprovalPosts] = useState<StrategyPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [recentSort, setRecentSort] = useState<'latest' | 'scheduled' | 'published'>('latest');
    const [profileNameFromDb, setProfileNameFromDb] = useState<string | null>(null);
    const [labels, setLabels] = useState<LabelItem[]>([]);
    const [recentLabelId, setRecentLabelId] = useState<string>('all');

    const displayName = resolveWelcomeName(user, { dbName: profileNameFromDb });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const scheduleRes = await fetch('/api/schedule');
            if (scheduleRes.ok) {
                const data = await scheduleRes.json();
                const normalized = (data || []).map((item: CalendarPost) => ({
                    ...item,
                    labels: (item.post_labels || []).map((row) => row?.label).filter(Boolean) as { id: string; name: string; color: string }[],
                }));
                setCalendarPosts(normalized.filter((item: CalendarPost) => (item.type || '').toLowerCase() !== 'note'));
            }

            const labelsRes = await fetch('/api/labels');
            if (labelsRes.ok) {
                const labelsData = await labelsRes.json();
                setLabels(labelsData || []);
            }

            const strategiesRes = await fetch('/api/strategy');
            if (strategiesRes.ok) {
                const strategies: StrategySummary[] = await strategiesRes.json();
                const details = await Promise.all(
                    (strategies || []).slice(0, 10).map(async (strategy) => {
                        const detailRes = await fetch(`/api/strategy/${strategy.id}`);
                        if (!detailRes.ok) return null;
                        return detailRes.json();
                    })
                );

                const pendingApprovals = details
                    .filter(Boolean)
                    .flatMap((strategy: StrategyDetail) =>
                        (strategy.posts || []).map((post: StrategyPost) => ({
                            ...post,
                            strategy_id: strategy.id,
                        }))
                    )
                    .filter((post: StrategyPost) => post.status === 'content_ready');

                setApprovalPosts(pendingApprovals);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Load display name from API (Supabase `users.name` — e.g. partner / synced profile).
    useEffect(() => {
        if (!user) {
            setProfileNameFromDb(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/user', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled && res.ok) {
                    const data = (await res.json()) as { name?: string };
                    const n = data.name?.trim();
                    setProfileNameFromDb(n || null);
                }
            } catch {
                if (!cancelled) setProfileNameFromDb(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const todaysPosts = calendarPosts
        .filter((post) => isToday(new Date(post.scheduled_at)))
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    const weekStart = subDays(new Date(), 6);
    const recentPostsBase = calendarPosts.filter((post) => {
        const postDate = new Date(post.scheduled_at);
        return postDate >= weekStart;
    });

    const recentPostsFilteredByLabel = recentLabelId === 'all'
        ? recentPostsBase
        : recentPostsBase.filter((post) => (post.labels || []).some((label) => label.id === recentLabelId));

    const recentPosts = [...recentPostsFilteredByLabel].sort((a, b) => {
        if (recentSort === 'published') {
            const aPublished = a.status === 'completed' || a.status === 'published' ? 1 : 0;
            const bPublished = b.status === 'completed' || b.status === 'published' ? 1 : 0;
            if (aPublished !== bPublished) return bPublished - aPublished;
        }
        if (recentSort === 'scheduled') {
            return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
        }
        return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
    });

    if (isLoading || authLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#2D66C3]" />
                <p className="text-[#6B7280] font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Page header: avatar, welcome, trial CTAs (replaces global dashboard header on this page) */}
            <header className="font-sans sticky top-0 z-30 -mx-3 mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/90 bg-[#F4F5F7] px-3 py-3.5 sm:-mx-4 sm:px-4">
                <div id="dashboard-welcome" className="flex min-w-0 items-center gap-3">
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none bg-[#D1FAE5] text-sm font-bold text-[#047857]"
                        title={displayName}
                    >
                        {getInitialsFromDisplayName(displayName)}
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-bold text-[#111827]">
                            Welcome, {displayName}!
                        </h1>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-9 gap-1.5 rounded-[6px] border-transparent bg-[#6F5ED3] px-4 font-semibold text-sm text-white shadow-sm hover:bg-[#7d6ed2] hover:text-white"
                    >
                        <Gem className="h-3.5 w-3.5" />
                        Trial more features
                    </Button>
                    <Button className="h-9 rounded-[6px] border-0 bg-[#205BC3] px-4 font-semibold text-sm text-white shadow-sm hover:bg-[#7098dd]  hover:text-white">
                        Start my subscription
                    </Button>
                </div>
            </header>

            <div className="space-y-3">
            {/* Explore Section — Sprout-style: blue top accent, progress, tool grid */}
            <div id="dashboard-explore" className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden">
                <div className="h-2 w-full bg-[#2D66C3]" />

                <div className="p-6">
                    <div className="text-xs mt-0 font-extrabold text-black uppercase tracking-wide">
                        Explore Agent Elephant
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#111827] mt-1  ">
                        Check out these core tools first
                    </h2>
                    <p className="text-base text-black mt-1">
                        We recommend these tools for someone just getting started 🌱
                    </p>

                    {/* Progress */}
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="h-2.5 w-full rounded-full bg-[#D1FAE5] overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[#07a537] transition-all duration-1000"
                                style={{ width: '27%' }}
                            />
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#111827] shrink-0">
                            <Check className="h-3 w-3 text-[#1b532c]" strokeWidth={3} />
                            27% complete
                        </span>
                    </div>

                    {/* Core Tools Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                        {CORE_TOOLS.map((tool) => (
                            <ToolCard key={tool.name} tool={tool} />
                        ))}
                    </div>

                    {/* Expanded Tools */}
                    {showMore && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            {EXTRA_TOOLS.map((tool) => (
                                <ToolCard key={tool.name} tool={tool} />
                            ))}
                        </div>
                    )}

                    {/* Show more / Show less */}
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="inline-flex items-center gap-1.5 px-2 py-2 rounded-sm border border-[#131313] bg-white text-sm font-bold text-[#374151] hover:bg-[#F9FAFB] hover:border-[#535454] transition-colors"
                        >
                            {showMore ? (
                                <>
                                    Show less <ChevronUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Show more <ChevronDown className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Integrations Section */}
            <div id="dashboard-integrations" className="rounded-[5px] border border-[#E5E7EB] bg-white p-6">
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
                    <div>
                        <h2 className="text-[20px] font-extrabold text-[#111827] ">
                            Integrations
                        </h2>
                        <p className="text-sm text-zinc-800 mt-0">
                            Connect your social channels. Ready integrations open directly in Settings, while the rest are marked coming soon.
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        {INTEGRATIONS.map((integration) => (
                            <IntegrationIcon key={integration.name} integration={integration} />
                        ))}
                    </div>
                    <Link
                        href="/dashboard/settings"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-zinc-800 bg-white text-sm font-bold text-[#374151] hover:bg-[#F9FAFB] hover:border-[black] transition-colors whitespace-nowrap shrink-0"
                    >
                        Browse all integrations
                    </Link>
                </div>
            </div>

            {/* Latest Activity */}
            <div id="dashboard-activity" className="space-y-4">
                <h2 className="text-[16.5px] font-bold text-[#111827]">Your Latest Activity</h2>
                <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
                    <div className="space-y-4">
                        <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#d5d6d8]">
                                <h3 className="font-bold text-[#111827]">Today&apos;s Publishing</h3>
                            </div>
                            <div className="p-5 min-h-[250px] flex flex-col items-center justify-center text-center">
                                <div className="flex items-center justify-center">
                                    <Image
                                        src="/images/dashboard-imgs/todays-publishing.svg"
                                        alt="Today's Publishing"
                                        width={48}
                                        height={48}
                                        className="h-12 w-auto object-contain"
                                    />
                                </div>
                                {todaysPosts.length > 0 ? (
                                    <div className="mt-4 space-y-2">
                                        <div className="text-2xl font-black text-[#111827]">{todaysPosts.length}</div>
                                        <div className="text-sm font-semibold text-[#374151]">
                                            {todaysPosts.length === 1 ? 'post scheduled today' : 'posts scheduled today'}
                                        </div>
                                        <p className="text-sm text-[#6B7280] max-w-[180px]">
                                            Next post at {format(new Date(todaysPosts[0].scheduled_at), 'h:mm a')}.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mt-4 text-xl font-black text-zinc-700">0</div>
                                        <div className="mt-2 text-xl font-bold text-zinc-700">Publish your first post.</div>
                                        <p className="mt-2 text-[14px] text-zinc-700 max-w-[260px] mx-auto leading-snug">
                                            Publish and schedule to reach your audience at the perfect time.
                                        </p>
                                    </>
                                )}
                                <Link href="/dashboard/calendar" className="mt-5">
                                    <Button variant="outline" className="rounded-[6px] border-[#2d2d2d] font-bold text-zinc-800 hover:bg-[#3a4043] hover:text-white py-0">
                                        Compose Post
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#F3F4F6]">
                                <h3 className="font-bold text-[#111827]">To Do</h3>
                            </div>
                            <div className="divide-y divide-[#F3F4F6]">
                                <Link href="/dashboard/cases" className="flex items-center justify-between px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <MessagesSquare className="h-4 w-4 text-[#6B7280]" />
                                        <span className="text-2xl font-bold text-[#111827]">0</span>
                                    </div>
                                    <span className="text-sm font-semibold text-[#2D66C3]">Go to Cases</span>
                                </Link>
                                <Link href="/dashboard/approvals" className="flex items-center justify-between px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <ClipboardList className="h-4 w-4 text-[#6B7280]" />
                                        <span className="text-2xl font-bold text-[#111827]">{approvalPosts.length}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-[#2D66C3]">Open Approvals</span>
                                </Link>
                            </div>
                            <div className="p-4">
                                <Link href="/dashboard/emails">
                                    <Button variant="outline" className="w-full rounded-[6px] border-[#2a2a2a] font-bold text-[#374151] hover:bg-[#3a4043] hover:text-white" >
                                        You have new messages!
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#F3F4F6] shrink-0">
                            <h3 className="font-bold text-[#111827] text-[18px]">Your Recent Posts</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-zinc-800 font-bold">Label</span>
                                <select
                                    value={recentLabelId}
                                    onChange={(e) => setRecentLabelId(e.target.value)}
                                    className="h-9 min-w-[150px] rounded-sm border border-zinc-200 bg-white pl-3 pr-8 text-sm font-medium text-[#9e9e9e] focus:outline-none focus:ring-1 focus:ring-[#2D66C3] appearance-none bg-no-repeat bg-size-[1rem] bg-position-[right_0.5rem_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23d4d4d8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]"
                                >
                                    <option value="all">All labels</option>
                                    {labels.map((label) => (
                                        <option key={label.id} value={label.id}>
                                            {label.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-zinc-800 font-bold">Sort by</span>
                                <select
                                    value={recentSort}
                                    onChange={(e) => setRecentSort(e.target.value as 'latest' | 'scheduled' | 'published')}
                                    className="h-9 min-w-[200px] rounded-sm border border-zinc-200 bg-white pl-3 pr-10 text-sm font-medium text-[#9e9e9e] focus:outline-none focus:ring-1 focus:ring-[#2D66C3] appearance-none bg-no-repeat bg-size-[1.25rem] bg-position-[right_0.75rem_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23d4d4d8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="scheduled">Upcoming first</option>
                                    <option value="published">Published first</option>
                                </select>
                            </div>
                        </div>

                        {recentPosts.length >= 3 ? (
                            <>
                            <div className="flex-1 min-h-0 p-5 space-y-4 pb-0">
                                {recentPosts.slice(0, 3).map((post) => {
                                    const media = post.media_url?.split(',')[0]?.trim();
                                    const statusLabel = post.status === 'completed' || post.status === 'published' ? 'Published' : 'Scheduled';
                                    return (
                                        <Link
                                            key={post.id}
                                            href="/dashboard/calendar"
                                            className="flex items-start gap-4 rounded-[5px] border border-[#E5E7EB] p-4 hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-colors"
                                        >
                                            <div className="h-20 w-24 rounded-[5px] bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
                                                {media ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={media} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <LayoutGrid className="h-6 w-6 text-[#D1D5DB]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-sm font-bold text-[#111827] truncate">{post.title}</div>
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                                        statusLabel === 'Published' ? "bg-[#D1FAE5] text-[#059669]" : "bg-amber-100 text-amber-800"
                                                    )}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                                                    {post.description || 'No description yet.'}
                                                </p>
                                                {(post.labels || []).length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {post.labels!.map((label) => (
                                                            <span key={label.id} className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                                                {label.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-2 text-xs text-[#9CA3AF]">
                                                    {format(new Date(post.scheduled_at), 'MMM dd, yyyy • h:mm a')}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-[#d5d6d7] px-5 py-3 shrink-0">
                                <span className="text-sm text-[#39393a]">
                                    Published from {format(weekStart, 'MM/dd/yy')} - {format(new Date(), 'MM/dd/yy')}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-[#374151]">
                                    Analyze even more data in the{' '}
                                    <Link href="/dashboard/analytics" className="inline-flex items-center px-3 py-1.5 rounded-sm border border-[#131313] bg-white text-sm font-bold text-[#111827]  hover:bg-[#3a4043] hover:text-white transition-colors">
                                        Post Performance Report
                                    </Link>
                                </span>
                            </div>
                            </>
                        ) : (
                            <div className="min-h-[320px] p-6 flex flex-col justify-between">
                                <div className="flex items-center justify-center flex-1 min-h-0">
                                    <div className="flex items-center gap-8 max-w-[620px]">
                                        <div className="w-[170px] rounded-[5px] border border-[#E5E7EB] bg-white p-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="h-5 w-5 rounded-full bg-[#E5E7EB]" />
                                                <div className="h-3 w-24 rounded bg-[#F3F4F6]" />
                                            </div>
                                            <div className="h-20 rounded-[5px] bg-[#F3F4F6]" />
                                            <div className="mt-3 h-3 w-14 rounded bg-[#F3F4F6]" />
                                        </div>
                                        <div className="max-w-[340px]">
                                            <div className="text-3xl font-bold text-[#111827] leading-snug">
                                                Easily compare your top performing posts once you have at least 3 posts per week.
                                            </div>
                                            <div className="mt-5 pt-4 border-t border-[#E5E7EB] text-lg text-[#6B7280]">
                                                Discover more ways to <Link href="/dashboard/strategy" className="text-[#2D66C3] underline underline-offset-2 hover:text-[#2557a8]">level-up your content strategy</Link>.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#F3F4F6] pt-3 shrink-0">
                                    <span className="text-sm text-[#6B7280]">
                                        Published from {format(weekStart, 'MM/dd/yy')} - {format(new Date(), 'MM/dd/yy')}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm text-[#374151]">
                                        Analyze even more data in the{' '}
                                        <Link href="/dashboard/analytics" className="inline-flex items-center px-3 py-1.5 rounded-md border border-[#131313] bg-white text-sm font-bold text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                                            Post Performance Report
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div id="dashboard-resources" className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-6">
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white">
                        <div className="border-b border-[#F3F4F6] px-5 py-4">
                            <h2 className="text-lg font-bold text-[#111827]">Resource Center</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#F3F4F6]">
                            {RESOURCE_CENTER_PRIMARY.map((section) => (
                                <ResourceSectionCard key={section.title} section={section} underlinedLinks />
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white">
                        <div className="border-b border-[#F3F4F6] px-5 py-4">
                            <h2 className="text-lg font-bold text-[#111827]">Looking for Something Else?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 xl:divide-x divide-[#F3F4F6]">
                            {RESOURCE_CENTER_SECONDARY.map((section) => (
                                <ResourceSectionCard key={section.title} section={section} compact underlinedLinks showArrow={false} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 xl:sticky xl:top-24 self-start">
                    <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-5">
                        <h2 className="text-lg font-bold text-[#111827]">Need Help?</h2>
                        <div className="mt-4 space-y-2.5">
                            <ResourceLink item={{ label: '1.866.878.3231', href: 'tel:18668783231' }} />
                            <ResourceLink item={{ label: 'Contact Support', href: '/dashboard/cases' }} />
                            <ResourceLink item={{ label: '@sproutsocial', href: '/dashboard/settings' }} />
                        </div>
                        <Link href="/dashboard/emails" className="mt-5 block">
                            <Button variant="outline" className="inline-flex items-center px-15 py-1.5 rounded-sm border border-[#131313] bg-white text-sm font-bold text-[#111827]  hover:bg-[#3a4043] hover:text-white transition-colors">
                                Ask a Question
                            </Button>
                        </Link>
                    </div>

                    <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-5 text-center">
                        <div className="mx-auto flex h-28 w-full max-w-[180px] items-center justify-center rounded-[5px]">
                            <Image
                                src="/images/dashboard-imgs/webinar.svg"
                                alt="Webinar"
                                width={120}
                                height={112}
                                className="h-28 w-auto object-contain"
                            />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-[#111827]">Sign up for a free Live Webinar</h3>
                        <p className="mt-2 text-sm text-[#6B7280]">
                            Get up to speed in the platform and participate in a live Q&amp;A.
                        </p>
                        <Link href="/dashboard/analytics" className="mt-5 block">
                            <Button variant="outline" className="inline-flex items-center px-14 py-1.5 rounded-sm border border-[#131313] bg-white text-sm font-bold text-[#111827]  hover:bg-[#3a4043] hover:text-white transition-colors">
                                Reserve My Spot
                            </Button>
                        </Link>
                    </div>

                    <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-5 text-center">
                        <div className="mx-auto flex h-28 w-full max-w-[180px] items-center justify-center rounded-[5px] overflow-hidden">
                            <Image
                                src="/images/dashboard-imgs/rocket.jpeg"
                                alt="Sprout Help Center"
                                width={120}
                                height={112}
                                className="h-28 w-auto object-contain rounded-[5px]"
                            />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-[#111827]">Sprout Help Center</h3>
                        <div className="mt-3 space-y-2 text-left">
                            <ResourceLink item={{ label: 'Organize Your Account', href: '/dashboard/settings' }} />
                            <ResourceLink item={{ label: 'Instagram Scheduling', href: '/dashboard/settings?platform=instagram' }} />
                            <ResourceLink item={{ label: 'Engage with Smart Inbox', href: '/dashboard/emails' }} />
                            <ResourceLink item={{ label: 'Analyze Social Performance', href: '/dashboard/analytics' }} />
                        </div>
                        <Link href="/dashboard/settings" className="mt-5 block">
                            <Button variant="outline" className="inline-flex items-center px-13 py-1.5 rounded-sm border border-[#131313] bg-white text-sm font-bold text-[#111827]  hover:bg-[#3a4043] hover:text-white transition-colors">
                                Visit Help Center
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            </div>

        </div>
    );
}
