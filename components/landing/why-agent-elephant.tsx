import {
    landingComparisonRowTitle,
    landingComparisonRowTitleOnDark,
    landingEyebrow,
    landingSectionTitle,
} from "@/components/landing/typography";

const legacyRows = [
    {
        icon: "✂️",
        title: "Scattered across multiple apps",
        body: "Canva for design, Notion for strategy, Buffer for scheduling — constant context switching kills your momentum and wastes hours every week.",
    },
    {
        icon: "⏳",
        title: "Hours on content creation",
        body: "Writing captions, sourcing visuals, editing videos, recording voiceovers — all manual, all slow, all pulling you away from strategy.",
    },
    {
        icon: "📉",
        title: "Guesswork on timing",
        body: "No data on when your audience is most active. You post and hope for the best.",
    },
    {
        icon: "🔁",
        title: "Manual publishing per platform",
        body: "Resize for Instagram. Reformat for TikTok. Upload separately to each. Every. Single. Time.",
    },
];

const aeRows = [
    {
        icon: "⚡",
        title: "One unified workspace",
        body: "Strategy, creation, scheduling, and analytics all live in one platform. Zero context switching, total clarity.",
    },
    {
        icon: "🤖",
        title: "AI creates content all of your content",
        body: "Describe what you want. Visuals, captions, music, and voiceovers are generated instantly — ready to publish.",
    },
    {
        icon: "🎯",
        title: "Algorithm-optimized scheduling",
        body: "Let AI pick the best posting times based on your audience data and real platform signals.",
    },
    {
        icon: "🚀",
        title: "One click. Every platform.",
        body: "Publish natively to Instagram Reels, TikTok, and YouTube Shorts simultaneously from a single click.",
    },
];

export function WhyAgentElephant() {
    return (
        <section id="features" className="bg-[#F5F0E8] px-8 py-24">
            <div className="mx-auto max-w-[1160px]">
                <p className={landingEyebrow}>Why Agent Elephant</p>
                <h2 className={`mb-12 max-w-[740px] ${landingSectionTitle}`}>
                    Your current content workflow is a{" "}
                    <span className="relative inline-block text-zinc-500">
                        liability
                        <span
                            className="pointer-events-none absolute left-0 right-0 top-[54%] h-[3px] rounded-sm bg-[#FF5C5C]"
                            aria-hidden
                        />
                    </span>{" "}
                    an unfair advantage
                </h2>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Legacy */}
                    <div className="overflow-hidden rounded-[14px]">
                        <div className="bg-[#EDEBE5] px-6 py-4 text-sm font-bold text-zinc-500">
                            Your current marketing tools
                        </div>
                        <div className="flex flex-col">
                            {legacyRows.map((row) => (
                                <div
                                    key={row.title}
                                    className="flex gap-4 border-b border-[#EDE7D9] bg-[#F7F5EF] px-6 py-5 last:border-b-0"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8E4DC] text-xl">
                                        {row.icon}
                                    </div>
                                    <div>
                                        <h4 className={landingComparisonRowTitle}>{row.title}</h4>
                                        <p className="mt-1 text-[13px] leading-relaxed font-normal text-[#9E9A90]">
                                            {row.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agent Elephant */}
                    <div className="overflow-hidden rounded-[14px]">
                        <div className="bg-zinc-950 px-6 py-4 text-sm font-bold text-white">
                            <span className="inline-block rounded-[5px] bg-[#F5C842] px-2.5 py-1 text-[13px] font-extrabold text-zinc-950">
                                🐘 Agent Elephant
                            </span>
                        </div>
                        <div className="flex flex-col">
                            {aeRows.map((row) => (
                                <div
                                    key={row.title}
                                    className="flex gap-4 border-b border-white/5 bg-[#121B30] px-6 py-5 last:border-b-0"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5C842]/12 text-xl">
                                        {row.icon}
                                    </div>
                                    <div>
                                        <h4 className={landingComparisonRowTitleOnDark}>{row.title}</h4>
                                        <p className="mt-1 text-[13px] leading-relaxed font-normal text-white/40">
                                            {row.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
