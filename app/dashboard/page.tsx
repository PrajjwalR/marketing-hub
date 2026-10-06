'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApps } from '@/context/apps-context';
import Link from 'next/link';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    CalendarDays,
    Camera,
    Clapperboard,
    GraduationCap,
    Layers,
    Lightbulb,
    Link2,
    ListChecks,
    MessageCircle,
    MessageSquareReply,
    Palette,
    PenSquare,
    Share2,
    Sparkles,
    Swords,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Wand2,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/workspace-context';
import { usePlanLimits } from '@/hooks/use-plan-limits';

// --- Data ---

type Tool = {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    badge?: 'New' | 'Updated';
    external?: boolean;
};

const TOOL_GROUPS: { label: string; tools: Tool[] }[] = [
    {
        label: 'Plan',
        tools: [
            { title: 'Strategy Planner', description: 'Your saved content roadmaps', href: '/dashboard/strategy', icon: Target },
            { title: 'Strategy Prompts', description: 'Prebuilt, battle-tested prompts', href: '/dashboard/prebuilt-strategy-prompts', icon: Lightbulb },
            { title: 'Competitors', description: 'Track rivals & content pillars', href: '/dashboard/competitors', icon: Swords },
            { title: 'Analytics', description: 'Reach, engagement & growth', href: '/dashboard/analytics-dashboard', icon: BarChart3 },
        ],
    },
    {
        label: 'Create',
        tools: [
            { title: 'Create Content', description: 'Posts, carousels & posters', href: '/dashboard/posters', icon: PenSquare },
            { title: 'AI Photoshoot', description: 'Studio-grade product shots', href: '/dashboard/ai-photoshoot/studio', icon: Camera, badge: 'New' },
            { title: 'Designer', description: 'Drag-and-drop canvas editor', href: '/dashboard/designer', icon: Palette },
            { title: 'Series', description: 'Recurring AI video series', href: '/dashboard/series', icon: Layers },
            { title: 'Gallery', description: 'Everything you have made', href: '/dashboard/videos', icon: Clapperboard },
            { title: 'Create New', description: 'Start from a blank brief', href: '/dashboard/create', icon: Wand2 },
        ],
    },
    {
        label: 'Engage & grow',
        tools: [
            { title: 'Postings Calendar', description: 'Schedule across platforms', href: '/dashboard/calendar', icon: CalendarDays },
            { title: 'Auto Reply', description: 'Answer comments & DMs', href: '/dashboard/auto-reply', icon: MessageSquareReply, badge: 'New' },
            { title: 'Contacts', description: 'Your CRM audience', href: '/dashboard/contacts', icon: Users },
            { title: 'Lists', description: 'Segment your audience', href: '/dashboard/lists', icon: ListChecks },
        ],
    },
];

const STRATEGY_CONCEPTS = [
    { title: 'Knowledge-Based', description: 'Become the authority with deep insights and expert tips.', icon: BookOpen, inspiredBy: 'HubSpot, Alex Hormozi' },
    { title: 'Challenge-Based', description: 'Actionable challenges that drive real, visible results.', icon: Trophy, inspiredBy: '75 Hard, 30-Day Challenges' },
    { title: 'Engagement', description: 'Spark conversations and build a loyal community.', icon: MessageCircle, inspiredBy: 'Duolingo, Ryan Trahan' },
    { title: 'Marketing Funnel', description: 'Turn followers into customers, awareness to sale.', icon: TrendingUp, inspiredBy: 'Digital Marketer, ClickFunnels' },
];

const STEPS = [
    { title: 'Connect your accounts', description: 'Link Instagram, LinkedIn, YouTube & more.', href: '/dashboard/settings', icon: Link2 },
    { title: 'Generate a strategy', description: 'A 30-day plan tailored to your niche.', href: '/dashboard/strategy-generator', icon: Sparkles },
    { title: 'Create your content', description: 'Turn each day of the plan into posts.', href: '/dashboard/posters', icon: PenSquare },
    { title: 'Schedule & grow', description: 'Publish on autopilot from the calendar.', href: '/dashboard/calendar', icon: Share2 },
];

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

