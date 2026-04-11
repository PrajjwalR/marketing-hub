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
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsub = onAuthStateChanged(auth, (user) => {
            setIsSignedIn(!!user);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleSignOut = async () => {
        const auth = getAuth(app);
        await signOut(auth);
        document.cookie = '__session=; path=/; max-age=0';
        router.push('/');
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#ffffff]/90 backdrop-blur-xl border-b border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "bg-[#ffffff]"
            }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 overflow-hidden">
                        <Image src="/logo.png" alt="Agent Elephant Logo" width={32} height={32} className="object-cover scale-125" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-zinc-900">
                        Agent Elephant
                    </span>
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="px-3.5 py-2 text-1xl font-bold text-zinc-500 transition-colors hover:text-zinc-900 rounded-lg"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {!isSignedIn ? (
                        <>
                            <Link href="/sign-in">
                                <Button variant="ghost" className="hidden text-1xl font-bold text-zinc-600 hover:text-zinc-900 hover:bg-transparent sm:flex">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="h-9 px-5 text-sm font-medium bg-[#f2d412] text-zinc-900 hover:bg-[#f2c912] rounded-full transition-all hover:-translate-y-px shadow-sm">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard">
                                <Button className="h-9 px-5 text-sm font-medium bg-[#f2d412] text-zinc-900 hover:bg-[#f2c112] rounded-full transition-all hover:-translate-y-px shadow-sm">
                                    Dashboard
                                </Button>
                            </Link>
                            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
