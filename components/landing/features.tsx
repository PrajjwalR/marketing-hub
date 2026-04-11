'use client';

import { Calendar, Target, Share2, Sparkles } from "lucide-react";

const features = [
    {
        name: "Strategies",
        description:
            "Build smarter marketing plans with AI-powered insights. Define goals, audiences, and content themes in one place.",
        icon: Target,
    },
    {
        name: "Smart Scheduling",
        description:
            "Plan weeks of content in one sitting. Drag, drop, reorder. Pick the best posting times or let the algorithm decide for you.",
        icon: Calendar,
    },
    {
        name: "Multi-Platform Publish",
        description:
            "One click, every platform. Publish natively to YouTube Shorts, Instagram Reels, and TikTok without leaving your dashboard.",
        icon: Share2,
    },
    {
        name: "Create content with AI",
        description:
            "Describe what you want. Our AI creates visuals, picks music, writes captions, and generates voiceovers — all in under a minute.",
        icon: Sparkles,
    },
];

export function Features() {
    return (
        <section id="features" className="relative bg-[#F5F0E8] pt-12 pb-8 sm:pt-16 sm:pb-10">
            <div className="mx-auto max-w-352 px-6 lg:px-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-10">
                    <div className="max-w-2xl">
                        <p className="text-sm font-bold tracking-widest uppercase text-[#239047] mb-3">
                            Capabilities
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-tight">
                            Every marketer is more productive with Agent Elephant.
                            <br className="hidden sm:block" />
                            <span className="text-zinc-500 font-medium">Create 10x more content while cutting manual work in half.</span>
                        </h2>
                    </div>
                    <div className="max-w-md">
                        <div className="flex items-center gap-4 mb-4">
                            {/* YouTube */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff0000]/10">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#FF0000">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                            </div>
                            {/* Instagram */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E1306C]/10">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#E1306C">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                </svg>
                            </div>
                            {/* TikTok */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900/10">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#000000">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                                </svg>
                            </div>
                            {/* LinkedIn */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </div>
                            {/* Facebook */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2]/10">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </div>
                        </div>
                        <p className="text-base leading-relaxed text-zinc-500">
                            From creating strategy to generating content to publishing, Agent Elephant handles the entire pipeline so you can focus on growing your audience.
                        </p>
                    </div>
                </div>

                {/* Mobile/tablet: 2x2 grid. Desktop: card | arrow | card | arrow | card | + | card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:items-stretch gap-4 lg:gap-4">
                    {/* Card 1 */}
                    <div className="lg:flex-1 lg:min-w-[280px]">
                        <div className="rounded-xl text-zinc-900 bg-zinc-100/80 p-6 sm:p-8 text-center min-h-[200px] flex flex-col justify-center h-full">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 mb-5 mx-auto">
                                <Target className="h-6 w-6 text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{features[0].name}</h3>
                            <p className="text-[12px] leading-relaxed text-zinc-500">{features[0].description}</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex shrink-0 w-12 items-center justify-center self-center">
                        <svg viewBox="0 0 60 40" className="w-full h-6 text-zinc-800">
                            <defs><marker id="arr1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="currentColor" /></marker></defs>
                            <path d="M 0 20 Q 25 5, 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arr1)" />
                        </svg>
                    </div>
                    {/* Card 2 */}
                    <div className="lg:flex-1 lg:min-w-[280px]">
                        <div className="rounded-xl text-zinc-900 bg-zinc-100/80 p-6 sm:p-8 text-center min-h-[200px] flex flex-col justify-center h-full">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 mb-5 mx-auto">
                                <Calendar className="h-6 w-6 text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{features[1].name}</h3>
                            <p className="text-[12px] leading-relaxed text-zinc-500">{features[1].description}</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex shrink-0 w-12 items-center justify-center self-center">
                        <svg viewBox="0 0 60 40" className="w-full h-6 text-zinc-800">
                            <defs><marker id="arr2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="currentColor" /></marker></defs>
                            <path d="M 0 20 Q 25 5, 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arr2)" />
                        </svg>
                    </div>
                    {/* Card 3 */}
                    <div className="lg:flex-1 lg:min-w-[280px]">
                        <div className="rounded-xl text-zinc-900 bg-zinc-100/80 p-6 sm:p-8 text-center min-h-[200px] flex flex-col justify-center h-full">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 mb-5 mx-auto">
                                <Share2 className="h-6 w-6 text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{features[2].name}</h3>
                            <p className="text-[12px] leading-relaxed text-zinc-500">{features[2].description}</p>
                        </div>
                    </div>
                    {/* + centered between card 3 and card 4 */}
                    <div className="hidden lg:flex shrink-0 w-12 h-12 items-center justify-center self-center rounded-full bg-zinc-200/80 text-zinc-800 text-2xl font-semibold leading-none">
                        <span className="block leading-none -translate-y-0.5">+</span>
                    </div>
                    {/* Card 4 */}
                    <div className="lg:flex-1 lg:min-w-[280px]">
                        <div className="rounded-xl text-zinc-900 bg-zinc-100/80 p-6 sm:p-8 text-center min-h-[200px] flex flex-col justify-center h-full">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 mb-5 mx-auto">
                                <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{features[3].name}</h3>
                            <p className="text-[12px] leading-relaxed text-zinc-500">{features[3].description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
