'use client';

import { useState, useEffect, Suspense } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePlanLimits } from '@/hooks/use-plan-limits';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import {
    Youtube,
    Instagram,
    Linkedin,
    Facebook,
    Trash2,
    Link2,
    Unlink,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    Zap,
    Loader2,
    Camera,
    Pencil,
    Save
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import {
    GoogleBusinessIcon,
    PinterestIcon,
    SnapchatIcon,
    ThreadsIcon,
    TikTokIcon,
    XIcon,
} from "@/components/dashboard/social-brand-icons";

interface SocialIntegration {
    id: string;
    platform: string;
    name: string;
    client_id: string;
    created_at: string;
}

interface SocialConnection {
    id: string;
    platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'facebook';
    profile_name?: string;
    status?: 'connected' | 'disconnected' | 'error';
    connected_at?: string | null;
    last_sync_at?: string | null;
}

const COMING_SOON_PLATFORMS = [
    {
        platform: 'x',
        Icon: XIcon,
        color: 'text-zinc-900',
        bgColor: 'bg-zinc-100',
    },
    {
        platform: 'threads',
        Icon: ThreadsIcon,
        color: 'text-zinc-900',
        bgColor: 'bg-zinc-100',
    },
    {
        platform: 'pinterest',
        Icon: PinterestIcon,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
    },
    {
        platform: 'snapchat',
        Icon: SnapchatIcon,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
    },
    {
        platform: 'google-business',
        Icon: GoogleBusinessIcon,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
    },
];


function SettingsForm() {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const highlightedPlatform = searchParams.get('platform');

    useEffect(() => {
        const auth = getAuth(app);
        return onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    }, []);

    const user = firebaseUser ? {
        imageUrl: firebaseUser.photoURL || '/placeholder-user.png',
        fullName: firebaseUser.displayName || '',
        primaryEmailAddress: { emailAddress: firebaseUser.email || '' }
    } : null;

    const signOut = async () => {
        const auth = getAuth(app);
        await firebaseSignOut(auth);
        document.cookie = '__session=; path=/; max-age=0';
        router.push('/');
    };

    const { isPlatformAllowed, currentPlan, limits } = usePlanLimits();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    // Handle OAuth callback feedback
    useEffect(() => {
        const connected = searchParams.get('connected');
        const error = searchParams.get('error');

        if (connected) {
            toast.success(`Successfully connected to ${connected}!`);
            router.replace(pathname);
        }

        if (error) {
            if (error === 'suspended') {
                toast.error("Your YouTube account is suspended. Google doesn't allow suspended accounts to use this API.", {
                    duration: 6000,
                });
            } else if (error === 'invalid_grant' || error === 'facebook_token' || error === 'tiktok_token') {
                toast.error("The authorization session expired or failed. Please try connecting again.");
            } else if (error === 'no_instagram_linked') {
                toast.error("No Instagram Business account found linked to your Facebook Pages. Please ensure you have a professional account linked.", {
                    duration: 6000,
                });
            } else {
                toast.error("An error occurred while connecting your account. Please try again.");
            }
            router.replace(pathname);
        }

        const comingSoonSelected = COMING_SOON_PLATFORMS.find((item) => item.platform === highlightedPlatform);
        if (comingSoonSelected) {
            toast.info(`${comingSoonSelected.platform.replace('-', ' ')} integration is coming soon.`);
        }

        // Clean up funky hashes left by Facebook/Instagram OAuth
        if (typeof window !== 'undefined' && window.location.hash === '#_') {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
    }, [searchParams, pathname, router, highlightedPlatform]);

    const [connections, setConnections] = useState<SocialConnection[]>([]);
    const [customIntegrations, setCustomIntegrations] = useState<SocialIntegration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
    const [selectedPlatformToManage, setSelectedPlatformToManage] = useState<string | null>(null);

    const fetchConnections = async () => {
        try {
            const [connResponse, integResponse] = await Promise.all([
                fetch('/api/settings/social'),
                fetch('/api/settings/social/integration')
            ]);
            
            if (connResponse.ok) {
                const data = await connResponse.json();
                setConnections(data);
            }
            if (integResponse.ok) {
                const data = await integResponse.json();
                setCustomIntegrations(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    const handleConnect = async (platform: string) => {
        if (!isPlatformAllowed(platform)) {
            setIsUpgradeModalOpen(true);
            return;
        }

        if (platform === 'youtube') {
            window.location.href = '/api/settings/social/connect/youtube';
            return;
        }

        if (platform === 'linkedin') {
            window.location.href = '/api/settings/social/connect/linkedin';
            return;
        }

        if (platform === 'facebook') {
            window.location.href = '/api/settings/social/connect/facebook';
            return;
        }

        if (platform === 'instagram') {
            window.location.href = '/api/settings/social/connect/instagram';
            return;
        }

        if (platform === 'tiktok') {
            window.location.href = '/api/settings/social/connect/tiktok';
            return;
        }

        const name = `Connected ${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`;

        try {
            const response = await fetch('/api/settings/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, name })
            });

            if (response.ok) {
                fetchConnections();
                toast.success(`Connected to ${platform}`);
            } else {
                toast.error(`Failed to connect to ${platform}`);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    const handleDisconnect = async (id: string, platform: string) => {
        try {
            const response = await fetch('/api/settings/social', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                setConnections(prev => prev.filter(c => c.id !== id));
                toast.success(`Disconnected from ${platform}`);
            } else {
                toast.error(`Failed to disconnect from ${platform}`);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/settings/account/delete', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            toast.success('Account and data deleted successfully');

            setTimeout(() => {
                signOut();
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete account. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 mt-2">Settings</h1>
                <p className="text-zinc-500 font-medium">Manage your profile, social connections, and account security.</p>
            </div>

            {/* Profile Section */}
            <ProfileSection firebaseUser={firebaseUser} />

            {/* Social Integrations Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-zinc-900">Social Media Connections</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/docs" target="_blank">
                            <Button variant="outline" size="sm" className="bg-white hover:bg-zinc-50 font-bold border-zinc-200 text-indigo-600 hover:text-indigo-700">
                                Docs
                            </Button>
                        </Link>
                        <CredentialsManagerModal 
                            customIntegrations={customIntegrations} 
                            onUpdated={fetchConnections} 
                            isOpen={isCredentialsModalOpen}
                            onOpenChange={setIsCredentialsModalOpen}
                            initialPlatform={selectedPlatformToManage}
                            onOpenClick={() => setSelectedPlatformToManage(null)}
                        />
                    </div>
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[250px] rounded-2xl bg-zinc-100/50" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* YouTube */}
                        <SocialPlatformCard
                            platform="youtube"
                            Icon={Youtube}
                            color="text-red-600"
                            bgColor="bg-red-50"
                            connections={connections.filter(c => c.platform === 'youtube')}
                            customIntegrations={customIntegrations.filter(c => c.platform === 'youtube')}
                            onConnect={() => handleConnect('youtube')}
                            onDisconnect={(id: string) => handleDisconnect(id, 'youtube')}
                            allowCustomApp={true}
                            highlighted={highlightedPlatform === 'youtube'}
                            onManageCredentials={() => {
                                setSelectedPlatformToManage('youtube');
                                setIsCredentialsModalOpen(true);
                            }}
                        />

                        {/* Facebook */}
                        <SocialPlatformCard
                            platform="facebook"
                            Icon={Facebook}
                            color="text-blue-700"
                            bgColor="bg-blue-50"
                            connections={connections.filter(c => c.platform === 'facebook')}
                            customIntegrations={customIntegrations.filter(c => c.platform === 'facebook')}
                            onConnect={() => handleConnect('facebook')}
                            onDisconnect={(id: string) => handleDisconnect(id, 'facebook')}
                            allowCustomApp={true}
                            highlighted={highlightedPlatform === 'facebook'}
                            onManageCredentials={() => {
                                setSelectedPlatformToManage('facebook');
                                setIsCredentialsModalOpen(true);
                            }}
                        />

                        {/* LinkedIn */}
                        <SocialPlatformCard
                            platform="linkedin"
                            Icon={Linkedin}
                            color="text-blue-600"
                            bgColor="bg-blue-50"
                            connections={connections.filter(c => c.platform === 'linkedin')}
                            customIntegrations={customIntegrations.filter(c => c.platform === 'linkedin')}
                            onConnect={() => handleConnect('linkedin')}
                            onDisconnect={(id: string) => handleDisconnect(id, 'linkedin')}
                            allowCustomApp={true}
                            highlighted={highlightedPlatform === 'linkedin'}
                            onManageCredentials={() => {
                                setSelectedPlatformToManage('linkedin');
                                setIsCredentialsModalOpen(true);
                            }}
                        />

                        {/* Instagram */}
                        <SocialPlatformCard
                            platform="instagram"
                            Icon={Instagram}
                            color="text-pink-600"
                            bgColor="bg-pink-50"
                            connections={connections.filter(c => c.platform === 'instagram')}
                            customIntegrations={customIntegrations.filter(c => c.platform === 'instagram')}
                            onConnect={() => handleConnect('instagram')}
                            onDisconnect={(id: string) => handleDisconnect(id, 'instagram')}
                            allowCustomApp={true}
                            highlighted={highlightedPlatform === 'instagram'}
                            onManageCredentials={() => {
                                setSelectedPlatformToManage('instagram');
                                setIsCredentialsModalOpen(true);
                            }}
                        />

                        {/* TikTok (Custom Placeholder for now) */}
                        <SocialPlatformCard
                            platform="tiktok"
                            Icon={TikTokIcon}
                            color="text-zinc-900"
                            bgColor="bg-zinc-100"
                            connections={connections.filter(c => c.platform === 'tiktok')}
                            onConnect={() => handleConnect('tiktok')}
                            onDisconnect={(id: string) => handleDisconnect(id, 'tiktok')}
                            highlighted={highlightedPlatform === 'tiktok'}
                        />

                        {COMING_SOON_PLATFORMS.map((item) => (
                            <SocialPlatformCard
                                key={item.platform}
                                platform={item.platform}
                                Icon={item.Icon}
                                color={item.color}
                                bgColor={item.bgColor}
                                connections={[]}
                                comingSoon={true}
                                highlighted={highlightedPlatform === item.platform}
                            />
                        ))}
                    </div>
                )}

            </section>



            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                title="Unlock More Platforms"
                description={`Connecting to Instagram & TikTok is a premium feature. Upgrade to Unlimited to access all social integrations!`}
            />
        </div>
    );
}

function SocialPlatformCard({ platform, Icon, color, bgColor, connections, customIntegrations, onConnect, onDisconnect, allowCustomApp, onManageCredentials, comingSoon, highlighted }: any) {
    const activeConnections = (connections || []).filter((conn: SocialConnection) => (conn.status ?? 'connected') === 'connected');
    const isConnected = activeConnections.length > 0;
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const formatLastSync = (value?: string | null) => {
        if (!value) return 'Not synced yet';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Not synced yet';
        return new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <Card className={cn(
            "border-zinc-200/60 shadow-sm bg-white group hover:shadow-md transition-all duration-300",
            highlighted && "ring-2 ring-amber-300 border-amber-200"
        )}>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl ${bgColor} ${color} transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className="h-10 w-10" />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-zinc-900 capitalize">{platform}</h3>
                            {comingSoon ? (
                                <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] h-5 px-1.5 font-black uppercase tracking-tighter">Soon</Badge>
                            ) : platform !== 'youtube' && (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] h-5 px-1.5 font-black uppercase tracking-tighter">Pro</Badge>
                            )}
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-1">
                            {comingSoon ? "Coming Soon" : isConnected ? `${activeConnections.length} Connected` : "Disconnected"}
                        </p>
                    </div>

                    {comingSoon ? (
                        <div className="w-full space-y-3">
                            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] font-medium text-zinc-500 leading-snug">
                                This integration is not ready yet. It will appear here once supported.
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-full rounded-xl border-zinc-200 text-zinc-400 bg-zinc-50"
                            >
                                Coming soon
                            </Button>
                        </div>
                    ) : (
                        <>
                    {isConnected && (
                        <div className="w-full space-y-3">
                            {activeConnections.map((conn: SocialConnection) => (
                                <div key={conn.id} className="space-y-2 pb-2 border-b border-zinc-100 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Connected</Badge>
                                        <span className="text-[10px] font-semibold text-zinc-500">
                                            Last sync {formatLastSync(conn.last_sync_at ?? conn.connected_at)}
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] font-medium text-zinc-600 truncate">
                                        {conn.profile_name || 'Account'}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                        onClick={() => onDisconnect(conn.id)}
                                    >
                                        <Unlink className="mr-2 h-3.5 w-3.5" />
                                        Disconnect
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Only non-custom apps can connect multiple unless allowCustomApp is handled, we handle custom selection via modal */}
                    {(!isConnected || allowCustomApp) && (
                        allowCustomApp ? (
                            <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant={isConnected ? "outline" : "default"}
                                        size="sm"
                                        className={isConnected ? "w-full rounded-xl" : "w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-transform active:scale-95 shadow-sm"}
                                    >
                                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                        {isConnected ? "Add Another Account" : "Connect Account"}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md bg-white rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 border-b border-zinc-100 pb-3">
                                            <Icon className={`h-5 w-5 ${color}`} />
                                            Select Credentials for {platform}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-2 max-h-[300px] overflow-y-auto">
                                        {customIntegrations && customIntegrations.length > 0 ? (
                                            customIntegrations.map((app: any) => (
                                                <div key={app.id} className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold text-zinc-900">{app.name}</span>
                                                        <span className="text-[10px] font-mono font-bold text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-100">ID: {app.client_id}</span>
                                                    </div>
                                                    <Button 
                                                        onClick={() => {
                                                            window.location.href = `/api/settings/social/connect/${platform}?integrationId=${app.id}`;
                                                        }}
                                                        className="w-full text-white font-bold shadow-sm transition-colors bg-zinc-800 hover:bg-zinc-900"
                                                    >
                                                        Use this Credential
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6">
                                                <p className="text-sm text-zinc-500 mb-4">No saved credentials for {platform}.</p>
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowCredentialsModal(false);
                                                        onManageCredentials?.();
                                                    }}
                                                >
                                                    Manage OAuth Credentials
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Button
                                variant={isConnected ? "outline" : "default"}
                                size="sm"
                                className={isConnected ? "w-full rounded-xl" : "w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-transform active:scale-95 shadow-sm"}
                                onClick={onConnect}
                            >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                {isConnected ? "Add Another Account" : "Connect Account"}
                            </Button>
                        )
                    )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function CredentialsManagerModal({ 
    customIntegrations, 
    onUpdated, 
    isOpen, 
    onOpenChange,
    initialPlatform,
    onOpenClick
}: { 
    customIntegrations: SocialIntegration[], 
    onUpdated: () => void,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    initialPlatform?: string | null,
    onOpenClick?: () => void
}) {
    const [platform, setPlatform] = useState(initialPlatform || 'facebook');
    const [name, setName] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialPlatform) {
                setPlatform(initialPlatform);
            } else {
                setPlatform('facebook');
            }
        }
    }, [isOpen, initialPlatform]);

    const handleSave = async () => {
        if (!clientId || !clientSecret || !name) {
            toast.error("App Name, Client ID and Secret are required");
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings/social/integration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, name, clientId, clientSecret })
            });

            if (!res.ok) throw new Error("Failed to save credentials");
            toast.success("Credentials saved successfully");
            setName('');
            setClientId('');
            setClientSecret('');
            onUpdated();
        } catch (error) {
            toast.error("Failed to save credentials.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const res = await fetch('/api/settings/social/integration', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!res.ok) throw new Error("Failed to delete credentials");
            toast.success("Credentials deleted successfully");
            onUpdated();
        } catch (error) {
            toast.error("Failed to delete credentials.");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white hover:bg-zinc-50 font-bold border-zinc-200" onClick={() => onOpenClick?.()}>
                    Manage OAuth Credentials
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white rounded-2xl flex flex-col max-h-[85vh]">
                <DialogHeader className="shrink-0 flex flex-row items-center justify-between border-b border-zinc-100 pb-3 pr-8">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                        <ShieldAlert className="h-5 w-5 text-indigo-600" />
                        Manage Custom Apps
                    </DialogTitle>
                    {platform && (
                        <Link 
                            href={platform === 'instagram' ? '/docs/instagram' : `/docs/${platform}`} 
                            target="_blank" 
                            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Docs
                        </Link>
                    )}
                </DialogHeader>

                <div className="space-y-6 pt-4 overflow-y-auto pr-2 flex-1 min-h-0">
                    {/* Add new form */}
                    <div className="space-y-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                        <h3 className="text-sm font-bold text-zinc-900">Add New Credential</h3>
                        
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-500">Platform</Label>
                            <Select value={platform} onValueChange={setPlatform} disabled={!!initialPlatform}>
                                <SelectTrigger className="bg-white h-10">
                                    <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(!initialPlatform || initialPlatform === 'facebook') && (
                                        <SelectItem value="facebook">
                                            <div className="flex items-center gap-2">
                                                <Facebook className="h-4 w-4 text-blue-600" />
                                                <span>Facebook</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    {(!initialPlatform || initialPlatform === 'linkedin') && (
                                        <SelectItem value="linkedin">
                                            <div className="flex items-center gap-2">
                                                <Linkedin className="h-4 w-4 text-blue-700" />
                                                <span>LinkedIn</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    {(!initialPlatform || initialPlatform === 'instagram') && (
                                        <SelectItem value="instagram">
                                            <div className="flex items-center gap-2">
                                                <Instagram className="h-4 w-4 text-pink-600" />
                                                <span>Instagram</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    {(!initialPlatform || initialPlatform === 'youtube') && (
                                        <SelectItem value="youtube">
                                            <div className="flex items-center gap-2">
                                                <Youtube className="h-4 w-4 text-red-600" />
                                                <span>YouTube</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-500">App Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} className="bg-white border-zinc-200 text-xs" placeholder="e.g. My Company Page" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-500">Client ID</Label>
                            <Input value={clientId} onChange={e => setClientId(e.target.value)} className="bg-white border-zinc-200 font-mono text-xs" placeholder="Paste Client ID" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-500">Client Secret</Label>
                            <Input type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} className="bg-white border-zinc-200 font-mono text-xs" placeholder="Paste Secret" />
                        </div>
                        
                        <Button 
                            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors" 
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Credentials
                        </Button>
                    </div>

                    {/* Saved Credentials List */}
                    <div className="space-y-3 pb-4">
                        <h3 className="text-sm font-bold text-zinc-900">Saved Credentials</h3>
                        {(() => {
                            const filteredIntegrations = customIntegrations.filter(app => app.platform === platform);
                            if (filteredIntegrations.length === 0) {
                                return <p className="text-sm text-zinc-500 italic">No saved credentials found for {platform}.</p>;
                            }
                            return (
                                <div className="space-y-2 shrink-0">
                                    {filteredIntegrations.map((app) => {
                                        const visibleId = app.client_id.length > 8 
                                            ? `••••${app.client_id.slice(-4)}`
                                            : app.client_id;
                                            
                                        return (
                                        <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 shadow-sm">
                                            <div className="flex items-start gap-3 overflow-hidden mr-2">
                                                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 shrink-0">
                                                    <Link2 className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-0.5 flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold text-zinc-900 capitalize truncate" title={app.name}>{app.name}</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-indigo-100 text-indigo-600 font-medium shrink-0">
                                                            {app.platform}
                                                        </Badge>
                                                        <p className="text-[10px] font-mono text-zinc-500 bg-zinc-50 px-1.5 rounded truncate" title={app.client_id}>
                                                            {visibleId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                                                onClick={() => handleDelete(app.id)}
                                                disabled={isDeleting === app.id}
                                            >
                                                {isDeleting === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                <span className="sr-only">Delete app</span>
                                            </Button>
                                        </div>
                                    )})}
                                </div>
                            );
                        })()}</div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-zinc-500 font-medium">Loading settings...</p>
            </div>
        }>
            <SettingsForm />
        </Suspense>
    );
}
