"use client"
import { CreditCard, Zap, ShieldCheck, Clock, Loader2, Check } from "lucide-react";
import { PageHero } from "@/components/dashboard/page-hero";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
    const { currentPlan, planName, limits, isLoaded } = usePlanLimits();
    const [seriesCount, setSeriesCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const response = await fetch('/api/series');
                if (response.ok) {
                    const data = await response.json();
                    setSeriesCount(data.length);
                }
            } catch (error) {
                console.error("Error fetching usage:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoaded) {
            fetchUsage();
        }
    }, [isLoaded]);

    const usagePercent = limits.maxSeries === Infinity
        ? 100
        : Math.min((seriesCount / limits.maxSeries) * 100, 100);

    const nextBilling = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="mx-auto max-w-6xl space-y-10 pb-12">
            <PageHero
                title="Billing & Subscription"
                breadcrumb={['Billing']}
                icon={CreditCard}
                description="Manage your plan, subscription and billing history. Upgrade to unlock more generations and premium features."
                overlap={
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.2fr_1fr] md:items-center">
                        {/* Mcoins-balance style plan summary */}
                        <div className="flex items-center gap-4">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff7dc_0%,#f9c02a_45%,#c98009_100%)] shadow-[inset_0_-4px_0_rgba(109,60,18,0.35),inset_0_3px_0_rgba(255,255,255,0.6),0_14px_30px_-12px_rgba(160,92,12,0.6)]">
                                <Zap className="h-7 w-7 fill-brand-900 text-brand-900" />
                            </span>
                            <div>
                                <p className="ae-section-label">Current plan</p>
                                <p className="font-display text-3xl font-semibold text-zinc-900">
                                    {planName}
                                    <span className="ml-2 font-sans text-base font-bold text-zinc-400">${limits.price}/mo</span>
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-gold-50 p-4 ring-1 ring-gold-200">
                            <div className="h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-gold-200">
                                {isLoading ? (
                                    <div className="h-full w-full animate-pulse bg-gold-100" />
                                ) : (
                                    <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-1000" style={{ width: `${usagePercent}%` }} />
                                )}
                            </div>
                            <p className="mt-2 text-xs font-semibold text-gold-900">
                                {isLoading ? 'Fetching usage...' : `${seriesCount} of ${limits.maxSeries === Infinity ? '∞' : limits.maxSeries} monthly series used`}
                            </p>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="ae-tile ae-contour flex items-start gap-4 p-5">
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div className="relative">
                        <p className="ae-section-label">Security</p>
                        <p className="mt-0.5 text-lg font-extrabold text-zinc-900">Verified payments</p>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-500">All transactions are securely processed via Stripe through Clerk Billing infrastructure.</p>
                    </div>
                </div>
                <div className="ae-tile ae-contour flex items-start gap-4 p-5">
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <Clock className="h-5 w-5" />
                    </span>
                    <div className="relative">
                        <p className="ae-section-label">Next billing cycle</p>
                        <p className="mt-0.5 text-lg font-extrabold text-zinc-900">{nextBilling}</p>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-500">Your monthly generation quota resets on the {new Date().getDate()}th of every month.</p>
                    </div>
                </div>
            </div>

            <section>
                <div className="ae-divider-label mb-6">
                    <span className="text-[10px] text-zinc-400">◆</span>
                    Power up your content
                    <span className="text-[10px] text-zinc-400">◆</span>
                </div>
                {/* Glass dome feature card, like the Moneyview rewards screens */}
                <div className="ae-hero relative overflow-hidden rounded-[28px] px-6 pb-10 pt-10 text-center sm:px-10">
                    <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Choose the perfect plan</h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm text-white/70 sm:text-base">
                        All plans include automated scheduling and high-quality AI generations.
                    </p>
                    <div className="relative mx-auto mt-8 max-w-md">
                        <div className="absolute -inset-x-8 -top-6 bottom-6 rounded-t-[999px] border border-white/15 bg-white/[0.04]" />
                        <div className="relative rounded-2xl bg-gold-100 p-6 text-left shadow-2xl">
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-800 px-3 py-1 text-[11px] font-bold text-gold-200">
                                <Check className="h-3 w-3" /> Active
                            </span>
                            <h3 className="mt-3 text-xl font-extrabold text-brand-950">All features enabled</h3>
                            <p className="mt-1 text-sm text-zinc-700">
                                You have access to unlimited series, video generations and all social platform integrations.
                            </p>
                        </div>
                        <div className="relative mx-auto mt-0 h-3 w-[110%] -translate-x-[4.5%] rounded-full bg-gradient-to-r from-brand-400 via-brand-200 to-brand-400 opacity-80" />
                    </div>
                </div>
            </section>

            <section>
                <p className="ae-section-label mb-3">Questions</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="ae-tile p-5">
                        <h3 className="font-extrabold text-zinc-900">Can I cancel anytime?</h3>
                        <p className="mt-1.5 text-sm text-zinc-500">Yes, you can cancel your subscription at any time through this billing portal. You will continue to have access until the end of your billing period.</p>
                    </div>
                    <div className="ae-tile p-5">
                        <h3 className="font-extrabold text-zinc-900">Need help with your plan?</h3>
                        <p className="mt-1.5 text-sm text-zinc-500">Our support team is always ready to help you choose the right plan for your business needs. Contact us at support@agentelephant.ai</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
