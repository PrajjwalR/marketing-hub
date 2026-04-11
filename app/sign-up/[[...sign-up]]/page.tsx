'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { HelloStoresLoginModal } from '@/components/hellostores-login-modal';
import { RedefineLoginModal } from '@/components/redefine-login-modal';
import { CROSS_APP_PROVIDERS } from '@/lib/cross-app-providers';
import { ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHelloStoresModalOpen, setIsHelloStoresModalOpen] = useState(false);
    const [isRedefineModalOpen, setIsRedefineModalOpen] = useState(false);
    const router = useRouter();

    const setSessionCookie = async (firebaseUser: import('firebase/auth').User) => {
        const token = await firebaseUser.getIdToken();
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (name) {
                await updateProfile(userCredential.user, { displayName: name });
            }
            await setSessionCookie(userCredential.user);
            router.push('/dashboard');
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (error.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters');
            } else {
                setError(error.message || 'Failed to create account');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(auth, provider);
            await setSessionCookie(cred.user);
            router.push('/dashboard');
        } catch (err: unknown) {
            setError((err as { message?: string }).message || 'Google sign-up failed');
        }
    };

    const handleHelloStoresLogin = () => setIsHelloStoresModalOpen(true);
    const handleRedefineLogin = () => setIsRedefineModalOpen(true);

    const handleLoginSuccess = async (email: string, pass: string, extraData?: { org_id?: string; project_id?: string; source_login?: string }) => {
        setIsHelloStoresModalOpen(false);
        setIsRedefineModalOpen(false);
        setLoading(true);
        try {
            if (extraData) {
                localStorage.setItem('partner_auth_info', JSON.stringify(extraData));
            }
            const cred = await signInWithEmailAndPassword(auth, email, pass);
            await setSessionCookie(cred.user);
            router.push('/dashboard');
        } catch (err: unknown) {
            setError((err as { message?: string }).message || 'Agent Elephant sign-up failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCrossAppLogin = (providerId: string) => {
        if (providerId === 'hellostores') handleHelloStoresLogin();
        else if (providerId === 'redefine') handleRedefineLogin();
    };

    return (
        <div className="relative flex min-h-screen items-start justify-center bg-[#F5F0E8] landing-grain pt-8 pb-12">

            <div className="relative z-10 w-full max-w-[420px] mx-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <div className="flex items-center gap-2.5 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 overflow-hidden">
                        <Image src="/logo.png" alt="Agent Elephant" width={40} height={40} className="object-cover scale-125" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-900">Agent Elephant</span>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Create your account</h1>
                    <p className="mt-1.5 text-[15px] text-zinc-500">Start creating AI videos in seconds. Free to get started.</p>

                    {error && (
                        <div className="mt-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailSignUp} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Full name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 pl-4 pr-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 pl-4 pr-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Password (min. 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full h-12 pl-4 pr-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[15px] transition-all hover:-translate-y-px shadow-lg shadow-zinc-900/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-xs font-medium tracking-widest uppercase text-zinc-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleGoogleSignUp}
                            type="button"
                            className="w-full h-12 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 font-medium text-[15px] transition-all flex items-center justify-center gap-3"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        {CROSS_APP_PROVIDERS.map((provider) => (
                            <button
                                key={provider.id}
                                onClick={() => handleCrossAppLogin(provider.id)}
                                type="button"
                                className="w-full h-12 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 font-medium text-[15px] transition-all flex items-center justify-center gap-3"
                            >
                                <div
                                    className="h-6 w-6 rounded-lg flex items-center justify-center text-white text-xs font-black"
                                    style={{ backgroundColor: provider.color }}
                                >
                                    {provider.name.charAt(0)}
                                </div>
                                Sign up with {provider.name}
                            </button>
                        ))}
                    </div>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Link href="/sign-in" className="font-semibold text-zinc-900 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <HelloStoresLoginModal isOpen={isHelloStoresModalOpen} onClose={() => setIsHelloStoresModalOpen(false)} onSuccess={handleLoginSuccess} />
            <RedefineLoginModal isOpen={isRedefineModalOpen} onClose={() => setIsRedefineModalOpen(false)} onSuccess={handleLoginSuccess} />
        </div>
    );
}
