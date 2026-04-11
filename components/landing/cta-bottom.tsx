import Link from "next/link";
import { landingSectionLeadOnDark, landingSectionTitleOnDark } from "@/components/landing/typography";

export function CtaBottom() {
    return (
        <section className="bg-white px-8 py-24">
            <div className="relative mx-auto max-w-[720px] overflow-hidden rounded-3xl bg-zinc-950 px-8 py-16 text-center sm:px-14 sm:py-[72px]">
                <div
                    className="pointer-events-none absolute bottom-[-80px] left-1/2 h-[300px] w-[500px] -translate-x-1/2"
                    style={{
                        background: "radial-gradient(circle, rgba(245,200,66,0.15) 0%, transparent 70%)",
                    }}
                />
                <div className="relative">
                    <h2 className={`mb-4 ${landingSectionTitleOnDark}`}>Ready to create your first AI video?</h2>
                    <p className={`mb-10 ${landingSectionLeadOnDark}`}>
                        Give your team a marketing platform built for action, not just talk. Easy setup, works immediately,
                        and built for teams who grow on content.
                    </p>
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/sign-up"
                            className="inline-flex h-[52px] items-center justify-center rounded-lg bg-[#F5C842] px-8 text-[15px] font-bold text-zinc-900 transition hover:bg-[#E0B428]"
                        >
                            Start a 7-day free trial →
                        </Link>
                        {/* <Link
                            href="/sign-up"
                            className="inline-flex h-[52px] items-center justify-center rounded-lg border-[1.5px] border-white/20 px-7 text-[15px] font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                        >
                            Watch demo
                        </Link> */}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-5 text-[13px] text-white/30">
                        <span>
                            <span className="text-[#F5C842]/80">✓ </span>7-day free trial
                        </span>
                        <span>
                            <span className="text-[#F5C842]/80">✓ </span>No credit card required
                        </span>
                        <span>
                            <span className="text-[#F5C842]/80">✓ </span>Cancel anytime
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
