import {
    landingCardKicker,
    landingCardTitle,
    landingEyebrow,
    landingSectionLead,
    landingSectionTitle,
} from "@/components/landing/typography";

function CalCell({
    children,
    variant = "default",
}: {
    children: string;
    variant?: "default" | "post" | "postBlue" | "today";
}) {
    const base =
        "flex aspect-square items-center justify-center rounded-[5px] text-[10px] font-medium";
    if (variant === "post") return <div className={`${base} bg-[#F5C842] font-bold text-zinc-900`}>{children}</div>;
    if (variant === "postBlue")
        return <div className={`${base} bg-[#0F1B35] font-bold text-white`}>{children}</div>;
    if (variant === "today") return <div className={`${base} bg-zinc-950 font-bold text-white`}>{children}</div>;
    return <div className={`${base} bg-black/6 text-zinc-500`}>{children}</div>;
}

/** April calendar rows matching reference HTML */
const calendarRows: { label: string; variant: "default" | "post" | "postBlue" | "today" }[][] = [
    [
        { label: "M", variant: "default" },
        { label: "T", variant: "default" },
        { label: "W", variant: "default" },
        { label: "T", variant: "default" },
        { label: "F", variant: "default" },
        { label: "S", variant: "default" },
        { label: "S", variant: "default" },
    ],
    [
        { label: "1", variant: "default" },
        { label: "2", variant: "post" },
        { label: "3", variant: "default" },
        { label: "4", variant: "postBlue" },
        { label: "5", variant: "default" },
        { label: "6", variant: "post" },
        { label: "7", variant: "default" },
    ],
    [
        { label: "8", variant: "postBlue" },
        { label: "9", variant: "default" },
        { label: "10", variant: "post" },
        { label: "11", variant: "today" },
        { label: "12", variant: "post" },
        { label: "13", variant: "default" },
        { label: "14", variant: "postBlue" },
    ],
    [
        { label: "15", variant: "default" },
        { label: "16", variant: "post" },
        { label: "17", variant: "default" },
        { label: "18", variant: "default" },
        { label: "19", variant: "post" },
        { label: "20", variant: "postBlue" },
        { label: "21", variant: "default" },
    ],
];

function PlatformPillIcon({ name }: { name: string }) {
    const cls = "h-3.5 w-3.5";
    switch (name) {
        case "Instagram":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#E1306C" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8z" />
                    <path fill="#E1306C" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z" />
                    <path fill="#E1306C" d="M17.7 6.3a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                </svg>
            );
        case "TikTok":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#111827" d="M16.7 2c.3 2.7 1.9 4.3 4.6 4.6v3.1c-1.6.1-3-.4-4.5-1.3v6.7c0 4.1-3.4 7.4-7.4 7.4-4.9 0-8.4-4.7-7-9.3 1-3.4 4.3-5.6 7.9-5.2v3.3c-.4-.1-.8-.1-1.2-.1-1.9.1-3.5 1.5-3.8 3.4-.4 2.5 1.6 4.7 4.1 4.7 2.3 0 4-1.9 4-4.2V2h3.3z" />
                </svg>
            );
        case "YouTube":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#FF0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
                </svg>
            );
        case "LinkedIn":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
                </svg>
            );
        case "Pinterest":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#E60023" d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 .1-2.9l1.3-5.5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.2 1.1.6 2 1.7 2 2 0 3.6-2.1 3.6-5.1 0-2.7-1.9-4.6-4.8-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.6.1.1.1.2.1.4l-.3 1.1c-.1.4-.3.5-.6.3-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.6-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.1l-.6 2.2c-.2.9-.8 2.1-1.2 2.8A10 10 0 1 0 12 2z" />
                </svg>
            );
        default:
            return null;
    }
}

