'use client';

import React from 'react';
import Link from 'next/link';
import { 
    ArrowRight, 
    CheckCircle2, 
    Layers, 
    Zap, 
    Target, 
    Share2, 
    MessageCircle, 
    TrendingUp, 
    Calendar, 
    Trophy,
    Lightbulb,
    MousePointer2,
    Sparkles,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// --- Mock Data ---

const STRATEGY_CONCEPTS = [
    {
        title: "Knowledge-Based Strategy",
        description: "Establish yourself as an authority by sharing deep insights and expert tips.",
        icon: Lightbulb,
        inspiredBy: "HubSpot, Alex Hormozi",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        title: "Challenge-Based Strategy",
        description: "Engage your audience with actionable challenges that drive real results.",
        icon: Trophy,
        inspiredBy: "75 Hard, 30-Day Challenges",
        color: "text-orange-600",
        bgColor: "bg-orange-50"
    },
    {
        title: "Engagement Strategy",
        description: "Spark conversations and build a community through interactive content.",
        icon: MessageCircle,
        inspiredBy: "Duolingo, Ryan Trahan",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
    },
    {
        title: "Marketing Funnel Strategy",
        description: "Convert followers into customers with a structured path from awareness to sale.",
        icon: Target,
        inspiredBy: "Digital Marketer, ClickFunnels",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
    }
];

const PREVIEW_DAYS = [
    { day: 1, title: "Share a common mistake", description: "Hook your audience with a relatable problem and provide the fix." },
    { day: 2, title: "Explain a key concept", description: "Break down a complex topic into simple, digestible pieces." },
    { day: 3, title: "Ask an engaging question", description: "Drive comments by getting your audience's opinion on a hot topic." },
    { day: 4, title: "Share a quick win case study", description: "Show, don't just tell, the results your methods can achieve." }
];

const HOW_IT_WORKS_STEPS = [
    { number: "01", title: "Choose Platform & Niche", description: "Select where you want to grow and who you are targeting.", icon: Share2 },
    { number: "02", title: "Select Strategy Type", description: "Pick a proven framework that aligns with your current goals.", icon: Layers },
    { number: "03", title: "Generate Content Plan", description: "Our AI crafts a full 30-day roadmap in just a few seconds.", icon: Zap },
    { number: "04", title: "Execute & Grow", description: "Follow the plan, post consistently, and watch your metrics rise.", icon: TrendingUp }
];

const WHY_WORKS_FEATURES = [
    { title: "Proven Frameworks", description: "Based on content strategies used by top-performing brands and creators.", icon: CheckCircle2 },
    { title: "Platform Optimized", description: "Tailored to the unique algorithms of LinkedIn, Instagram, and more.", icon: MousePointer2 },
    { title: "Built for Consistency", description: "Eliminate writer's block with a clear plan for every single day.", icon: Calendar }
];

// --- Components ---

function HeroSection() {
    return (
        <section className="relative py-20 px-6 flex flex-col items-center text-center max-w-4xl mx-auto overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-50/50 blur-3xl -z-10 rounded-full" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
                <Sparkles className="w-3.5 h-3.5" />
                Inspired by real brand strategies
            </div>
            
            <h1 id="dashboard-welcome" className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Generate 30 Days of Content Strategy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold italic">in Seconds</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 font-medium mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                Get proven content ideas tailored to your niche, platform, and specific business goals. No more staring at a blank screen.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <Link href="/dashboard/strategy-generator">
                    <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-8 h-12 text-base font-bold shadow-lg shadow-zinc-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Start Generating
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
                <Button variant="outline" size="lg" className="rounded-xl px-8 h-12 text-base font-bold border-zinc-200 text-zinc-600 bg-white shadow-sm hover:bg-zinc-50 transition-all">
                    Book Demo
                </Button>
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section id="dashboard-explore" className="py-16 px-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12 text-zinc-900 capitalize">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {HOW_IT_WORKS_STEPS.map((step, idx) => (
                    <div key={idx} className="relative group">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-1 group-hover:border-indigo-100">
                                <step.icon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <span className="text-3xl font-black text-zinc-100 group-hover:text-indigo-50 transition-colors">{step.number}</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2 truncate-2-lines">{step.title}</h3>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">{step.description}</p>
                        
                        {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                            <div className="hidden md:block absolute top-6 -right-4 w-8 h-[1px] bg-zinc-100" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function StrategyPreviewCards() {
    return (
        <section id="dashboard-integrations" className="py-16 px-6 bg-zinc-50/50 border-t border-b border-zinc-100">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-black text-center mb-4 text-zinc-900 capitalize">Explore Concept-Driven Strategies</h2>
                <p className="text-zinc-500 font-medium text-center mb-12 max-w-2xl mx-auto">
                    Choose from our collection of battle-tested content frameworks.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STRATEGY_CONCEPTS.map((concept, idx) => (
                        <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden group">
                            <CardContent className="p-6 flex flex-col h-full bg-white">
                                <div className={cn("inline-flex p-3 rounded-2xl mb-5 w-fit transition-all group-hover:scale-110", concept.bgColor, concept.color)}>
                                    <concept.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-black text-zinc-900 mb-3">{concept.title}</h3>
                                <p className="text-sm text-zinc-500 font-medium mb-6 flex-grow leading-relaxed">
                                    {concept.description}
                                </p>
                                <div className="pt-4 border-t border-zinc-50 mt-auto">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Inspired By</p>
                                    <p className="text-xs font-bold text-zinc-600">{concept.inspiredBy}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function OutputPreview() {
    return (
        <section id="dashboard-activity" className="py-24 px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-4xl font-black text-zinc-900 leading-tight">What Your Strategy Looks Like</h2>
                    <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                        Say goodbye to random posting. Every strategy we generate comes with a detailed daily breakdown designed to maintain authority and drive engagement.
                    </p>
                    <div className="pt-4 space-y-4">
                        {['Full 30-Day Roadmap', 'Topic Hooks & Angles', 'Engagement Guidelines', 'Brand-Specific Context'].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold text-zinc-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="relative">
                    {/* Mock Content Plan UI */}
                    <div className="bg-white rounded-[32px] border border-zinc-100 shadow-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar className="w-24 h-24 text-indigo-600" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Sample Output</p>
                                <h4 className="text-xl font-black text-zinc-900">Your 30-Day Plan</h4>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="avatar" className="w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {PREVIEW_DAYS.map((item, idx) => (
                                <div key={idx} className="group/item flex gap-4 p-4 rounded-2xl bg-zinc-50/50 hover:bg-white border border-transparent hover:border-zinc-100 hover:shadow-md transition-all duration-300">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-zinc-100 flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase">Day</span>
                                        <span className="text-lg font-black text-zinc-900 leading-none">{item.day}</span>
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <h5 className="font-bold text-zinc-900 truncate">{item.title}</h5>
                                        <p className="text-xs text-zinc-500 font-medium line-clamp-1">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-zinc-500">Estimated Reach: <span className="text-zinc-900">+14% Growth</span></span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:bg-indigo-50">
                                View Full Plan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function WhySection() {
    return (
        <section className="py-20 px-6 bg-zinc-900 rounded-[48px] m-6 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-black">Built on Research, Not Guesswork</h2>
                    <p className="text-zinc-400 font-medium max-w-xl mx-auto">
                        We analyzed hundreds of top-performing accounts to distill their strategies into our AI generator.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {WHY_WORKS_FEATURES.map((feature, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-indigo-400 group-hover:scale-110 transition-all">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FinalCTA() {
    return (
        <section className="py-24 px-6 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight">
                Start Building Your Content Strategy Today
            </h2>
            <p className="text-lg md:text-xl text-zinc-500 font-medium mb-10 max-w-xl mx-auto">
                Stop wondering what to post. Get a custom roadmap and start growing your community now.
            </p>
            <Link href="/dashboard/strategy-generator">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-14 text-lg font-black shadow-xl shadow-indigo-100 transition-all hover:scale-[1.05] active:scale-[0.95]">
                    Generate My Strategy
                    <Zap className="ml-3 w-5 h-5 fill-white" />
                </Button>
            </Link>
            <p className="mt-8 text-sm font-bold text-zinc-400 uppercase tracking-widest">No guesswork. Just proven ideas.</p>
        </section>
    );
}

// --- Page Component ---

export default function Launchpad() {
    return (
        <div className="min-h-auto font-sans">
            <div className="py-8 space-y-12">
                <HeroSection />
                <HowItWorks />
                <StrategyPreviewCards />
                <OutputPreview />
                <WhySection />
                <FinalCTA />
                
                {/* Footer simple */}
                <div className="pt-12 pb-8 border-t border-zinc-100 text-center">
                    <p className="text-xs font-medium text-zinc-400">© 2024 Agent Elephant. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
