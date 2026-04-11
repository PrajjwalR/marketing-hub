"use client";

import Link from "next/link";
import { useState } from "react";
import { landingEyebrowOnDark, landingSectionTitleOnDark } from "@/components/landing/typography";

type PricingPlan = "starter" | "business";

const pricing = {
    starter: { label: "Starter", price: "$18", note: "per month" },
    business: { label: "Business", price: "$39", note: "per month" },
} satisfies Record<PricingPlan, { label: string; price: string; note: string }>;

export function PricingSection() {
    const [plan, setPlan] = useState<PricingPlan>("starter");

    return (
        <section id="pricing" className="relative overflow-hidden bg-[#0F1B35] px-8 py-24">
            <div
                className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)",
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(0,0,0,0.0), rgba(15,27,53,0.9)), radial-gradient(ellipse 120% 80% at 50% 60%, rgba(245,200,66,0.08), transparent 60%)",
                }}
            />
            <div className="relative mx-auto max-w-[1160px] text-center">
                <p className={landingEyebrowOnDark}>Pricing</p>
                <h2 className={`mb-10 ${landingSectionTitleOnDark}`}>At a fair price.</h2>

                <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                    {(["starter", "business"] as const).map((p) => {
                        const isActive = plan === p;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPlan(p)}
                                className={`h-8 rounded-full px-5 text-sm font-bold transition ${
                                    isActive
                                        ? "bg-[#F5C842] text-zinc-900"
                                        : "text-white/70 hover:text-white"
                                }`}
                                aria-pressed={isActive}
                            >
                                {pricing[p].label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative mx-auto mt-10 max-w-[860px]">
                    {/* Marketing post mockups behind the glass card */}
                    {/* Top-left X / Twitter thread */}
                    <div className="pointer-events-none absolute -left-32 -top-10 hidden h-40 w-52 -rotate-2 rounded-2xl border border-white/10 bg-linear-to-br from-[#020817]/85 via-[#0EA5E9]/20 to-transparent p-3 opacity-75 backdrop-blur-sm lg:block">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                                𝕏
                            </span>
                            <span>@brand • Thread</span>
                        </div>
                        <div className="mt-3 h-16 rounded-xl bg-white/5" />
                        <div className="mt-3 flex items-center justify-between text-[10px] text-white/60">
                            <span>Launch announcement</span>
                            <span>3.1% engagement</span>
                        </div>
                    </div>
                    {/* Instagram Reel */}
                    <div className="pointer-events-none absolute -left-4 top-4 hidden h-40 w-40 -rotate-3 rounded-2xl border border-white/10 bg-linear-to-br from-[#F97316]/30 via-[#FACC15]/10 to-transparent p-3 opacity-70 backdrop-blur-sm md:block">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-[#E1306C] to-[#F77737] text-xs">
                                IG
                            </span>
                            <span>@yourstore • Reel</span>
                        </div>
                        <div className="mt-3 h-16 rounded-xl bg-white/10" />
                        <div className="mt-3 flex items-center justify-between text-[10px] text-white/60">
                            <span>Summer drop launch</span>
                            <span>+18% saves</span>
                        </div>
                    </div>
                    {/* LinkedIn post */}
                    <div className="pointer-events-none absolute right-0 top-6 hidden h-44 w-44 rotate-3 rounded-2xl border border-white/10 bg-linear-to-br from-[#2563EB]/35 via-[#10B981]/10 to-transparent p-3 opacity-70 backdrop-blur-sm md:block">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-xs">
                                in
                            </span>
                            <span>LinkedIn post</span>
                        </div>
                        <div className="mt-3 h-16 rounded-xl bg-white/10" />
                        <div className="mt-3 flex items-center justify-between text-[10px] text-white/60">
                            <span>B2B case study thread</span>
                            <span>4.2% CTR</span>
                        </div>
                    </div>
                    {/* YouTube Short */}
                    <div className="pointer-events-none absolute left-1/2 top-[76%] hidden h-32 w-52 -translate-x-1/2 -rotate-2 rounded-2xl border border-white/5 bg-linear-to-br from-[#0F172A]/80 via-[#22C55E]/10 to-transparent p-3 opacity-60 backdrop-blur-sm md:block">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF0000] text-xs">
                                ▶
                            </span>
                            <span>YouTube Short</span>
                        </div>
                        <div className="mt-3 h-12 rounded-lg bg-black/40" />
                        <div className="mt-2 flex items-center justify-between text-[10px] text-white/60">
                            <span>90s product walkthrough</span>
                            <span>1.3x watch time</span>
                        </div>
                    </div>

                    {/* Bottom-right Klaviyo email */}
                    <div className="pointer-events-none absolute right-[-52px] top-[72%] hidden h-32 w-48 rotate-3 rounded-2xl border border-white/5 bg-linear-to-br from-[#020617]/90 via-[#22C55E]/15 to-transparent p-3 opacity-65 backdrop-blur-sm lg:block">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/80 text-xs">
                                ✉
                            </span>
                            <span>Campaign recap</span>
                        </div>
                        <div className="mt-3 h-12 rounded-lg bg-white/5" />
                        <div className="mt-2 flex items-center justify-between text-[10px] text-white/60">
                            <span>Flows optimized</span>
                            <span>32% open rate</span>
                        </div>
                    </div>

                    {/* Glass pricing card */}
                    <div className="relative mx-auto max-w-[520px] rounded-[32px] border border-white/15 bg-white/5 px-10 py-12 text-center shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        <div className="text-[clamp(82px,9vw,140px)] font-bold leading-none tracking-[-0.06em] text-white/85">
                            {pricing[plan].price}
                        </div>
                        <div className="mt-3 text-sm font-medium text-white/55">{pricing[plan].note}</div>
                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/35">
                            All core AI marketing features included
                        </p>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/40">
                            <span>Unlimited workspaces</span>
                            <span className="h-1 w-1 rounded-full bg-white/40" />
                            <span>Cancel anytime</span>
                            <span className="h-1 w-1 rounded-full bg-white/40" />
                            <span>No setup fees</span>
                        </div>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex h-11 items-center justify-center rounded-full bg-[#F5C842] px-7 text-sm font-bold text-zinc-900 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:bg-[#E0B428]"
                            >
                                Get started in 2 minutes →
                            </Link>
                            <Link
                                href="/sign-up"
                                className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-7 text-sm font-medium text-white/80 hover:border-white/40 hover:text-white"
                            >
                                Talk to sales
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
