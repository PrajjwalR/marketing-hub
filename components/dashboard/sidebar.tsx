'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Search, Send, DollarSign, Wrench, ArrowDownLeft,
    Bookmark, ShieldCheck, Settings, ChevronDown, ChevronRight,
    ChevronsLeft, Menu, Film, Video, CalendarDays, Plus, CreditCard, User,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePlanLimits } from '@/hooks/use-plan-limits';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const WhatsappIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className={className}
    >
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.664 4.82 1.822 6.832L2 30l7.374-1.794A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 2c6.627 0 12 5.373 12 12s-5.373 12-12 12a11.93 11.93 0 0 1-6.168-1.713l-.44-.27-4.573 1.113 1.147-4.458-.287-.459A11.93 11.93 0 0 1 4 16C4 9.373 9.373 4 16 4zm-3.07 5.5c-.234 0-.613.088-.936.438-.322.35-1.23 1.2-1.23 2.926s1.26 3.394 1.435 3.628c.176.234 2.432 3.87 5.982 5.27 2.96 1.17 3.55.938 4.19.88.64-.058 2.07-.847 2.362-1.664.292-.817.292-1.517.205-1.664-.088-.147-.322-.234-.672-.41-.35-.176-2.07-1.022-2.39-1.138-.322-.117-.556-.176-.79.176-.234.35-.906 1.138-1.11 1.372-.205.234-.41.263-.76.088-.35-.176-1.478-.545-2.815-1.737-1.04-.928-1.742-2.074-1.947-2.424-.204-.35-.022-.54.154-.714.158-.157.35-.41.526-.614.175-.205.232-.35.35-.585.116-.234.058-.44-.03-.614-.088-.176-.776-1.897-1.076-2.593-.275-.645-.558-.652-.79-.66a14.8 14.8 0 0 0-.66-.002z"/>
    </svg>
);

