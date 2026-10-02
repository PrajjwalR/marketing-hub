'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, type ComponentType } from 'react';
import {
    LayoutDashboard, LayoutGrid, Search, Send, DollarSign, Wrench, ArrowDownLeft,
    Bookmark, ShieldCheck, Settings, ChevronDown, ChevronRight,
    ChevronsLeft, Menu, Film, Video, CalendarDays, Plus, CreditCard, User,
    BarChart2, Target, Home, Brain, LogOut, GraduationCap,Bell, Sparkles,
  Camera, MessageSquareReply
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { usePlanLimits } from '@/hooks/use-plan-limits';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher';
import { useActiveHubId, useHubTabs, EXPLORE_TAB_HREF, type HubTab } from '@/components/dashboard/hub-nav';

export const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
  >
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.664 4.82 1.822 6.832L2 30l7.374-1.794A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 2c6.627 0 12 5.373 12 12s-5.373 12-12 12a11.93 11.93 0 0 1-6.168-1.713l-.44-.27-4.573 1.113 1.147-4.458-.287-.459A11.93 11.93 0 0 1 4 16C4 9.373 9.373 4 16 4zm-3.07 5.5c-.234 0-.613.088-.936.438-.322.35-1.23 1.2-1.23 2.926s1.26 3.394 1.435 3.628c.176.234 2.432 3.87 5.982 5.27 2.96 1.17 3.55.938 4.19.88.64-.058 2.07-.847 2.362-1.664.292-.817.292-1.517.205-1.664-.088-.147-.322-.234-.672-.41-.35-.176-2.07-1.022-2.39-1.138-.322-.117-.556-.176-.79.176-.234.35-.906 1.138-1.11 1.372-.205.234-.41.263-.76.088-.35-.176-1.478-.545-2.815-1.737-1.04-.928-1.742-2.074-1.947-2.424-.204-.35-.022-.54.154-.714.158-.157.35-.41.526-.614.175-.205.232-.35.35-.585.116-.234.058-.44-.03-.614-.088-.176-.776-1.897-1.076-2.593-.275-.645-.558-.652-.79-.66a14.8 14.8 0 0 0-.66-.002z"/>
  </svg>
);

export type SidebarSubItem = {
  name: string;
  href: string;
  badge?: string;
  external?: boolean;
};

export type SidebarSection = {
  name: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  href?: string;
  external?: boolean;
  hasBorderBottom?: boolean;
  defaultExpanded?: boolean;
  hasArrow?: boolean;
  /** Section id from lib/apps; the tab is active on any route inside that section. */
  hubId?: string;
  items?: SidebarSubItem[];
  id?: string;
};


/** Sidebar entries: one tab per enabled section, then Explore All Apps (always last). */
export function buildNavSections(hubTabs: HubTab[]): SidebarSection[] {
  return [
    ...hubTabs.map((tab) => ({
      name: tab.name,
      icon: tab.icon,
      href: tab.href,
      external: tab.external,
      hubId: tab.id,
      id: `sidebar-${tab.id}`,
    })),
    { name: 'Explore All Apps', icon: LayoutGrid, href: EXPLORE_TAB_HREF, hubId: 'explore', id: 'sidebar-apps' },
  ];
}

const isDashboardHomePath = (p: string) => p === '/dashboard' || p === '/dashboard/';

