import { landingCardTitle, landingEyebrow, landingSectionLead, landingSectionTitle } from "@/components/landing/typography";

const steps = [
    {
        number: "01",
        title: "Describe your content",
        description:
            "Type a prompt or paste a script. Pick a style, duration, and target platform. The AI handles the creative lifting — visuals, voiceover, music, captions — all of it.",
        pill: "⚡ Avg. creation time: 52 sec",
    },
    {
        number: "02",
        title: "Review & customize",
        description:
            "Preview the generated content, tweak captions, swap music, or adjust the voiceover. Full creative control — none of the manual grind.",
        pill: "🎨 100% editable output",
    },
    {
        number: "03",
        title: "Schedule & publish everywhere",
        description:
            "Drop it on your calendar or publish instantly. Agent Elephant posts to every platform simultaneously, natively formatted for each one.",
        pill: "🌍 All platforms, one click",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative bg-white pt-16 pb-24 sm:pt-24">
            <div className="mx-auto max-w-[1160px] px-6 lg:px-8">
                <div className="mb-14 max-w-2xl">
                    <p className={landingEyebrow}>How it works</p>
                    <h2 className={landingSectionTitle}>Three steps. Zero complexity.</h2>
                    <p className={`mt-4 ${landingSectionLead}`}>
                        From idea to live post in minutes, not hours.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
                    {steps.map((step, i) => (
                        <div key={step.number} className={`relative animate-fade-up stagger-${i + 1}`}>
                            <p className="select-none text-6xl font-bold leading-none text-zinc-200 sm:text-7xl">
                                {step.number}
                            </p>
                            <h3 className={`mt-4 ${landingCardTitle}`}>{step.title}</h3>
                            <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{step.description}</p>
                            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#F5F0E8] px-3.5 py-1.5 text-xs font-semibold text-zinc-900">
                                {step.pill}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