export function BentoFeatures() {
    return (
        <section id="capabilities" className="bg-[#F5F0E8] px-8 py-24">
            <div className="mx-auto max-w-[1160px]">
                <p className={landingEyebrow}>Built for your workflow</p>
                <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <h2 className={`max-w-[700px] ${landingSectionTitle}`}>
                        Every marketer is more productive with Agent Elephant
                    </h2>
                    <p className={`max-w-[560px] md:text-right ${landingSectionLead}`}>
                        From creating strategy to generating content to publishing, Agent Elephant handles the entire
                        pipeline so your team can focus on growing your audience.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* A — Strategy + chart */}
                    <div className="flex flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)] lg:col-span-7">
                        <div className="flex flex-1 flex-col p-7 pb-5">
                            <p className={landingCardKicker}>
                                Strategy
                            </p>
                            <h3 className={`mb-2.5 ${landingCardTitle}`}>
                                Build smarter marketing plans with AI-powered insights
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Define goals, audiences, and content themes in one place. Agent Elephant surfaces gaps and
                                opportunities based on your category and real competitor data.
                            </p>
                            {/* <Link
                                href="/#features"
                                className="mt-3.5 inline-flex w-fit items-center gap-1 border-b-[1.5px] border-zinc-900 pb-px text-sm font-semibold text-zinc-900 hover:opacity-60"
                            >
                                See more →
                            </Link> */}
                        </div>
                        <div className="mt-auto border-t border-black/10 bg-[#0F1B35] p-5">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-[#FF5F56]" />
                                        <span className="inline-flex h-2 w-2 rounded-full bg-[#FFBD2E]" />
                                        <span className="inline-flex h-2 w-2 rounded-full bg-[#27C93F]" />
                                        <span className="ml-2 text-xs font-bold tracking-wide text-white/70">
                                            AI Insights
                                        </span>
                                    </div>
                                    <span className="rounded-full bg-[#F5C842]/15 px-2 py-0.5 text-[11px] font-semibold text-[#F5C842]">
                                        Live
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
                                    {/* Mini chart */}
                                    <div className="rounded-lg bg-white/5 p-3">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-[11px] font-semibold text-white/60">
                                                Engagement (last 7 days)
                                            </span>
                                            <span className="text-[11px] font-semibold text-white/80">+34%</span>
                                        </div>
                                        <svg viewBox="0 0 320 84" className="h-[84px] w-full" aria-hidden="true">
                                            <defs>
                                                <linearGradient id="aeLine" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0" stopColor="#F5C842" stopOpacity="0.9" />
                                                    <stop offset="1" stopColor="#F5C842" stopOpacity="0.35" />
                                                </linearGradient>
                                                <linearGradient id="aeFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0" stopColor="#F5C842" stopOpacity="0.18" />
                                                    <stop offset="1" stopColor="#F5C842" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            {/* grid */}
                                            <path
                                                d="M0 12H320 M0 36H320 M0 60H320"
                                                stroke="rgba(255,255,255,0.08)"
                                                strokeWidth="1"
                                            />
                                            {/* area */}
                                            <path
                                                d="M0 66 L28 58 L56 60 L84 46 L112 52 L140 38 L168 42 L196 30 L224 36 L252 24 L280 28 L308 18 L320 22 L320 84 L0 84 Z"
                                                fill="url(#aeFill)"
                                            />
                                            {/* line */}
                                            <path
                                                d="M0 66 L28 58 L56 60 L84 46 L112 52 L140 38 L168 42 L196 30 L224 36 L252 24 L280 28 L308 18 L320 22"
                                                fill="none"
                                                stroke="url(#aeLine)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            {/* highlight dot */}
                                            <circle cx="308" cy="18" r="4" fill="#F5C842" />
                                            <circle cx="308" cy="18" r="8" fill="#F5C842" opacity="0.15" />
                                        </svg>
                                        <div className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
                                            <span className="inline-flex h-2 w-2 rounded-full bg-[#F5C842]" />
                                            Predictive trendline
                                        </div>
                                    </div>

                                    {/* KPI chips */}
                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                                                Best time
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-white">9:00 AM</p>
                                            <p className="mt-0.5 text-[11px] text-white/45">Tue · Thu</p>
                                        </div>
                                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                                                Top format
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-white">Reels</p>
                                            <p className="mt-0.5 text-[11px] text-white/45">+18% saves</p>
                                        </div>
                                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                                                Suggestions
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-white">12 ideas</p>
                                            <p className="mt-0.5 text-[11px] text-white/45">ready to schedule</p>
                                        </div>
                                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                                                Confidence
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-[#F5C842]">High</p>
                                            <p className="mt-0.5 text-[11px] text-white/45">based on last 30d</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* B — Scheduling + calendar */}
                    <div className="flex flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)] lg:col-span-5">
                        <div className="flex flex-1 flex-col p-7 pb-5">
                            <p className={landingCardKicker}>
                                Smart Scheduling
                            </p>
                            <h3 className={`mb-2.5 ${landingCardTitle}`}>
                                Plan weeks of content in one sitting
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Drag, drop, reorder. Pick the best posting times or let the algorithm decide for you.
                            </p>
                            {/* <Link
                                href="/#features"
                                className="mt-3.5 inline-flex w-fit items-center gap-1 border-b-[1.5px] border-zinc-900 pb-px text-sm font-semibold text-zinc-900 hover:opacity-60"
                            >
                                See more →
                            </Link> */}
                        </div>
                        <div className="border-t border-black/10 bg-[#EDE7D9] p-4">
                            <p className={landingCardKicker}>
                                April 2026
                            </p>
                            <div className="grid grid-cols-7 gap-1.5">
                                {calendarRows.map((row, ri) =>
                                    row.map((cell, ci) => (
                                        <CalCell key={`${ri}-${ci}`} variant={cell.variant}>
                                            {cell.label}
                                        </CalCell>
                                    )),
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-black/10 bg-[#EDE7D9] px-[18px] py-4">
                            {[
                                { name: "Instagram", label: "Instagram" },
                                { name: "TikTok", label: "TikTok" },
                                { name: "YouTube", label: "YouTube" },
                            ].map((p) => (
                                <span
                                    key={p.name}
                                    className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-500"
                                >
                                    <PlatformPillIcon name={p.name} />
                                    {p.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* C — Multi-platform */}
                    <div className="flex flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)] lg:col-span-5">
                        <div className="flex flex-1 flex-col p-7">
                            <p className={landingCardKicker}>
                                Multi-Platform Publish
                            </p>
                            <h3 className={`mb-2.5 ${landingCardTitle}`}>
                                One click, every platform
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Publish natively to YouTube Shorts, Instagram Reels, and TikTok without leaving your
                                dashboard.
                            </p>
                            {/* <Link
                                href="/#features"
                                className="mt-3.5 inline-flex w-fit items-center gap-1 border-b-[1.5px] border-zinc-900 pb-px text-sm font-semibold text-zinc-900 hover:opacity-60"
                            >
                                See more →
                            </Link> */}
                        </div>
                        <div className="mt-auto flex flex-wrap gap-2 border-t border-black/10 bg-[#EDE7D9] px-[18px] py-4">
                            {[
                                { name: "Instagram", label: "Instagram" },
                                { name: "TikTok", label: "TikTok" },
                                { name: "YouTube", label: "YouTube" },
                                { name: "LinkedIn", label: "LinkedIn" },
                                { name: "Pinterest", label: "Pinterest" },
                            ].map((p) => (
                                <span
                                    key={p.name}
                                    className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-500"
                                >
                                    <PlatformPillIcon name={p.name} />
                                    {p.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* D — AI Create */}
                    <div className="flex flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)] lg:col-span-7">
                        <div className="flex flex-1 flex-col p-7 pb-5">
                            <p className={landingCardKicker}>
                                Create content with AI
                            </p>
                            <h3 className={`mb-2.5 ${landingCardTitle}`}>
                                The AI assistant that works for your brand
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Describe what you want. Our AI creates visuals, picks music, writes captions, and
                                generates voiceovers — all in under a minute.
                            </p>
                            {/* <Link
                                href="/#features"
                                className="mt-3.5 inline-flex w-fit items-center gap-1 border-b-[1.5px] border-zinc-900 pb-px text-sm font-semibold text-zinc-900 hover:opacity-60"
                            >
                                See more →
                            </Link> */}
                        </div>
                        <div className="mt-auto min-h-[120px] border-t border-black/10 bg-[#0F1B35] p-5">
                            <div className="rounded-[10px] bg-[#0F1B35] p-3.5">
                                <p className="mb-2 text-xs italic text-white/45">
                                    &quot;Create a 30-sec Reel for our summer sale, upbeat tone, show the product...&quot;
                                </p>
                                <p className="text-[13px] leading-relaxed text-white/85">
                                    ✅ Script written · 🎵 Music selected · 🎨 Visuals generated · 🎙️ Voiceover ready
                                </p>
                                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#F5C842]">
                                    <span className="flex gap-1">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5C842]" />
                                        <span
                                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5C842]"
                                            style={{ animationDelay: "0.2s" }}
                                        />
                                        <span
                                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5C842]"
                                            style={{ animationDelay: "0.4s" }}
                                        />
                                    </span>
                                    Publishing to 4 platforms...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
