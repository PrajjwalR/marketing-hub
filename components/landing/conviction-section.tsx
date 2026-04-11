import { landingEyebrow, landingSectionLead, landingSectionTitle } from "@/components/landing/typography";

const badges = [
    { icon: "🔒", label: "SOC 2 compliant" },
    { icon: "🛡️", label: "GDPR ready" },
    { icon: "⚡", label: "Weekly feature updates" },
    { icon: "🌍", label: "24/7 support" },
];

export function ConvictionSection() {
    return (
        <section className="bg-[#F5F0E8] px-8 py-24 text-center">
            <div className="mx-auto max-w-[780px]">
                <p className={landingEyebrow}>More than a product, a conviction</p>
                <h2 className={`mb-5 ${landingSectionTitle}`}>
                    E-commerce brands deserve smarter marketing — without the agency price tag.
                </h2>
                <p className={`mb-10 ${landingSectionLead}`}>
                    Growing brands rely on content to drive traffic and stay close to their customers. Most marketing tools
                    forget them — built for enterprise, priced for enterprise, unusable for everyone else. Agent Elephant
                    changes that.
                </p>
                <div className="mb-10 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[14px] border border-black/10 bg-white px-7 py-7">
                        <p className="text-[42px] font-bold leading-none tracking-[-0.04em] text-zinc-900">10+</p>
                        <p className="mt-1.5 text-sm text-zinc-500">Post everywhere from one place</p>
                    </div>
                    <div className="rounded-[14px] border border-black/10 bg-white px-7 py-7">
                        <p className="text-[42px] font-bold leading-none tracking-[-0.04em] text-zinc-900">30-day Calendar</p>
                        <p className="mt-1.5 text-sm text-zinc-500">Full strategy generated in minutes</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-5">
                    {badges.map((b) => (
                        <div
                            key={b.label}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-semibold text-zinc-900"
                        >
                            <span>{b.icon}</span>
                            {b.label}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
