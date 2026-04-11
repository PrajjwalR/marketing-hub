'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { app } from "@/lib/firebase";
import Link from "next/link";
import { landingHeroTitle, landingSectionLead } from "@/components/landing/typography";

const metrics = [
    { value: "AI-Powered  ", label: "Strategies" },
    { value: "Built for", label: "Speed" },
    { value: "Multi-Platform", label: "supported" },
    { value: "Enterprise-grade", label: "Infrastructure" },
];

export function Hero() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const auth = getAuth(app);
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setIsLoaded(true);
        });
        return () => unsub();
    }, []);

    return (
        <section className="relative overflow-hidden bg-[#F5F0E8] landing-grain">
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="animate-fade-up  flex items-center justify-center gap-2 text-sm text-zinc-600 ">
                        <span className="text-2xl leading-none text-[#F5B800] tracking-[-0.02em]">★★★★★</span>
                        <span className="font-bold text-zinc-900">4.9</span>
                        <span>among most of our users</span>
                    </div>

                    <h1 className={`animate-fade-up stagger-1 p-2 ${landingHeroTitle}`}>
                        AI Marketing Suite Built for Small Teams Who Move Fast.
                    </h1>

                    <p
                        className={`animate-fade-up stagger-2 mx-auto mt-6 max-w-2xl p-2 text-center ${landingSectionLead}`}
                    >
                       
                        Build smarter strategy, auto AI postings, auto scheduling,
                        <br />
                        with a unified platform built for modern sales and marketing teams.
                    </p>

                    <div className="animate-fade-up stagger-3 mt-10 flex flex-wrap items-center justify-center gap-4 p-2">
                        {isLoaded && !user && (
                            <Link href="/sign-up">
                                <Button
                                    size="lg"
                                    className="h-12 px-7 text-[15px] font-medium bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 rounded-full shadow-lg shadow-[#ebf212]/30 transition-all hover:-translate-y-0.5"
                                >
                                    Get started free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        {isLoaded && user && (
                            <Link href="/dashboard">
                                <Button
                                    size="lg"
                                    className="h-12 px-7 text-[15px] font-medium bg-[#f2d412] text-zinc-900 hover:bg-[#f2c112] rounded-full shadow-lg shadow-[#ebf212]/30 transition-all hover:-translate-y-0.5"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        <a
                            href="https://youtu.be/rToR3j5F2YI"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 px-7 text-[15px] font-medium text-zinc-900 hover:text-zinc-900 hover:bg-[#f2c112]/25 border-zinc-300 rounded-full"
                            >
                                <Play className="mr-2 h-4 w-4 fill-current" />
                                Watch demo
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Metrics cards */}
                <div className="animate-fade-up stagger-5 mt-10 flex flex-wrap justify-center gap-3 p-2 sm:gap-4">
                    {metrics.map((m) => (
                        <div key={m.label} className="bg-white rounded-xl border border-zinc-200/80 px-6 py-5 shadow-sm min-w-[140px] sm:min-w-[160px] text-center">
                            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">{m.value}</p>
                            <p className="mt-0.5 text-sm text-zinc-500">{m.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