/** Expanded rail width (collapsed stays icon-only). */
const SIDEBAR_W_EXPANDED = 'w-[256px]';
const SIDEBAR_BG = 'bg-brand-900';
const SIDEBAR_SECONDARY_BG = 'bg-brand-950';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentPlan, planName } = usePlanLimits();
  const hubTabs = useHubTabs();
  const activeHubId = useActiveHubId();
  const visibleSections = buildNavSections(hubTabs);
  const showUpgrade = false; // All features enabled

  const handleSignOut = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
            document.cookie = '__session=; path=/; max-age=0';
            router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Default: collapsed except on dashboard home (expanded like Sprout reference).
  const [isCollapsed, setIsCollapsed] = useState(
        () => !isDashboardHomePath(pathname)
  );
    const [activeSectionName, setActiveSectionName] = useState<string | null>(null);
  const [showSecondary, setShowSecondary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        ([] as SidebarSection[]).reduce((acc, section) => {
        if (section.items) {
          acc[section.name] = section.defaultExpanded === true;
        }
        return acc;
        }, {} as Record<string, boolean>)
  );

  const isNavItemActive = (href: string) => {
    // Exact match for root dashboard.
    if (href === "/dashboard") return pathname === href;

    // Studio should not be marked active for nested generations routes.
    if (href === "/dashboard/ai-photoshoot/studio") return pathname === href;

    // For other routes, treat nested paths as active (e.g. /generations/[id]).
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleSection = (name: string, items?: SidebarSubItem[]) => {
    if (isCollapsed) {
      if (items && items.length > 0) {
        // Always open/keep open the secondary sidebar when clicking a parent icon
        setActiveSectionName(name);
        setShowSecondary(true);
        setSearchTerm("");

        // Navigate to the first internal sub-item
                const firstInternalItem = items.find(item => !item.external);
        if (firstInternalItem) {
                    const isFirstActive = isNavItemActive(firstInternalItem.href);
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

  // On navigation: expand on dashboard home only; otherwise collapse.
  useEffect(() => {
    setIsCollapsed(!isDashboardHomePath(pathname));
    setShowSecondary(false);
    setActiveSectionName(null);
    setSearchTerm("");
  }, [pathname]);

  useEffect(() => {
    if (!isCollapsed) {
      setShowSecondary(false);
      setActiveSectionName(null);
    } else {
      // When collapsing, highlight the parent section that owns the active route
            const activeParent = visibleSections.find(section =>
                section.items?.some(item =>
                    isNavItemActive(item.href)
                )
      );
      if (activeParent) {
        setActiveSectionName(activeParent.name);
      }
    }
  }, [isCollapsed, pathname]);

  // Handle clicking a link that has sub-links when collapsed
    const activeSection = visibleSections.find(s => s.name === activeSectionName);
    const filteredItems = activeSection?.items?.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="flex">
      <aside
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => {
          if (isDashboardHomePath(pathname)) return;
          setIsCollapsed(true);
          setShowSecondary(false);
          setActiveSectionName(null);
          setSearchTerm("");
        }}
        className={cn(
          "font-sans flex h-screen flex-col overflow-hidden border-r border-white/[0.08] text-white transition-all duration-300",
          SIDEBAR_BG,
                isCollapsed ? "w-14" : SIDEBAR_W_EXPANDED
        )}
      >
        {/* Header / Logo and Toggle */}
            <div className={cn(
            "flex shrink-0 items-center border-b border-white/[0.08]",
                isCollapsed ? "flex-col h-auto py-4 space-y-4 px-0 items-center justify-center" : "h-14 justify-between px-4 gap-3"
            )}>
                <div className={cn(
              "flex items-center overflow-hidden min-w-0 transition-all duration-300",
                    isCollapsed ? "justify-center gap-0" : "justify-start gap-3"
                )}>
                    <div className={cn(
                "flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-all duration-300 rounded-xl bg-gold-100 ring-1 ring-gold-300/60",
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
            <div
              className={cn(
                "flex min-w-0 items-center gap-0 whitespace-nowrap text-xl tracking-tight lowercase transition-all duration-300",
                            isCollapsed ? "invisible w-0 -translate-x-2 overflow-hidden opacity-0" : "visible w-auto translate-x-0 opacity-100"
              )}
              aria-label="Agent Elephant"
            >
              <span className="font-bold text-white">Agent</span>
              <span className="font-extralight text-white">Elephant</span>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0 cursor-pointer rounded-md p-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className={cn(
          'border-b border-white/[0.08] py-2',
          isCollapsed ? 'px-1.5' : 'px-3'
        )}>
          <WorkspaceSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* Navigation Scroll Area */}
            <div className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden pb-3 pt-1 space-y-0 custom-scrollbar",
                isCollapsed ? "px-2" : "px-3"
            )}>
          {visibleSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.name];

            const sidebarItem = (
              <div key={section.name} className="flex flex-col">
                <button
                  id={section.id}
                  onClick={() => toggleSection(section.name, section.items)}
                  className={cn(
                    "group flex cursor-pointer items-center text-[14px] font-bold transition-colors",
                                    isCollapsed ? "mx-auto my-1.5 h-8 w-8 justify-center p-0" : "my-1 w-full justify-between px-2 py-2",
                                    (isCollapsed && (
                                        activeSectionName === section.name && showSecondary ||
                                        section.items?.some(item => isNavItemActive(item.href))
                        ))
                      ? "rounded-xl bg-white text-brand-900 shadow-md"
                                        : "rounded-xl text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                >
                                <div className={cn("flex items-center overflow-hidden", isCollapsed ? "gap-0" : "gap-2.5")}>
                                    <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                                        (isCollapsed && (
                                            (activeSectionName === section.name && showSecondary) ||
                                            section.items?.some(item => isNavItemActive(item.href))
                            ))
                          ? "text-brand-700"
                                            : "text-white/75 group-hover:text-white"
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
                      <ChevronDown className="h-4 w-4 text-white/65 group-hover:text-white/90" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/65 group-hover:text-white/90" />
                    )}
                  </div>
                </button>

                            <div className={cn(
                    "flex flex-col space-y-0.5 relative pl-5 transition-all duration-300 overflow-hidden",
                                (!isCollapsed && isExpanded) ? "max-h-[500px] opacity-100 mt-0.5" : "max-h-0 opacity-0 mt-0"
                            )}>
                                {section.items?.map(item => {
                                        const isActive = isNavItemActive(item.href);

                    if (item.external) {
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl px-3 py-1.5 text-[14px] transition-all duration-300",
                                                        "font-semibold text-white/90 hover:bg-white/10 hover:text-white"
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
                                                    isCollapsed ? "mx-auto my-0.5 h-8 w-8 justify-center p-0" : "my-0.5 flex cursor-pointer items-center justify-between px-3 py-1.5 text-[14px] transition-all duration-300",
                          isActive ? "rounded-2xl" : "rounded-xl",
                          isActive
                            ? "bg-white/[0.12] font-bold text-white shadow-sm ring-1 ring-white/10"
                                                        : "font-semibold text-white/90 hover:bg-white/10 hover:text-white"
                        )}
                      >
                                                <span className={cn(
                            "truncate transition-all duration-300",
                                                    isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto"
                                                )}>{item.name}</span>
                        {item.badge && (
                                                    <span className={cn(
                              "text-[11px] uppercase tracking-wider bg-gold-400 text-brand-950 px-1.5 py-0.5 rounded-sm font-semibold shrink-0 ml-2 transition-all duration-300",
                                                        isCollapsed ? "opacity-0 scale-0 invisible w-0" : "opacity-100 scale-100 visible w-auto"
                                                    )}>
                            {item.badge}
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
                      className="rounded-lg border border-white/10 bg-brand-950 px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-in fade-in zoom-in-95 duration-500"
                    >
                      {section.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                        ) : sidebarItem;
            }

            // Single link items
                    const isAnySubItemActive = visibleSections.some(s => 
                        s.items?.some(i => i.href === pathname)
            );

                    const isActive = section.hubId
                        ? activeHubId === section.hubId
                        : !section.external && (
                        section.href === '/dashboard'
                            ? (pathname === '/dashboard' && !isAnySubItemActive)
                            : pathname.startsWith(section.href!)
                    );

            const linkClasses = cn(
              "group my-0 flex cursor-pointer items-center transition-colors",
              isCollapsed
                ? "mx-auto my-1.5 h-8 w-8 justify-center rounded-xl p-0"
                : "my-1 w-full justify-between px-2 py-2 text-[14px] font-bold",
              isActive
                ? "rounded-xl bg-white text-brand-900 shadow-md"
                : "rounded-xl text-white/90 hover:bg-white/10 hover:text-white",
            );

            const linkContent = (
              <>
                            <div className={cn("flex items-center overflow-hidden", isCollapsed ? "gap-0" : "gap-2.5")}>
                                <Icon className={cn("h-4 w-4 shrink-0 transition-all duration-300", isActive ? "text-brand-700" : "text-white/75 group-hover:text-white")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={cn(
                      "transition-all duration-300 truncate",
                                    isCollapsed ? "opacity-0 invisible w-0 -translate-x-2" : "opacity-100 visible w-auto translate-x-0"
                                )}>
                    {section.name}
                  </span>
                </div>
                            <ChevronRight className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-300",
                                (isCollapsed || !section.hasArrow) ? "opacity-0 invisible w-0" : (isActive ? "text-brand-500 opacity-100" : "text-white/75 opacity-0 group-hover:opacity-100")
                            )} />
              </>
            );

            const singleLinkItem = (
                        <div key={section.name} className={cn("flex flex-col", section.hasBorderBottom && "mb-2 border-b border-white/[0.08] pb-2")}>
                {section.external ? (
                  <a
                    id={section.id}
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
                    id={section.id}
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
                    className="rounded-lg border border-white/10 bg-brand-950 px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-in fade-in zoom-in-95 duration-500"
                  >
                    {section.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
                    ) : singleLinkItem;
          })}
        </div>

        {/* Bottom Actions */}
            <div className={cn("mt-auto border-t border-white/[0.08] pt-2 pb-3 shrink-0", isCollapsed ? "px-2" : "px-3")}>
          {isCollapsed ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignOut}
                    className="group mx-auto my-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl p-0 text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  >
                                    <LogOut className="h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-x-0.5" strokeWidth={2.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={4}
                  showArrow={false}
                  className="rounded-lg border border-white/10 bg-brand-950 px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-in fade-in zoom-in-95 duration-500"
                >
                  Sign out
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
            <Link
              href="/dashboard/billing"
              className="group mb-2 flex items-center gap-3 rounded-2xl border border-gold-300/25 bg-gradient-to-br from-gold-400/15 to-transparent px-3 py-2.5 transition-colors hover:border-gold-300/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-brand-950 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]">
                <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300">Your plan</span>
                <span className="block truncate text-[13px] font-bold text-white">{planName}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="group my-1 flex w-full cursor-pointer items-center rounded-xl px-2 py-2 text-[14px] font-bold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            >
              <div className="flex items-center overflow-hidden gap-2.5">
                            <LogOut className="h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-x-0.5" strokeWidth={2.5} />
                            <span className="truncate transition-all duration-300">Sign out</span>
              </div>
            </button>
            </>
          )}
        </div>

        <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 4px; }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.28); }
        `}</style>
      </aside>

      {/* Secondary Sidebar */}
      {isCollapsed && showSecondary && activeSection && (
        <div
          className={cn(
            "font-sans flex h-screen flex-col border-r border-white/[0.08] text-white transition-all duration-300 animate-in slide-in-from-left-4",
            SIDEBAR_W_EXPANDED,
            SIDEBAR_SECONDARY_BG,
          )}
        >
          {/* Secondary Header */}
          <div className="flex h-14 shrink-0 items-center border-b border-white/[0.08] px-6">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70">
              {activeSection.name}
            </span>
          </div>

          {/* Secondary Search */}
          <div className="shrink-0 px-4 py-4">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/55 transition-colors group-focus-within:text-white" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-none bg-white/10 py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-white/45 transition-all focus:ring-1 focus:ring-white/25"
              />
            </div>
          </div>

          {/* Secondary Links Scroll Area */}
          <div className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
            {filteredItems.map((item) => {
                            const isActive = isNavItemActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "my-1 flex cursor-pointer items-center px-3 py-2 text-[13px] transition-all duration-200",
                    isActive
                      ? "rounded-xl bg-white font-bold text-brand-900 shadow-sm"
                                            : "rounded-xl font-medium text-white/85 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="truncate">{item.name}</span>
                                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-400" />}
                </Link>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-xs text-white/55">No items found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
