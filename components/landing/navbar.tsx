'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "/docs" },
    { label: "About", href: "#about" },
];

export function Navbar() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isPastHero, setIsPastHero] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsub = onAuthStateChanged(auth, (user) => {
            setIsSignedIn(!!user);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // First section (hero) is 100vh. Switch theme when user scrolls past it.
            const threshold = Math.max(window.innerHeight - 90, 500);
            setIsPastHero(window.scrollY >= threshold);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    const handleSignOut = async () => {
        const auth = getAuth(app);
        await signOut(auth);
        document.cookie = '__session=; path=/; max-age=0';
        router.push('/');
    };

    return (
        <div
            className={`fixed inset-x-0 z-50 transition-all duration-300 ${
                isPastHero
                    ? "top-0 px-0 pointer-events-auto"
                    : "top-3 px-3 md:top-4 md:px-6 pointer-events-none"
            }`}
        >
            <header
                className={`transition-all duration-300 backdrop-blur-2xl ${
                    isPastHero
                        ? "w-full rounded-none border-b border-zinc-300/70 bg-[#F5F0E8]/85 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] px-4 sm:px-6 lg:px-8"
                        : "pointer-events-auto max-w-[1360px] mx-auto rounded-[18px] border border-white/[0.14] bg-[rgba(14,13,11,0.52)] shadow-[0_18px_54px_-28px_rgba(0,0,0,0.8)] px-4 md:px-6"
                }`}
            >
                <div
                    className={`mx-auto flex h-14 md:h-16 items-center justify-between transition-all duration-300 ${
                        isPastHero ? "max-w-7xl" : "w-full"
                    }`}
                >
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/30 overflow-hidden">
                            <Image src="/logo.png" alt="Agent Elephant Logo" width={32} height={32} className="object-cover scale-125" />
                        </div>
                        <span
                            className={`text-[17px] font-semibold tracking-tight transition-colors duration-300 ${
                                isPastHero ? "text-zinc-900" : "text-[#f3efe6]"
                            }`}
                        >
                            Agent Elephant
                        </span>
                    </Link>

                    <div className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`px-3.5 py-1.5 text-[14px] font-medium transition-colors duration-300 rounded-lg ${
                                    isPastHero
                                        ? "text-zinc-600 hover:text-zinc-900"
                                        : "text-[#f3efe6]/75 hover:text-[#f3efe6]"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2.5">
                        {!isSignedIn ? (
                            <>
                                <Link href="/sign-in">
                                    <span
                                        className={`hidden md:inline-flex items-center rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-300 ${
                                            isPastHero
                                                ? "bg-white/80 ring-1 ring-zinc-300/80 text-zinc-800 hover:bg-white hover:text-zinc-900 shadow-sm"
                                                : "bg-white/[0.09] ring-1 ring-white/20 text-white hover:bg-white/[0.15]"
                                        }`}
                                    >
                                        Log in
                                    </span>
                                </Link>
                                <Link href="/sign-up">
                                    <span className="inline-flex items-center rounded-full px-4 py-2 text-[14px] font-medium transition-colors bg-[#2fe37a] text-[#0e0d0b] shadow-[0_10px_28px_-14px_rgba(31,168,90,0.72)] hover:bg-[#52ea91]">
                                        Get started
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard">
                                    <span className="inline-flex items-center rounded-full px-4 py-2 text-[14px] font-medium transition-colors bg-[#2fe37a] text-[#0e0d0b] shadow-[0_10px_28px_-14px_rgba(31,168,90,0.72)] hover:bg-[#52ea91]">
                                        Dashboard
                                    </span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 p-2 ${
                                        isPastHero ? "text-zinc-500 hover:text-zinc-900" : "text-[#b9b3a6] hover:text-[#f3efe6]"
                                    }`}
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}
