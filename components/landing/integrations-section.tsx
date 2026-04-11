import Link from "next/link";
import { landingEyebrow, landingSectionLead, landingSectionTitle } from "@/components/landing/typography";

const integrations = [
    { name: "Shopify" },
    { name: "Klaviyo" },
    { name: "Google Analytics" },
    { name: "Meta Ads" },
    { name: "TikTok Business" },
    { name: "YouTube Studio" },
    { name: "Zapier" },
    { name: "Pinterest" },
    { name: "LinkedIn Pages" },
    { name: "Webhooks" },
    { name: "WooCommerce" },
    { name: "Make / Integromat" },
];

function IntegrationLogo({ name }: { name: string }) {
    const cls = "h-8 w-8";
    switch (name) {
        case "Shopify":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#95BF47" d="M4 6.5 9 5l1-1.8 3.8-.2L20 5.4v13.9L9 22 4 20V6.5z" />
                    <path fill="#5E8E3E" d="M9 5v17l11-2.7V5.4L9 5z" />
                    <path fill="#fff" d="M13.9 9.1c-.9-.5-1.5-.5-1.8-.5-.7 0-1.1.4-1.1.8 0 .5.4.8 1.1 1.2.9.5 2 1.1 2 2.7 0 1.7-1.1 2.9-3.2 2.9-.9 0-1.8-.3-2.2-.6l.4-1.4c.4.2 1.2.5 1.9.5.8 0 1.2-.4 1.2-.9 0-.5-.4-.8-1-1.2-.9-.5-2-1.2-2-2.6 0-1.6 1.2-2.8 3.2-2.8.8 0 1.4.2 1.8.4l-.3 1.5z" />
                </svg>
            );
        case "Klaviyo":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#111827" d="M4 4h4v16H4zM10 4h4v6l6-6h4l-7.5 7.3L24 20h-4l-6-7v7h-4z" />
                </svg>
            );
        case "Google Analytics":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="13" width="4" height="8" rx="2" fill="#F9AB00" />
                    <rect x="10" y="9" width="4" height="12" rx="2" fill="#F29900" />
                    <rect x="17" y="4" width="4" height="17" rx="2" fill="#E37400" />
                </svg>
            );
        case "Meta Ads":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#1877F2" d="M5.5 16.8c0-3.8 2.2-9.6 4.5-9.6 1.4 0 2.6 2.1 4 5.1 1.1-1.8 2.3-2.8 3.6-2.8 1.9 0 2.9 1.7 2.9 4.2 0 2.3-.9 4.1-2.9 4.1-1.4 0-2.4-.9-3.6-2.8-1.4 3-2.5 5-4 5-2.3 0-4.5-5.8-4.5-9.2z" />
                </svg>
            );
        case "TikTok Business":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#111827" d="M16.7 2c.3 2.7 1.9 4.3 4.6 4.6v3.1c-1.6.1-3-.4-4.5-1.3v6.7c0 4.1-3.4 7.4-7.4 7.4-4.9 0-8.4-4.7-7-9.3 1-3.4 4.3-5.6 7.9-5.2v3.3c-.4-.1-.8-.1-1.2-.1-1.9.1-3.5 1.5-3.8 3.4-.4 2.5 1.6 4.7 4.1 4.7 2.3 0 4-1.9 4-4.2V2h3.3z" />
                </svg>
            );
        case "YouTube Studio":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#FF0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
                </svg>
            );
        case "Zapier":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#FF4A00" d="M10.9 2h2.2v20h-2.2zM2 10.9h20v2.2H2zM4.9 4.9l1.6-1.6 12.6 12.6-1.6 1.6zM17.5 3.3l1.6 1.6L6.5 17.5l-1.6-1.6z" />
                </svg>
            );
        case "Pinterest":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#E60023" d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 .1-2.9l1.3-5.5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.2 1.1.6 2 1.7 2 2 0 3.6-2.1 3.6-5.1 0-2.7-1.9-4.6-4.8-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.6.1.1.1.2.1.4l-.3 1.1c-.1.4-.3.5-.6.3-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.6-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.1l-.6 2.2c-.2.9-.8 2.1-1.2 2.8A10 10 0 1 0 12 2z" />
                </svg>
            );
        case "LinkedIn Pages":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
                </svg>
            );
        case "Webhooks":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#6366F1" d="M12 3a5 5 0 0 1 4.6 3h2.1a7 7 0 1 0 1.2 5.5h-2.1A5 5 0 1 1 12 3z" />
                    <path fill="#6366F1" d="M12 7a5 5 0 0 1 0 10v2a7 7 0 1 0 0-14v2z" />
                    <circle cx="12" cy="12" r="2.2" fill="#6366F1" />
                </svg>
            );
        case "WooCommerce":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#7F54B3" d="M2 7.5A2.5 2.5 0 0 1 4.5 5h15A2.5 2.5 0 0 1 22 7.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5z" />
                    <path fill="#fff" d="M5.4 15.5V8.8h2.1l1.5 4.6 1.5-4.6h2.1v6.7h-1.5v-4.8l-1.6 4.8h-1l-1.6-4.8v4.8H5.4zm9.1 0V8.8h2.1l1.5 4.6 1.5-4.6h2.1v6.7h-1.5v-4.8l-1.6 4.8h-1l-1.6-4.8v4.8h-1.5z" />
                </svg>
            );
        case "Make / Integromat":
            return (
                <svg className={cls} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="5" cy="12" r="3" fill="#FF6B6B" />
                    <rect x="8.5" y="9" width="7" height="6" rx="3" fill="#6C5CE7" />
                    <rect x="15" y="8" width="5" height="8" rx="2.5" fill="#00B894" />
                </svg>
            );
        default:
            return null;
    }
}

export function IntegrationsSection() {
    return (
        <section className="bg-[#F5F0E8] px-8 py-24">
            <div className="mx-auto max-w-[1160px] text-center">
                <p className={landingEyebrow}>Integrations</p>
                <h2 className={`mx-auto mb-4 max-w-[700px] ${landingSectionTitle}`}>Works with your tools</h2>
                <p className={`mx-auto mb-10 max-w-[560px] ${landingSectionLead}`}>
                    Better marketing, without the chaos.
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                    {integrations.map((item) => (
                        <div
                            key={item.name}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                            aria-label={item.name}
                            title={item.name}
                        >
                            <IntegrationLogo name={item.name} />
                        </div>
                    ))}
                </div>
                {/* <div className="mt-8">
                    <Link
                        href="/"
                        className="inline-block border-b-[1.5px] border-zinc-900 pb-0.5 text-sm font-semibold text-zinc-900 hover:opacity-70"
                    >
                        See all integrations →
                    </Link>
                </div> */}
            </div>
        </section>
    );
}
