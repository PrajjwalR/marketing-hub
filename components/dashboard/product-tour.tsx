'use client';

import { useEffect, useRef } from 'react';
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname } from 'next/navigation';

export function ProductTour() {
    const pathname = usePathname();
    const driverRef = useRef<Driver | null>(null);

    useEffect(() => {
        // Prevent running multiple tours at once or re-running if already done for this path
        const storageKey = `ae_tour_${pathname.replace(/\//g, '_')}_completed`;
        if (localStorage.getItem(storageKey) === 'true') return;

        // Common sidebar steps for the main dashboard home
        const sidebarSteps = [
            { 
                element: '#sidebar-dashboard', 
                popover: { 
                    title: 'Dashboard Home', 
                    description: 'Your central command center for all marketing activities and quick overview.', 
                    side: "right" as const, 
                    align: 'start' as const 
                } 
            },
            { 
                element: '#sidebar-strategy', 
                popover: { 
                    title: 'Strategy Planner', 
                    description: 'Design and manage your long-term marketing strategies with AI assistance.', 
                    side: "right" as const, 
                    align: 'start' as const 
                } 
            },
            { 
                element: '#sidebar-competitors', 
                popover: { 
                    title: 'Competitors Analysis', 
                    description: 'Monitor your competitors social performance and benchmark your growth.', 
                    side: "right" as const, 
                    align: 'start' as const 
                } 
            },
            { 
                element: '#sidebar-content', 
                popover: { 
                    title: 'Content Creation', 
                    description: 'Generate high-quality posts and series using our advanced AI workbench.', 
                    side: "right" as const, 
                    align: 'start' as const 
                } 
            },
            { 
                element: '#sidebar-settings', 
                popover: { 
                    title: 'Admin Settings', 
                    description: 'Configure your profiles, social integrations, and account security.', 
                    side: "right" as const, 
                    align: 'start' as const 
                } 
            },
        ];

        let steps: any[] = [];

        if (pathname === '/dashboard') {
            steps = [
                ...sidebarSteps,
                {
                    element: '#dashboard-welcome',
                    popover: {
                        title: 'Welcome to Agent Elephant',
                        description: 'Your journey starts here. Track your trial and subscription status at a glance.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#dashboard-explore',
                    popover: {
                        title: 'Quick Actions',
                        description: 'Jump straight into our core tools to start creating content immediately.',
                        side: "top" as const
                    }
                },
                {
                    element: '#dashboard-integrations',
                    popover: {
                        title: 'Connect Your Socials',
                        description: 'Sync your accounts across all major platforms to unify your marketing data.',
                        side: "top" as const
                    }
                },
                {
                    element: '#dashboard-activity',
                    popover: {
                        title: 'Activity Stream',
                        description: 'Stay on top of your latest posts and pending tasks in real-time.',
                        side: "top" as const
                    }
                }
            ];
        } else if (pathname === '/dashboard/strategy') {
            steps = [
                {
                    element: '#strategy-header',
                    popover: {
                        title: 'Strategic Planning',
                        description: 'Define your brand voice and goals to let AI power your growth.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#strategy-templates',
                    popover: {
                        title: 'Curated Templates',
                        description: 'Start with professionally crafted templates for various campaign types.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#strategy-generate-btn',
                    popover: {
                        title: 'AI Activation',
                        description: 'Click here to generate a full-scale strategy in seconds.',
                        side: "top" as const
                    }
                }
            ];
        } else if (pathname === '/dashboard/competitors') {
            steps = [
                {
                    element: '#competitors-header',
                    popover: {
                        title: 'Market Intelligence',
                        description: 'Keep a close eye on your competition and identify growth opportunities.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#competitors-filters',
                    popover: {
                        title: 'Smart Filtering',
                        description: 'Narrow down your analysis by platform, category, or time range.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#competitors-table',
                    popover: {
                        title: 'Peer Benchmark',
                        description: 'A side-by-side comparison of key metrics like engagement and growth.',
                        side: "top" as const
                    }
                }
            ];
        } else if (pathname === '/dashboard/calendar') {
            steps = [
                {
                    element: '#calendar-title',
                    popover: {
                        title: 'Editorial Calendar',
                        description: 'Visualize your entire content schedule across all platforms.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#calendar-nav',
                    popover: {
                        title: 'Time Navigation',
                        description: 'Quickly move between days, weeks, and months to plan ahead.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#calendar-view-switcher',
                    popover: {
                        title: 'Flexible Views',
                        description: 'Switch between List, Week, and Month views to suit your planning style.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#calendar-add-btn',
                    popover: {
                        title: 'Schedule Content',
                        description: 'Ready to post? Click here to schedule your next update.',
                        side: "top" as const
                    }
                }
            ];
        } else if (pathname === '/dashboard/posters') {
            steps = [
                {
                    element: '#posters-header',
                    popover: {
                        title: 'Visual Creator',
                        description: 'Transform your ideas into high-impact posters and videos.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#posters-tabs',
                    popover: {
                        title: 'Format Selection',
                        description: 'Switch between Image and Video modes to create diverse content.',
                        side: "bottom" as const
                    }
                }
            ];
        } else if (pathname === '/dashboard/settings') {
            steps = [
                {
                    element: '#settings-header',
                    popover: {
                        title: 'Account Control',
                        description: 'Manage your personal profile and core application preferences.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#settings-profile',
                    popover: {
                        title: 'User Profile',
                        description: 'Keep your personal information and contact details up to date.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#settings-social',
                    popover: {
                        title: 'Social Connections',
                        description: 'Manage API tokens and connections for your social media accounts.',
                        side: "bottom" as const
                    }
                },
                {
                    element: '#settings-support',
                    popover: {
                        title: 'Help & Docs',
                        description: 'Need assistance? Access our documentation and support channels here.',
                        side: "bottom" as const
                    }
                }
            ];
        }

        if (steps.length === 0) return;

        const driverObj = driver({
            showProgress: true,
            popoverClass: 'ae-premium-popover',
            steps: steps,
            onDestroyed: () => {
                localStorage.setItem(storageKey, 'true');
            }
        });

        driverRef.current = driverObj;

        // Delay to ensure elements are rendered
        const timer = setTimeout(() => {
            driverObj.drive();
        }, 1500);

        return () => {
            clearTimeout(timer);
            if (driverRef.current) {
                driverRef.current.destroy();
            }
        };
    }, [pathname]);

    return null;
}