// --- Building blocks ---

/** Copper/gold "coin" illustration that holds a tool icon, echoing the 3D icons in the references. */
function CoinIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
    return (
        <span
            className={cn(
                'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                'bg-[radial-gradient(circle_at_30%_25%,#fff7dc_0%,#f9c02a_45%,#c98009_100%)]',
                'shadow-[inset_0_-3px_0_rgba(109,60,18,0.35),inset_0_2px_0_rgba(255,255,255,0.6),0_6px_14px_-6px_rgba(160,92,12,0.6)]',
                className
            )}
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-gold-200 shadow-inner">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
        </span>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-md bg-gold-200 px-2 py-0.5 text-[11px] font-bold text-gold-900">
            {children}
        </span>
    );
}

function ToolTile({ tool }: { tool: Tool }) {
    return (
        <Link
            href={tool.href}
            className="ae-tile ae-tile-interactive ae-contour group flex min-h-[148px] flex-col p-4 sm:p-5"
        >
            <div className="relative flex items-start justify-between gap-2">
                <CoinIcon icon={tool.icon} />
                {tool.badge && <Badge>{tool.badge}</Badge>}
            </div>
            <div className="relative mt-auto pt-4">
                <h3 className="text-[15px] font-extrabold leading-snug text-zinc-900 sm:text-base">{tool.title}</h3>
                <div className="mt-1 flex items-end justify-between gap-2">
                    <p className="text-[13px] leading-snug text-zinc-500">{tool.description}</p>
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}

// --- Sections ---

function Hero() {
    const { activeWorkspace } = useWorkspace();
    const { planName } = usePlanLimits();

    return (
        <section id="dashboard-welcome" className="ae-hero ae-contour ae-contour-dark -mx-4 px-5 pb-20 pt-8 sm:-mx-5 sm:px-8 md:mx-0 md:mt-5 md:rounded-[28px] md:px-10 md:pb-24 md:pt-10">
            <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-brand-200">
                        {greeting()}{activeWorkspace?.name ? `, ${activeWorkspace.name}` : ''} 👋
                    </p>
                    <h1 className="mt-2 max-w-2xl text-3xl leading-[1.1] text-white sm:text-4xl md:text-5xl">
                        30 days of content strategy, <em className="font-normal text-gold-300">in seconds.</em>
                    </h1>
                    <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                        Proven ideas tailored to your niche, platform and goals. No more staring at a blank screen.
                    </p>
                </div>
                <Link
                    href="/dashboard/billing"
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-1.5 pr-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-brand-950">
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    {planName}
                </Link>
            </div>

            <div className="relative mt-7 flex flex-wrap items-center gap-3">
                <Link
                    href="/dashboard/strategy-generator"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-gold-400 px-6 text-[15px] font-bold text-brand-950 shadow-lg shadow-black/20 transition-all hover:bg-gold-300 active:scale-[0.98]"
                >
                    Start generating
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                    href="/dashboard/prebuilt-strategy-prompts"
                    className="inline-flex h-12 items-center rounded-xl border border-white/20 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                    Browse templates
                </Link>
            </div>
        </section>
    );
}

/** Overlaps the hero like the Moneyview "My products" card. */
function GettingStarted() {
    return (
        <section id="dashboard-integrations" className="relative -mt-14 md:mx-6">
            <div className="ae-tile p-4 shadow-[0_18px_40px_-20px_rgba(17,58,43,0.35)] sm:p-5">
                <div className="mb-3 flex items-center justify-between px-1">
                    <p className="ae-section-label">Your growth roadmap</p>
                    <span className="text-xs font-semibold text-zinc-400">4 steps</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {STEPS.map((step, i) => (
                        <Link
                            key={step.title}
                            href={step.href}
                            className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-brand-50"
                        >
                            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-white">
                                <step.icon className="h-5 w-5" />
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-[10px] font-extrabold text-brand-950 ring-2 ring-white">
                                    {i + 1}
                                </span>
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-bold text-zinc-900">{step.title}</span>
                                <span className="block truncate text-xs text-zinc-500">{step.description}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Explore() {
    return (
        <section id="dashboard-explore" className="space-y-7">
            <p className="ae-divider-label">
                <span className="text-[10px] text-zinc-400">◆</span>
                Explore tools
                <span className="text-[10px] text-zinc-400">◆</span>
            </p>

            {TOOL_GROUPS.map((group, gi) => (
                <div key={group.label}>
                    <p className="ae-section-label mb-3">{group.label}</p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                        {gi === 0 && (
                            <Link
                                href="/dashboard/strategy-generator"
                                className="ae-tile ae-tile-interactive group col-span-2 flex min-h-[148px] flex-col justify-between border-gold-400/70 lg:col-span-1 bg-gradient-to-br from-gold-100 via-gold-50 to-white p-4 sm:p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xl font-extrabold leading-tight text-gold-800 sm:text-2xl">30-Day Strategy</p>
                                        <p className="mt-1 text-[13px] text-zinc-600">Generate a full plan in seconds</p>
                                    </div>
                                    <span className="rounded-lg bg-brand-800 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gold-200 shadow-sm">
                                        AI
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-zinc-900">Start now</span>
                                    <ArrowRight className="h-5 w-5 text-gold-700 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        )}
                        {group.tools.map((tool) => (
                            <ToolTile key={tool.href} tool={tool} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}

function Concepts() {
    return (
        <section id="dashboard-activity">
            <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <p className="ae-section-label">Concept-driven strategies</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-zinc-900">
                        Frameworks top brands use
                    </h2>
                </div>
                <Link href="/dashboard/strategy-generator" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-900 sm:flex">
                    Try one <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                {STRATEGY_CONCEPTS.map((c) => (
                    <Link
                        key={c.title}
                        href="/dashboard/strategy-generator"
                        className="ae-tile ae-tile-interactive group flex flex-col p-5"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-gold-300">
                            <c.icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-4 font-extrabold text-zinc-900">{c.title} strategy</h3>
                        <p className="mt-1 flex-1 text-[13px] leading-relaxed text-zinc-500">{c.description}</p>
                        <div className="mt-4 border-t border-dashed border-zinc-200 pt-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">Inspired by</p>
                            <p className="mt-0.5 text-xs font-semibold text-zinc-700">{c.inspiredBy}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function LearnBanner() {
    return (
        <section className="ae-hero ae-contour ae-contour-dark flex flex-col items-start justify-between gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="relative flex items-center gap-4">
                <CoinIcon icon={GraduationCap} className="h-14 w-14" />
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-300">Academy</p>
                    <p className="mt-0.5 text-lg font-extrabold text-white sm:text-xl">Learn the playbook behind viral content</p>
                    <p className="text-sm text-white/65">Short lessons on hooks, funnels and consistency.</p>
                </div>
            </div>
            <Link
                href="/dashboard/academy"
                className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-brand-900 transition-colors hover:bg-gold-100"
            >
                Start learning <Zap className="h-4 w-4 text-gold-600" />
            </Link>
        </section>
    );
}

// --- Page ---

export default function Launchpad() {
    const router = useRouter();
    const { isEnabled, ready } = useApps();
    const launchpadOn = isEnabled('launchpad');

    // Login lands on /dashboard; when the Launchpad app is off, the calendar is the home screen.
    useEffect(() => {
        if (ready && !launchpadOn) router.replace('/dashboard/calendar');
    }, [ready, launchpadOn, router]);

    if (!ready || !launchpadOn) return null;

    return (
        <div className="mx-auto max-w-[1280px] space-y-10 pb-6 font-sans">
            <div>
                <Hero />
                <GettingStarted />
            </div>
            <Explore />
            <Concepts />
            <LearnBanner />
            <p className="pt-2 text-center text-xs font-medium text-zinc-400">
                © {new Date().getFullYear()} Agent Elephant
            </p>
        </div>
    );
}
