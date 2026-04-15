'use client';

import { Search, Sparkles, Command, LogOut, Settings as SettingsIcon } from "lucide-react";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/workspace-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const { activeWorkspace } = useWorkspace();

    useEffect(() => {
        const auth = getAuth(app);
        return onAuthStateChanged(auth, setUser);
    }, []);

    const handleSignOut = async () => {
        const auth = getAuth(app);
        await signOut(auth);
        document.cookie = '__session=; path=/; max-age=0';
        router.push('/');
    };

    const displayName = activeWorkspace?.name || user?.displayName || 'User';
    const photoURL = activeWorkspace?.logo_url || user?.photoURL || '';

    const initials = activeWorkspace?.name 
        ? activeWorkspace.name.substring(0, 2).toUpperCase()
        : user?.displayName
            ? user.displayName.substring(0, 2).toUpperCase()
            : user?.email?.substring(0, 2).toUpperCase() || 'U';

    return (
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 shrink-0 transition-all font-sans">
            <div className="flex flex-1 items-center max-w-2xl">
                {/* Enhanced Search Bar */}
                <div className="group flex w-full max-w-[240px] items-center gap-1.5 rounded flex-shrink-0 border border-zinc-200 bg-zinc-50 px-2 py-1 transition-all focus-within:border-zinc-300 focus-within:bg-white focus-within:shadow-sm hover:border-zinc-300">
                    <Search className="h-3 w-3 text-zinc-400 group-focus-within:text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search across Apollo..."
                        className="flex-1 bg-transparent text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-0.5 rounded bg-white border border-zinc-200 px-1 py-0.5 shadow-sm text-[9px] font-medium text-zinc-500">
                        <Command className="h-2.5 w-2.5" />
                        <span>K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Execute with AI button */}
                <button className="flex items-center gap-2 rounded-full bg-zinc-800 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-900">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
                    <span>Execute with AI</span>
                </button>

                {/* Profile Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 hover:ring-2 hover:ring-indigo-100 transition-all outline-none">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={photoURL} alt={displayName} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-medium">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 font-sans mt-2 rounded-xl">
                        <DropdownMenuLabel className="font-normal p-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-bold leading-none text-zinc-900">{displayName}</p>
                                <p className="text-xs leading-none text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-lg m-1 p-2">
                            <Link href="/dashboard/settings" className="cursor-pointer group flex items-center">
                                <SettingsIcon className="mr-2 h-4 w-4 text-zinc-500 group-hover:text-zinc-900" />
                                <span className="font-medium">Profile Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="rounded-lg m-1 p-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer font-bold">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
