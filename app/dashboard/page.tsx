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
    BellRing,
    ClipboardList,
    MessagesSquare,
    ArrowUpRight,
    type LucideIcon,
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
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
        href: '/dashboard/calendar',
        accent: '#2f80ed',
        soft: '#dff0ff',
    },
    {
        name: 'Brand Sentiment',
        description: 'Uncover what people are saying.',
        icon: Radio,
        tag: 'Core',
        href: '/dashboard/strategy',
        accent: '#5ad0dd',
        soft: '#ddf8fb',
    },
    {
        name: 'Message Prioritization',
        description: 'Quickly know which messages to tackle.',
        icon: MessageSquareText,
        tag: 'Core',
        href: '/dashboard',
        accent: '#0f4c81',
        soft: '#d9ebfb',
    },
    {
        name: 'Performance Overview',
        description: 'Your overall social performance.',
        icon: PieChart,
        tag: 'Core',
        href: '/dashboard',
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
        href: '/dashboard',
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
        href: '/dashboard',
        accent: '#ff68b0',
        soft: '#fff0f7',
    },
    {
        name: 'Inbox Activity Report',
        description: "See how you're responding to people.",
        icon: Inbox,
        tag: 'Core',
        href: '/dashboard',
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
    const Icon = tool.icon;

    if (tool.artwork === 'analytics') {
        return (
            <div
                className="relative h-12 w-12 rounded-xl border border-white/80 shadow-sm overflow-hidden shrink-0"
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
                    className="absolute right-2 top-2 h-7 w-7 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: tool.accent }}
                >
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative h-12 w-12 rounded-xl border border-white/80 shadow-sm overflow-hidden shrink-0"
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
                className="absolute bottom-2 right-2 h-7 w-7 rounded-lg flex items-center justify-center shadow-sm"
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
            className="flex items-start gap-4 p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all group"
        >
            <ToolArtwork tool={tool} />
            <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                    {tool.name}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 leading-snug">
                    {tool.description}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: tool.tag === 'Premium' ? '#8b5cf6' : '#71717a' }}
                    />
                    {tool.tag}
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
                            "relative h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
                        )}
                    >
                        <Icon className={cn("h-5 w-5", integration.fg, integration.iconClassName)} />
                    </Link>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    sideOffset={8}
                    showArrow={false}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-md"
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
                "flex w-fit items-center gap-1.5 text-xs font-semibold text-blue-800 transition-colors hover:text-blue-900",
                underlined && "underline decoration-blue-800 underline-offset-2 hover:decoration-blue-900"
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
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
                    <Icon className="h-4 w-4 text-zinc-600" />
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
    const { user } = useAuth();
    const [calendarPosts, setCalendarPosts] = useState<CalendarPost[]>([]);
    const [approvalPosts, setApprovalPosts] = useState<StrategyPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [recentSort, setRecentSort] = useState<'latest' | 'scheduled' | 'published'>('latest');

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const scheduleRes = await fetch('/api/schedule');
            if (scheduleRes.ok) {
                const data = await scheduleRes.json();
                setCalendarPosts((data || []).filter((item: CalendarPost) => (item.type || '').toLowerCase() !== 'note'));
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

    const todaysPosts = calendarPosts
        .filter((post) => isToday(new Date(post.scheduled_at)))
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    const weekStart = subDays(new Date(), 6);
    const recentPostsBase = calendarPosts.filter((post) => {
        const postDate = new Date(post.scheduled_at);
        return postDate >= weekStart;
    });

    const recentPosts = [...recentPostsBase].sort((a, b) => {
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

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-zinc-500 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            {/* Welcome Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm shrink-0">
                        {(user?.displayName || user?.email || 'U').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900">
                            Welcome, {displayName}!
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500 font-medium hidden sm:inline">
                        30 days remaining in trial
                    </span>
                    <Button
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-sm px-4 h-9"
                    >
                        Trial more features
                    </Button>
                    <Button className="rounded-full bg-amber-300 text-zinc-900 hover:bg-amber-400 font-bold text-sm px-4 h-9 border border-amber-200">
                        Start my subscription
                    </Button>
                </div>
            </div>

            {/* Explore Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                {/* Green progress bar at top */}
                <div className="h-1.5 w-full bg-amber-300" />

                <div className="p-6">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Explore Agent Elephant
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 mt-1">
                        Check out these core tools first
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        We recommend these tools for someone just getting started.
                    </p>

                    {/* Progress */}
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                            <div className="h-full w-0 bg-emerald-400 rounded-full transition-all duration-1000" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500 shrink-0">0% complete</span>
                    </div>

                    {/* Core Tools Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        {CORE_TOOLS.map((tool) => (
                            <ToolCard key={tool.name} tool={tool} />
                        ))}
                    </div>

                    {/* Expanded Tools */}
                    {showMore && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            {EXTRA_TOOLS.map((tool) => (
                                <ToolCard key={tool.name} tool={tool} />
                            ))}
                        </div>
                    )}

                    {/* Show more / Show less */}
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                        >
                            {showMore ? (
                                <>Show less <ChevronUp className="h-4 w-4" /></>
                            ) : (
                                <>Show more <ChevronDown className="h-4 w-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Integrations Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">
                            Integrations
                        </h2>
                        <p className="text-sm text-zinc-500 mt-0.5">
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
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors whitespace-nowrap shrink-0"
                    >
                        Browse all integrations
                    </Link>
                </div>
            </div>

            {/* Latest Activity */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-zinc-900">Your Latest Activity</h2>
                <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                            <div className="px-5 py-4 border-b border-zinc-100">
                                <h3 className="font-bold text-zinc-900">Today&apos;s Publishing</h3>
                            </div>
                            <div className="p-5 min-h-[250px] flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shadow-sm">
                                    <BellRing className="h-6 w-6" />
                                </div>
                                {todaysPosts.length > 0 ? (
                                    <div className="mt-4 space-y-2">
                                        <div className="text-2xl font-black text-zinc-900">{todaysPosts.length}</div>
                                        <div className="text-sm font-semibold text-zinc-700">
                                            {todaysPosts.length === 1 ? 'post scheduled today' : 'posts scheduled today'}
                                        </div>
                                        <p className="text-sm text-zinc-500 max-w-[180px]">
                                            Next post at {format(new Date(todaysPosts[0].scheduled_at), 'h:mm a')}.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mt-4 text-3xl font-black text-zinc-900">0</div>
                                        <div className="mt-2 text-2xl font-bold text-zinc-900">Publish your first post.</div>
                                        <p className="mt-2 text-sm text-zinc-500 max-w-[190px]">
                                            Publish, schedule or queue to reach your audience at the perfect time.
                                        </p>
                                    </>
                                )}
                                <Link href="/dashboard/calendar" className="mt-5">
                                    <Button variant="outline" className="rounded-xl border-zinc-200 font-bold">
                                        Compose Post
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                            <div className="px-5 py-4 border-b border-zinc-100">
                                <h3 className="font-bold text-zinc-900">To Do</h3>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                <Link href="/dashboard/cases" className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <MessagesSquare className="h-4 w-4 text-zinc-500" />
                                        <span className="text-2xl font-black text-zinc-900">0</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-700">Go to Cases</span>
                                </Link>
                                <Link href="/dashboard/approvals" className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <ClipboardList className="h-4 w-4 text-zinc-500" />
                                        <span className="text-2xl font-black text-zinc-900">{approvalPosts.length}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-700">Open Approvals</span>
                                </Link>
                            </div>
                            <div className="p-4">
                                <Link href="/dashboard/emails">
                                    <Button variant="outline" className="w-full rounded-xl border-zinc-200 font-bold">
                                        You have new messages!
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-zinc-100">
                            <h3 className="font-bold text-zinc-900">Your Recent Posts</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-zinc-500 font-medium">Sort by</span>
                                <select
                                    value={recentSort}
                                    onChange={(e) => setRecentSort(e.target.value as 'latest' | 'scheduled' | 'published')}
                                    className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 focus:outline-none"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="scheduled">Upcoming first</option>
                                    <option value="published">Published first</option>
                                </select>
                            </div>
                        </div>

                        {recentPosts.length >= 3 ? (
                            <div className="p-5 space-y-4">
                                {recentPosts.slice(0, 3).map((post) => {
                                    const media = post.media_url?.split(',')[0]?.trim();
                                    const statusLabel = post.status === 'completed' || post.status === 'published' ? 'Published' : 'Scheduled';
                                    return (
                                        <Link
                                            key={post.id}
                                            href="/dashboard/calendar"
                                            className="flex items-start gap-4 rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                                        >
                                            <div className="h-20 w-24 rounded-lg bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                {media ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={media} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <LayoutGrid className="h-6 w-6 text-zinc-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-sm font-bold text-zinc-900 truncate">{post.title}</div>
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                                        statusLabel === 'Published' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                    )}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                                    {post.description || 'No description yet.'}
                                                </p>
                                                <div className="mt-2 text-xs text-zinc-400">
                                                    {format(new Date(post.scheduled_at), 'MMM dd, yyyy • h:mm a')}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="min-h-[320px] p-6 flex flex-col justify-between">
                                <div className="flex items-center justify-center h-full">
                                    <div className="flex items-center gap-8 max-w-[620px]">
                                        <div className="w-[170px] rounded-2xl border border-zinc-200 bg-white shadow-sm p-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="h-5 w-5 rounded-full bg-zinc-200" />
                                                <div className="h-3 w-24 rounded bg-zinc-100" />
                                            </div>
                                            <div className="h-20 rounded-xl bg-zinc-100" />
                                            <div className="mt-3 h-3 w-14 rounded bg-zinc-100" />
                                        </div>
                                        <div className="max-w-[340px]">
                                            <div className="text-3xl font-bold text-zinc-900 leading-snug">
                                                Easily compare your top performing posts once you have at least 3 posts per week.
                                            </div>
                                            <div className="mt-5 pt-4 border-t border-zinc-200 text-lg text-zinc-600">
                                                Discover more ways to <Link href="/dashboard/strategy" className="text-blue-700 underline underline-offset-2">level-up your content strategy</Link>.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                                    <span className="text-sm text-zinc-500">
                                        Published from {format(weekStart, 'MM/dd/yy')} - {format(new Date(), 'MM/dd/yy')}
                                    </span>
                                    <Link href="/dashboard/analytics">
                                        <Button variant="outline" className="rounded-xl border-zinc-200 font-bold">
                                            Post Performance Report
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-6">
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                        <div className="border-b border-zinc-100 px-5 py-4">
                            <h2 className="text-lg font-bold text-zinc-900">Resource Center</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                            {RESOURCE_CENTER_PRIMARY.map((section) => (
                                <ResourceSectionCard key={section.title} section={section} underlinedLinks />
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                        <div className="border-b border-zinc-100 px-5 py-4">
                            <h2 className="text-lg font-bold text-zinc-900">Looking for Something Else?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 xl:divide-x divide-zinc-100">
                            {RESOURCE_CENTER_SECONDARY.map((section) => (
                                <ResourceSectionCard key={section.title} section={section} compact underlinedLinks showArrow={false} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 xl:sticky xl:top-24 self-start">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                        <h2 className="text-lg font-bold text-zinc-900">Need Help?</h2>
                        <div className="mt-4 space-y-2.5">
                            <ResourceLink item={{ label: '1.866.878.3231', href: 'tel:18668783231' }} />
                            <ResourceLink item={{ label: 'Contact Support', href: '/dashboard/cases' }} />
                            <ResourceLink item={{ label: '@sproutsocial', href: '/dashboard/settings' }} />
                        </div>
                        <Link href="/dashboard/emails" className="mt-5 block">
                            <Button variant="outline" className="w-full rounded-xl border-zinc-200 font-bold">
                                Ask a Question
                            </Button>
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
                        <div className="mx-auto flex h-28 w-full max-w-[180px] items-center justify-center rounded-2xl bg-linear-to-br from-sky-50 via-white to-blue-50">
                            <div className="relative h-16 w-20 rounded-2xl border-2 border-sky-200 bg-white shadow-sm">
                                <div className="absolute inset-x-3 top-3 h-7 rounded-md bg-sky-100" />
                                <div className="absolute -left-3 top-6 h-2 w-2 rounded-full bg-sky-300" />
                                <div className="absolute -right-3 top-3 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                                <div className="absolute left-1/2 top-full mt-2 h-2 w-10 -translate-x-1/2 rounded-full bg-sky-200" />
                            </div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-zinc-900">Sign up for a free Live Webinar</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                            Get up to speed in the platform and participate in a live Q&amp;A.
                        </p>
                        <Link href="/dashboard/analytics" className="mt-5 block">
                            <Button variant="outline" className="w-full rounded-xl border-zinc-200 font-bold">
                                Reserve My Spot
                            </Button>
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
                        <div className="mx-auto flex h-28 w-full max-w-[180px] items-center justify-center rounded-2xl bg-linear-to-br from-emerald-50 via-white to-teal-50">
                            <div className="relative h-16 w-16">
                                <div className="absolute inset-0 rounded-[18px] bg-emerald-200/70 rotate-12" />
                                <div className="absolute inset-0 rounded-[18px] border-2 border-emerald-300 bg-white -rotate-6 shadow-sm" />
                                <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100" />
                                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500" />
                            </div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-zinc-900">Sprout Help Center</h3>
                        <div className="mt-3 space-y-2 text-left">
                            <ResourceLink item={{ label: 'Organize Your Account', href: '/dashboard/settings' }} />
                            <ResourceLink item={{ label: 'Instagram Scheduling', href: '/dashboard/settings?platform=instagram' }} />
                            <ResourceLink item={{ label: 'Engage with Smart Inbox', href: '/dashboard/emails' }} />
                            <ResourceLink item={{ label: 'Analyze Social Performance', href: '/dashboard/analytics' }} />
                        </div>
                        <Link href="/dashboard/settings" className="mt-5 block">
                            <Button variant="outline" className="w-full rounded-xl border-zinc-200 font-bold">
                                Visit Help Center
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
