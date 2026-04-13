import { landingCardTitle, landingEyebrow, landingSectionTitle } from "@/components/landing/typography";

const testimonials = [
    {
        title: "We were drowning in tools",
        quote:
            "We built Agent Elephant after juggling six different apps just to get one campaign out the door. The goal was simple: one workspace where strategy, content, and publishing actually talk to each other.",
        name: "Nithesh",
        role: "Co-Founder · Agent Elephant",
        initials: "AM",
        avatarClass: "bg-[#F5C842] text-zinc-900",
    },
    {
        title: "Strategy should not be a blank page",
        quote:
            "Most marketers don’t struggle with ideas — they struggle with turning those ideas into a 90‑day calendar. The strategy engine came from years of us building those calendars manually for clients.",
        name: "Priya Rao",
        role: "Product Lead · Agent Elephant",
        initials: "PR",
        avatarClass: "bg-[#0F1B35] text-[#F5C842]",
    },
    {
        title: "AI that sounds like your brand",
        quote:
            "We refused to ship another 'AI that writes like a robot'. Our content models are trained to adapt to your tone, not overwrite it — that’s why we obsess over brand voice controls.",
        name: "James Lee",
        role: "Head of AI · Agent Elephant",
        initials: "JL",
        avatarClass: "bg-[#0F1B35] text-white",
    },
    {
        title: "Scheduling should feel invisible",
        quote:
            "The scheduling UI was designed so that your calendar feels like it’s running on autopilot. If you ever feel like you’re micro‑managing time slots again, we’ve failed.",
        name: "Mia Torres",
        role: "Design Lead · Agent Elephant",
        initials: "MT",
        avatarClass: "bg-[#1A2540] text-[#F5C842]",
    },
    {
        title: "One click, every channel",
        quote:
            "Our team used to spend hours resizing and reformatting the same story for every platform. Multi‑platform publish is our revenge on that entire workflow.",
        name: "Leo Martins",
        role: "Engineering · Agent Elephant",
        initials: "LM",
        avatarClass: "bg-[#1A2540] text-emerald-400",
    },
    {
        title: "Consistency beats viral spikes",
        quote:
            "Agent Elephant is opinionated: we optimize for brands that show up every week, not one lucky viral hit. Every feature is built to make consistency the default.",
        name: "Nora Salem",
        role: "Co-Founder · Agent Elephant",
        initials: "NS",
        avatarClass: "bg-[#F5C842] text-zinc-900",
    },
];

export function TestimonialsSection() {
    return (
        <section id="customers" className="bg-white px-8 py-24">
            <div className="mx-auto max-w-[1160px]">
                <p className={landingEyebrow}>From the founders</p>
                <h2 className={`mb-14 max-w-[700px] ${landingSectionTitle}`}>Why we built Agent Elephant</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((t) => (
                        <article
                            key={t.name}
                            className="flex flex-col rounded-[14px] border border-black/10 bg-[#F5F0E8] p-7 transition-shadow hover:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)]"
                        >
                            <h3 className={landingCardTitle}>{t.title}</h3>
                            <blockquote className="mt-3 mb-5 flex-1 border-l-[3px] border-[#F5C842] pl-3.5 text-[15px] italic leading-relaxed text-zinc-500">
                                &quot;{t.quote}&quot;
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.avatarClass}`}
                                >
                                    AE
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">{t.role}</p>
                                    <p className="text-xs text-zinc-500">Agent Elephant</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
