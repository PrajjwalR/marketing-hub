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
    BarChart3,
    CalendarCheck,
    ChevronRight,
    Mail,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { AppSelect } from '@/components/ui/app-select';
import { PageHero, SectionHeader, heroButtonClass } from '@/components/dashboard/page-hero';
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
                className="relative h-14 w-14 rounded-2xl ring-1 ring-black/5 overflow-hidden shrink-0 shadow-sm"
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
                className="relative h-14 w-14 rounded-2xl ring-1 ring-black/5 overflow-hidden shrink-0 shadow-sm"
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
                className="relative h-14 w-14 rounded-2xl ring-1 ring-black/5 overflow-hidden shrink-0 shadow-sm"
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
            className="ae-tile ae-tile-interactive ae-contour group flex items-start gap-4 p-4"
        >
            <ToolArtwork tool={tool} />
            <div className="min-w-0 flex-1">
                <div className="text-[15px] font-extrabold text-zinc-900 group-hover:text-brand-800 transition-colors">
                    {tool.name}
                </div>
                <div className="text-[13px] text-zinc-500 mt-0.5 leading-snug">
                    {tool.description}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600">
                    {tool.tag === 'Premium' ? (
                        <>
                            <Gem className="h-3 w-3 text-gold-600" />
                            {tool.tag}
                        </>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gold-100 px-2 py-0.5 text-gold-800">
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full">
                                <Settings className="h-3 w-3 text-gold-700" />
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
                            "relative h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                        )}
                    >
                        <Icon className={cn("h-5 w-5", integration.fg, integration.iconClassName)} />
                    </Link>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    sideOffset={8}
                    showArrow={false}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
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
                "flex w-fit items-center gap-1.5 text-[14px] font-bold text-brand-700 transition-colors hover:text-brand-900",
                underlined && "underline decoration-brand-300 underline-offset-2"
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
            <div className="flex items-center gap-2 text-zinc-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50">
                    <Icon className="h-4 w-4 text-brand-700" />
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

    const thisWeekCount = recentPostsBase.length;

    if (isLoading || authLoading) {
        return (
            <div className="mx-auto w-full max-w-7xl">
                <PageHero title="Analytics Dashboard" breadcrumb={['Analytics Dashboard']} icon={BarChart3} description="Loading your dashboard…" />
                <div className="ae-tile flex h-[40vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                </div>
            </div>
        );
    }

    const todoRows = [
        { href: '/dashboard/cases', icon: MessagesSquare, count: 0 as number | null, label: 'Open cases' },
        { href: '/dashboard/approvals', icon: ClipboardList, count: approvalPosts.length as number | null, label: 'Approvals' },
        { href: '/dashboard/emails', icon: Mail, count: null as number | null, label: 'Messages' },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl">
            <PageHero
                title={<>Welcome, {displayName}!</>}
                breadcrumb={['Analytics Dashboard']}
                icon={BarChart3}
                description="Your publishing pulse, approvals and the tools that will grow your audience fastest."
                stats={[
                    { label: 'Posts today', value: todaysPosts.length, icon: CalendarCheck },
                    { label: 'Last 7 days', value: thisWeekCount, icon: TrendingUp },
                    { label: 'Awaiting approval', value: approvalPosts.length, icon: ClipboardList },
                ]}
                actions={
                    <>
                        <Link href="/dashboard/billing" className={heroButtonClass('ghost')}>
                            <Gem className="h-4 w-4" />
                            Trial more features
                        </Link>
                        <Link href="/dashboard/billing" className={heroButtonClass('gold')}>
                            Start my subscription
                        </Link>
                    </>
                }
            />

            <div className="space-y-10">
                {/* Explore core tools */}
                <section>
                    <SectionHeader label="Explore Agent Elephant" title="Check out these core tools first" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {CORE_TOOLS.map((tool) => (
                            <ToolCard key={tool.name} tool={tool} />
                        ))}
                        {showMore &&
                            EXTRA_TOOLS.map((tool) => (
                                <ToolCard key={tool.name} tool={tool} />
                            ))}
                    </div>
                    <div className="mt-5 flex justify-center">
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-bold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
                        >
                            {showMore ? (
                                <>Show fewer tools <ChevronUp className="h-4 w-4" /></>
                            ) : (
                                <>More ways to grow <ChevronDown className="h-4 w-4" /></>
                            )}
                        </button>
                    </div>
                </section>

                {/* Integrations */}
                <section className="ae-tile ae-contour p-5 sm:p-6">
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-md">
                            <p className="ae-section-label">Integrations</p>
                            <h2 className="mt-1 font-display text-xl font-semibold text-zinc-900">Connect your social channels</h2>
                            <p className="mt-1 text-sm text-zinc-500">Ready integrations open directly in Settings; the rest are marked coming soon.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            {INTEGRATIONS.map((integration) => (
                                <IntegrationIcon key={integration.name} integration={integration} />
                            ))}
                            <Link href="/dashboard/settings">
                                <Button variant="outline" className="h-12 rounded-2xl">
                                    Browse all <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Latest activity */}
                <section>
                    <div className="ae-divider-label mb-6">
                        <span className="text-[10px] text-zinc-400">◆</span>
                        Your latest activity
                        <span className="text-[10px] text-zinc-400">◆</span>
                    </div>
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
                        <div className="space-y-5">
                            {/* Today's publishing, Moneyview "credit tracker" style */}
                            <div className="ae-hero ae-contour ae-contour-dark rounded-2xl p-5">
                                <div className="relative flex items-center gap-4">
                                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                                        <Image src="/images/dashboard-imgs/todays-publishing.svg" alt="" width={32} height={32} className="h-8 w-auto" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300">Today&apos;s publishing</p>
                                        <p className="font-display text-3xl font-semibold text-white">
                                            {todaysPosts.length}
                                            <span className="ml-1 font-sans text-sm font-medium text-white/55">post{todaysPosts.length === 1 ? '' : 's'}</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="relative mt-3 text-sm text-white/70">
                                    {todaysPosts.length > 0
                                        ? `Next post at ${format(new Date(todaysPosts[0].scheduled_at), 'h:mm a')}.`
                                        : 'Publish and schedule to reach your audience at the perfect time.'}
                                </p>
                                <Link href="/dashboard/calendar" className={cn(heroButtonClass('gold'), 'relative mt-4 h-10 w-full justify-center')}>
                                    Compose post
                                </Link>
                            </div>

                            <div className="ae-tile">
                                <p className="ae-section-label px-5 pt-4">To do</p>
                                <div className="mt-2 divide-y divide-zinc-100">
                                    {todoRows.map((row) => (
                                        <Link key={row.href} href={row.href} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-brand-50/60">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                <row.icon className="h-4 w-4" />
                                            </span>
                                            <span className="flex-1 text-sm font-semibold text-zinc-700">{row.label}</span>
                                            {row.count !== null && <span className="text-lg font-extrabold text-zinc-900">{row.count}</span>}
                                            <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="ae-tile flex flex-col">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                                <div>
                                    <p className="ae-section-label">Last 7 days</p>
                                    <h3 className="font-display text-lg font-semibold text-zinc-900">Your recent posts</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <AppSelect
                                        aria-label="Filter by label"
                                        value={recentLabelId}
                                        onChange={setRecentLabelId}
                                        className="h-9 w-auto min-w-[140px] font-semibold"
                                        options={[
                                            { value: 'all', label: 'All labels' },
                                            ...labels.map((label) => ({ value: label.id, label: label.name })),
                                        ]}
                                    />
                                    <AppSelect
                                        aria-label="Sort posts"
                                        value={recentSort}
                                        onChange={(v) => setRecentSort(v as 'latest' | 'scheduled' | 'published')}
                                        className="h-9 w-auto min-w-[160px] font-semibold"
                                        options={[
                                            { value: 'latest', label: 'Latest' },
                                            { value: 'scheduled', label: 'Upcoming first' },
                                            { value: 'published', label: 'Published first' },
                                        ]}
                                    />
                                </div>
                            </div>

                            {recentPosts.length >= 3 ? (
                                <div className="flex-1 space-y-3 p-4">
                                    {recentPosts.slice(0, 3).map((post) => {
                                        const media = post.media_url?.split(',')[0]?.trim();
                                        const statusLabel = post.status === 'completed' || post.status === 'published' ? 'Published' : 'Scheduled';
                                        return (
                                            <Link
                                                key={post.id}
                                                href="/dashboard/calendar"
                                                className="group flex items-start gap-4 rounded-2xl border border-zinc-200/80 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                                            >
                                                <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
                                                    {media ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={media} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <LayoutGrid className="h-6 w-6 text-zinc-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="truncate text-sm font-bold text-zinc-900">{post.title}</div>
                                                        <span
                                                            className={cn(
                                                                'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                statusLabel === 'Published' ? 'bg-brand-50 text-brand-700' : 'bg-gold-100 text-gold-800'
                                                            )}
                                                        >
                                                            {statusLabel}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{post.description || 'No description yet.'}</p>
                                                    {(post.labels || []).length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {post.labels!.map((label) => (
                                                                <span key={label.id} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                                                                    {label.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 text-xs text-zinc-400">{format(new Date(post.scheduled_at), 'MMM dd, yyyy • h:mm a')}</div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                                        <TrendingUp className="h-6 w-6" />
                                    </span>
                                    <p className="max-w-md font-display text-xl font-semibold text-zinc-900">
                                        Compare your top-performing posts once you publish at least 3 a week.
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        Discover more ways to{' '}
                                        <Link href="/dashboard/strategy" className="font-bold text-brand-700 underline underline-offset-2">
                                            level up your content strategy
                                        </Link>
                                        .
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 text-sm text-zinc-500">
                                <span>
                                    {format(weekStart, 'MMM d')} – {format(new Date(), 'MMM d, yyyy')}
                                </span>
                                <Link href="/dashboard/analytics" className="inline-flex items-center gap-1 font-bold text-brand-700 hover:text-brand-900">
                                    Post performance report <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources */}
                <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-5">
                        <div className="ae-tile">
                            <p className="ae-section-label px-5 pt-5">Resource center</p>
                            <div className="grid grid-cols-1 divide-y divide-zinc-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                                {RESOURCE_CENTER_PRIMARY.map((section) => (
                                    <ResourceSectionCard key={section.title} section={section} />
                                ))}
                            </div>
                        </div>
                        <div className="ae-tile">
                            <p className="ae-section-label px-5 pt-5">Looking for something else?</p>
                            <div className="grid grid-cols-1 divide-y divide-zinc-100 md:grid-cols-2 md:divide-y-0 xl:grid-cols-4 xl:divide-x">
                                {RESOURCE_CENTER_SECONDARY.map((section) => (
                                    <ResourceSectionCard key={section.title} section={section} compact showArrow={false} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 self-start xl:sticky xl:top-6">
                        <div className="ae-tile p-5">
                            <p className="ae-section-label">Need help?</p>
                            <div className="mt-3 space-y-2.5">
                                <ResourceLink item={{ label: '1.866.878.3231', href: 'tel:18668783231' }} />
                                <ResourceLink item={{ label: 'Contact Support', href: '/dashboard/cases' }} />
                                <ResourceLink item={{ label: '@sproutsocial', href: '/dashboard/settings' }} />
                            </div>
                            <Link href="/dashboard/emails" className="mt-4 block">
                                <Button variant="outline" className="w-full">Ask a question</Button>
                            </Link>
                        </div>

                        <div className="ae-tile ae-contour p-5 text-center">
                            <Image src="/images/dashboard-imgs/webinar.svg" alt="" width={120} height={112} className="relative mx-auto h-24 w-auto" />
                            <h3 className="relative mt-3 font-extrabold text-zinc-900">Free live webinar</h3>
                            <p className="relative mt-1 text-sm text-zinc-500">Get up to speed in the platform and join a live Q&amp;A.</p>
                            <Link href="/dashboard/analytics" className="relative mt-4 block">
                                <Button variant="gold" className="w-full">Reserve my spot</Button>
                            </Link>
                        </div>

                        <div className="ae-tile p-5">
                            <div className="flex items-center gap-3">
                                <Image src="/images/dashboard-imgs/rocket.jpeg" alt="" width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
                                <h3 className="font-extrabold text-zinc-900">Sprout Help Center</h3>
                            </div>
                            <div className="mt-4 space-y-2">
                                <ResourceLink item={{ label: 'Organize Your Account', href: '/dashboard/settings' }} />
                                <ResourceLink item={{ label: 'Instagram Scheduling', href: '/dashboard/settings?platform=instagram' }} />
                                <ResourceLink item={{ label: 'Engage with Smart Inbox', href: '/dashboard/emails' }} />
                                <ResourceLink item={{ label: 'Analyze Social Performance', href: '/dashboard/analytics' }} />
                            </div>
                            <Link href="/dashboard/settings" className="mt-4 block">
                                <Button variant="outline" className="w-full">Visit help center</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