const sidebarData = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        hasBorderBottom: true,
    },
    {
        name: 'Strategy Planner',
        icon: LayoutGrid,
        href: '/dashboard/strategy'
    },
    {
        name: 'Postings Calendar',
        icon: CalendarDays,
        href: '/dashboard/calendar'
    },
    {
        name: 'Content Creation',
        icon: Film,
        defaultExpanded: true,
        items: [
            { name: 'Series', href: '/dashboard/series' },
            { name: 'Gallery', href: '/dashboard/videos' },
            { name: 'Create Content', href: '/dashboard/posters' },
            
            { name: 'Create New', href: '/dashboard/create' },
            // { name: 'Billing', href: '/dashboard/billing' },
        ]
    },
    {
        name: 'Billing',
        icon: CreditCard,
        href: '/dashboard/billing'
    },
    {
        name: 'Whathub',
        icon: WhatsappIcon,
        href: '/api/whathub/sso',
        external: true,
    },
    {
        name: 'CRM',
        icon: CreditCard,
        href: '/dashboard/billing',
        items: [
            { name: 'Contacts', href: '/dashboard/contacts' },
            { name: 'Companies', href: '/dashboard/companies' },
            { name: 'Lists', href: '/dashboard/lists' },
            { name: 'Data enrichment', href: '/dashboard/data-enrichment' },
        ]
    },
    {
        name: 'Engage',
        icon: Send,
        defaultExpanded: true,
        items: [
            { name: 'Sequences', href: '/dashboard/sequences' },
            { name: 'Emails', href: '/dashboard/emails' },
            { name: 'Calls', href: '/dashboard/calls' },
            { name: 'Tasks', href: '/dashboard/tasks' },
        ]
    },
    {
        name: 'Win deals',
        icon: DollarSign,
        defaultExpanded: false,
        items: [
            { name: 'Meetings', href: '/dashboard/meetings' },
            { name: 'Conversations', href: '/dashboard/conversations' },
            { name: 'Deals', href: '/dashboard/deals' },
        ]
    },
    {
        name: 'Tools and automation',
        icon: Wrench,
        defaultExpanded: false,
        items: [
            { name: 'Workflows', href: '/dashboard/workflows' },
            { name: 'Analytics', href: '/dashboard/analytics' },
        ]
    },
    {
        name: 'Inbound',
        icon: ArrowDownLeft,
        defaultExpanded: false,
        items: [
            { name: 'Website visitors', href: '/dashboard/website-visitors', badge: 'New' },
            { name: 'Forms', href: '/dashboard/forms' },
        ]
    },
    {
        name: 'Saved records',
        icon: Bookmark,
        defaultExpanded: false,
        items: [
            { name: 'People', href: '/dashboard/saved-people' },
        ]
    },
    {
        name: 'Deliverability suite',
        icon: ShieldCheck,
        href: '/dashboard/deliverability'
    },
   
    {
        name: 'Admin Settings',
        icon: Settings,
        href: '/dashboard/settings',
        hasArrow: true
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentPlan } = usePlanLimits();
    const showUpgrade = false; // All features enabled

    // Sidebar should start collapsed and expand only on hover.
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeSectionName, setActiveSectionName] = useState<string | null>(null);
    const [showSecondary, setShowSecondary] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        sidebarData.reduce((acc, section) => {
            if (section.items) {
                acc[section.name] = section.defaultExpanded ?? false;
            }
            return acc;
        }, {} as Record<string, boolean>)
    );

    const toggleSection = (name: string, items?: any[]) => {
        if (isCollapsed) {
            if (items && items.length > 0) {
                // Always open/keep open the secondary sidebar when clicking a parent icon
                setActiveSectionName(name);
                setShowSecondary(true);
                setSearchTerm("");
                
                // Navigate to the first internal sub-item
                const firstInternalItem = items.find(item => !item.external);
                if (firstInternalItem) {
                    const isFirstActive = pathname === firstInternalItem.href || (firstInternalItem.href !== '/dashboard' && pathname.startsWith(firstInternalItem.href));
                    if (!isFirstActive) {
                        router.push(firstInternalItem.href);
                    }
                }
                
                return; // Don't expand main sidebar when collapsed
            } else {
                // For single items without children when collapsed
                setIsCollapsed(false);
            }
        }
        setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // Auto-expand section if a sub-item is active
    useEffect(() => {
        sidebarData.forEach(section => {
            if (section.items) {
                const hasActiveChild = section.items.some(item => 
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                );
                if (hasActiveChild) {
                    setExpandedSections(prev => ({ ...prev, [section.name]: true }));
                }
            }
        });
    }, [pathname]);

    // Requirement: on any page navigation, sidebar should auto-collapse.
    useEffect(() => {
        setIsCollapsed(true);
        setShowSecondary(false);
        setActiveSectionName(null);
        setSearchTerm("");
    }, [pathname]);

    // Close secondary sidebar when expanding main sidebar
    // useEffect(() => {
    //     if (!isCollapsed) {
    //         setShowSecondary(false);
    //         setActiveSectionName(null);
    //     }
    // }, [isCollapsed]);

    useEffect(() => {
        if (!isCollapsed) {
            setShowSecondary(false);
            setActiveSectionName(null);
        } else {
            // When collapsing, highlight the parent section that owns the active route
            const activeParent = sidebarData.find(section =>
                section.items?.some(item =>
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                )
            );
            if (activeParent) {
                setActiveSectionName(activeParent.name);
            }
        }
    }, [isCollapsed, pathname]);

    // Handle clicking a link that has sub-links when collapsed
    const activeSection = sidebarData.find(s => s.name === activeSectionName);
    const filteredItems = activeSection?.items?.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="flex">
            <aside 
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => {
                setIsCollapsed(true);
                setShowSecondary(false);
                setActiveSectionName(null);
                setSearchTerm("");
            }}
            className={cn(
                "flex h-screen flex-col border-r border-zinc-200 bg-white transition-all duration-300 overflow-hidden",
                isCollapsed ? "w-14" : "w-[240px]"
            )}
            style={{ 
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
            }}
        >
            {/* Header / Logo and Toggle */}
            <div className={cn(
                "flex items-center shrink-0 border-b border-zinc-100",
                isCollapsed ? "flex-col h-auto py-4 space-y-4 px-0 items-center justify-center" : "h-14 justify-between px-4 gap-3"
            )}>
                <div className={cn(
                    "flex items-center overflow-hidden min-w-0 transition-all duration-300",
                    isCollapsed ? "justify-center gap-0" : "justify-start gap-3"
                )}>
                    <div className={cn(
                        "flex items-center justify-center rounded-lg bg-emerald-100 overflow-hidden shrink-0 shadow-sm transition-all duration-300",
                        isCollapsed ? "h-7 w-7" : "h-8 w-8"
                    )}>
                        <Image 
                            src="/logo.png" 
                            alt="Agent Elephant Logo" 
                            width={isCollapsed ? 28 : 32} 
                            height={isCollapsed ? 28 : 32} 
                            className={cn("transition-all duration-300 object-cover", !isCollapsed && "scale-125")} 
                        />
                    </div>
                    <span className={cn(
                        "font-bold text-zinc-900 truncate tracking-tight text-sm transition-all duration-300",
                        isCollapsed ? "opacity-0 invisible w-0 -translate-x-2" : "opacity-100 visible w-auto translate-x-0"
                    )}>
                        Agent Elephant
                    </span>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer shrink-0"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Navigation Scroll Area */}
            <div className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden pb-3 pt-1 space-y-0 custom-scrollbar",
                isCollapsed ? "px-2" : "px-3"
            )}>
                {sidebarData.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSections[section.name];

                    const sidebarItem = (
                        <div key={section.name} className="flex flex-col">
                            <button
                                onClick={() => toggleSection(section.name, section.items)}
                                className={cn(
                                    "group flex items-center rounded-md text-[12px] font-bold transition-colors cursor-pointer",
                                    // isCollapsed ? "justify-center w-8 h-8 p-0 mx-auto" : "justify-between w-full px-2 py-2 my-1",
                                    isCollapsed ? "justify-center w-8 h-8 p-0 mx-auto my-1.5" : "justify-between w-full px-2 py-2 my-1",
                                    // (isCollapsed && activeSectionName === section.name && showSecondary) 
                                    //     ? "bg-zinc-900 text-white shadow-md"
                                    //     : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    (isCollapsed && (
                                        activeSectionName === section.name && showSecondary ||
                                        section.items?.some(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                                    ))
                                        ? "bg-zinc-900 text-white shadow-md" 
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                )}
                            >
                                <div className={cn("flex items-center overflow-hidden", isCollapsed ? "gap-0" : "gap-2.5")}>
                                    <Icon className={cn(
                                        "h-4 w-4 shrink-0 transition-colors",
                                        // (isCollapsed && activeSectionName === section.name && showSecondary)
                                        //     ? "text-white"
                                        //     : "text-zinc-500 group-hover:text-zinc-900"
                                        (isCollapsed && (
                                            (activeSectionName === section.name && showSecondary) ||
                                            section.items?.some(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                                        ))
                                            ? "text-white"
                                            : "text-zinc-500 group-hover:text-zinc-900"
                                    )} strokeWidth={2} />
                                    <span className={cn(
                                        "transition-all duration-300 truncate",
                                        isCollapsed ? "opacity-0 w-0 invisible -translate-x-2" : "opacity-100 w-auto visible translate-x-0"
                                    )}>
                                        {section.name}
                                    </span>
                                </div>
                                <div className={cn(
                                    "transition-all duration-300 shrink-0",
                                    isCollapsed ? "opacity-0 scale-0 invisible w-0" : "opacity-100 scale-100 visible w-auto"
                                )}>
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                                    )}
                                </div>
                            </button>

                            <div className={cn(
                                "flex flex-col space-y-0.5 relative pl-5 transition-all duration-300 overflow-hidden",
                                (!isCollapsed && isExpanded) ? "max-h-[500px] opacity-100 mt-0.5" : "max-h-0 opacity-0 mt-0"
                            )}>
                                {section.items?.map(item => {
                                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                                        if ((item as any).external) {
                                            return (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn(
                                                        "flex items-center rounded-md px-3 py-1.5 text-[12px] transition-all duration-300 justify-between cursor-pointer",
                                                        "text-zinc-500 font-medium hover:bg-zinc-100 hover:text-zinc-900"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "truncate transition-all duration-300",
                                                        isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto"
                                                    )}>{item.name}</span>
                                                </a>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={cn(
                                                    isCollapsed ? "justify-center w-8 h-8 p-0 my-0.5 mx-auto" : "flex items-center rounded-md px-3 py-1.5 text-[12px] transition-all duration-300 justify-between cursor-pointer my-0.5",
                                                    isActive
                                                        ? "bg-zinc-800 text-white font-bold shadow-sm"
                                                        : "text-zinc-500 font-medium hover:bg-zinc-100 hover:text-zinc-900"
                                                )}
                                            >
                                                <span className={cn(
                                                    "truncate transition-all duration-300",
                                                    isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto"
                                                )}>{item.name}</span>
                                                {(item as any).badge && (
                                                    <span className={cn(
                                                        "text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm font-semibold shrink-0 ml-2 transition-all duration-300",
                                                        isCollapsed ? "opacity-0 scale-0 invisible w-0" : "opacity-100 scale-100 visible w-auto"
                                                    )}>
                                                        {(item as any).badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                        </div>
                    );

                    if (section.items) {
                        return isCollapsed ? (
                            <TooltipProvider key={section.name} delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {sidebarItem}
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        sideOffset={4}
                                        showArrow={false}
                                        className="bg-white text-zinc-600 border border-zinc-200 shadow-sm px-3 py-1.5 text-xs font-medium rounded-md animate-in fade-in zoom-in-95 duration-500"
                                    >
                                        {section.name}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : sidebarItem;
                    }

                    // Single link items
                    const isAnySubItemActive = sidebarData.some(s => 
                        s.items?.some(i => i.href === pathname)
                    );

                    const isActive = !section.external && (
                        section.href === '/dashboard'
                            ? (pathname === '/dashboard' && !isAnySubItemActive)
                            : pathname.startsWith(section.href!)
                    );

                    const linkClasses = cn(
                        "group flex items-center transition-colors my-0 cursor-pointer",
                        // isCollapsed
                        //     ? "justify-center w-8 h-8 p-0 rounded-md my-1 mx-auto"
                        //     : "w-full justify-between px-2 py-2 text-[12px] font-bold my-1",
                        isCollapsed
                            ? "justify-center w-8 h-8 p-0 rounded-md my-1.5 mx-auto"
                            : "w-full justify-between px-2 py-2 text-[12px] font-bold my-1",
                        isActive
                            ? "bg-zinc-800 text-white rounded-md shadow-sm"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded-md",
                    );

                    const linkContent = (
                        <>
                            <div className={cn("flex items-center overflow-hidden", isCollapsed ? "gap-0" : "gap-2.5")}>
                                <Icon className={cn("h-4 w-4 shrink-0 transition-all duration-300", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={cn(
                                    "transition-all duration-300 truncate",
                                    isCollapsed ? "opacity-0 invisible w-0 -translate-x-2" : "opacity-100 visible w-auto translate-x-0"
                                )}>
                                    {section.name}
                                </span>
                            </div>
                            <ChevronRight className={cn(
                                "h-4 w-4 shrink-0 transition-all duration-300",
                                (isCollapsed || !section.hasArrow) ? "opacity-0 invisible w-0" : (isActive ? "text-zinc-300 opacity-100" : "text-zinc-400 opacity-0 group-hover:opacity-100")
                            )} />
                        </>
                    );

                    const singleLinkItem = (
                        <div key={section.name} className={cn("flex flex-col", section.hasBorderBottom && "border-b border-zinc-200 pb-2 mb-2")}>
                            {(section as any).external ? (
                                <a
                                    href={section.href!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={linkClasses}
                                    onClick={() => setShowSecondary(false)}
                                >
                                    {linkContent}
                                </a>
                            ) : (
                                <Link
                                    href={section.href!}
                                    className={linkClasses}
                                    onClick={() => setShowSecondary(false)}
                                >
                                    {linkContent}
                                </Link>
                            )}
                        </div>
                    );

                    return isCollapsed ? (
                        <TooltipProvider key={section.name} delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {singleLinkItem}
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    sideOffset={4}
                                    showArrow={false}
                                    className="bg-white text-zinc-600 border border-zinc-200 shadow-sm px-3 py-1.5 text-xs font-medium rounded-md animate-in fade-in zoom-in-95 duration-500"
                                >
                                    {section.name}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : singleLinkItem;
                })}
            </div>

                <div className="h-4 border-t border-zinc-200 mt-auto bg-zinc-50" />

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 4px; }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #d4d4d8; }
                `}</style>
            </aside>

            {/* Secondary Sidebar */}
            {isCollapsed && showSecondary && activeSection && (
                <div 
                    className={cn(
                        "w-[240px] border-r border-zinc-200 bg-white h-screen flex flex-col transition-all duration-300 animate-in slide-in-from-left-4",
                    )}
                >
                    {/* Secondary Header */}
                    <div className="h-14 flex items-center px-6 border-b border-zinc-100 shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                            {activeSection.name}
                        </span>
                    </div>

                    {/* Secondary Search */}
                    <div className="px-4 py-4 shrink-0">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-50 border-none rounded-md py-2 pl-9 pr-3 text-[12px] focus:ring-1 focus:ring-zinc-200 transition-all placeholder:text-zinc-400"
                            />
                        </div>
                    </div>

                    {/* Secondary Links Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar pb-6">
                        {filteredItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-md px-3 py-2 text-[12px] transition-all duration-200 cursor-pointer my-1",
                                        isActive
                                            ? "bg-zinc-800 text-white font-bold shadow-sm"
                                            : "text-zinc-500 font-medium hover:bg-zinc-100 hover:text-zinc-900"
                                    )}
                                >
                                    <span className="truncate">{item.name}</span>
                                    {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-white/40" />}
                                </Link>
                            );
                        })}
                        {filteredItems.length === 0 && (
                            <div className="px-3 py-8 text-center">
                                <p className="text-[11px] text-zinc-400">No items found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
