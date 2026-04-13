import { landingEyebrowText } from "@/components/landing/typography";

function PlatformIcon({ name, className }: { name: string; className?: string }) {
    const common = className ?? "h-4 w-4";

    switch (name) {
        case "Instagram":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#E1306C"
                        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8z"
                    />
                    <path
                        fill="#E1306C"
                        d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z"
                    />
                    <path fill="#E1306C" d="M17.7 6.3a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                </svg>
            );
        case "YouTube":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#FF0000"
                        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"
                    />
                </svg>
            );
        case "TikTok":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#111827"
                        d="M16.7 2c.3 2.7 1.9 4.3 4.6 4.6v3.1c-1.6.1-3-.4-4.5-1.3v6.7c0 4.1-3.4 7.4-7.4 7.4-4.9 0-8.4-4.7-7-9.3 1-3.4 4.3-5.6 7.9-5.2v3.3c-.4-.1-.8-.1-1.2-.1-1.9.1-3.5 1.5-3.8 3.4-.4 2.5 1.6 4.7 4.1 4.7 2.3 0 4-1.9 4-4.2V2h3.3z"
                    />
                </svg>
            );
        case "LinkedIn":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#0A66C2"
                        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"
                    />
                </svg>
            );
        case "Pinterest":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#E60023"
                        d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 .1-2.9l1.3-5.5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.2 1.1.6 2 1.7 2 2 0 3.6-2.1 3.6-5.1 0-2.7-1.9-4.6-4.8-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.6.1.1.1.2.1.4l-.3 1.1c-.1.4-.3.5-.6.3-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.6-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.1l-.6 2.2c-.2.9-.8 2.1-1.2 2.8A10 10 0 1 0 12 2z"
                    />
                </svg>
            );
        case "X":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#111827"
                        d="M18.2 2.25H21.5l-7.2 8.26 8.5 11.24h-6.7l-5.2-6.82-6 6.82H1.6l7.7-8.83L1.2 2.25h6.8l4.7 6.23 5.5-6.23zm-1.1 17.52h1.8L7.1 4.13H5.1l12 15.64z"
                    />
                </svg>
            );
        case "Facebook":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#1877F2"
                        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z"
                    />
                </svg>
            );
        case "Threads":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#111827"
                        d="M12 2c4.8 0 8.7 3.3 9 8.6.2 3.2-.8 5.9-2.8 7.9-1.6 1.6-3.8 2.5-6.2 2.5-4.8 0-8.7-3.3-9-8.6C2.7 6.3 6.1 2 12 2zm.1 3c-3.3 0-5.6 2.1-5.4 5.7.2 3.7 2.8 5.9 5.7 5.9 1.6 0 3-.5 4-1.5.7-.7 1.2-1.6 1.5-2.7-.7-.6-1.7-1-3-1.2.1.3.1.6.1.9 0 2.1-1.4 3.5-3.6 3.5-2.1 0-3.7-1.5-3.8-3.7-.1-2.5 1.6-4.2 4.4-4.2 1.5 0 2.8.3 3.9.9-.6-2.4-2.4-3.6-4.8-3.6zM11.5 11c-1 0-1.7.6-1.7 1.5 0 1 .7 1.7 1.6 1.7 1 0 1.6-.6 1.6-1.6 0-.6-.2-1.1-.6-1.6-.3 0-.6 0-.9 0z"
                    />
                </svg>
            );
        case "Google Business":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#1A73E8" d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5z" />
                    <path fill="#34A853" d="M5 10v8.5c0 .6.3 1.1.8 1.4l6.2 3.1V12L5 10z" />
                    <path fill="#FBBC05" d="M19 10l-7 2v11l6.2-3.1c.5-.3.8-.8.8-1.4V10z" />
                </svg>
            );
        case "Snapchat":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#FFFC00"
                        stroke="#111827"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                        d="M12 2.2c-2.4 0-4.4 2-4.4 4.4v2.6c0 .4-.3.7-.7.8-.7.2-1.2.6-1.2 1.1 0 .5.5.9 1.3 1.2.7.2 1.4.8 1.4 1.6 0 1.1.9 1.9 1.9 1.9.7 0 1.2-.3 1.7-.8.2-.2.5-.2.7 0 .5.5 1 .8 1.7.8 1.1 0 1.9-.9 1.9-1.9 0-.8.7-1.4 1.4-1.6.8-.3 1.3-.7 1.3-1.2 0-.5-.5-.9-1.2-1.1-.4-.1-.7-.4-.7-.8V6.6c0-2.4-2-4.4-4.4-4.4z"
                    />
                </svg>
            );
        case "Google Drive":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#0F9D58" d="M7.7 3.5h8.6l4.3 7.5h-8.6L7.7 3.5z" />
                    <path fill="#4285F4" d="M3.4 19.5 7.7 12h8.6L12 19.5H3.4z" />
                    <path fill="#F4B400" d="M12 19.5 16.3 12l4.3 7.5H12z" />
                </svg>
            );
        case "WhatsApp":
            return (
                <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#25D366"
                        d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2 22l5.3-1.6A9.9 9.9 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.9.9-3-.2-.3A8 8 0 1 1 12 20zm4.6-5.6c-.3-.2-1.7-.8-1.9-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.3-.3-.4.3-.4.8-1.4.1-.2.1-.4 0-.6l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8 0 1.6 1.2 3.2 1.4 3.4.2.2 2.4 3.7 5.9 5.1.8.3 1.4.5 1.9.7.8.2 1.6.2 2.2.1.7-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4 0-.2-.2-.2-.4-.3z"
                    />
                </svg>
            );
        default:
            return null;
    }
}

export function TrustedBy() {
    const platforms = [
        { name: "Instagram", label: "Instagram" },
        { name: "YouTube", label: "YouTube" },
        { name: "TikTok", label: "TikTok" },
        { name: "LinkedIn", label: "LinkedIn" },
        { name: "Pinterest", label: "Pinterest" },
        { name: "X", label: "X (Twitter)" },
        { name: "Facebook", label: "Facebook" },
        { name: "Threads", label: "Threads" },
        { name: "Google Business", label: "Google Business" },
        { name: "Snapchat", label: "Snapchat" },
        { name: "Google Drive", label: "Google Drive" },
        { name: "WhatsApp", label: "WhatsApp" },
    ];

    return (
        <section className="w-full bg-white border-y border-black/10 py-7 px-6 sm:px-8">
            <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
                <p className={`shrink-0 whitespace-nowrap lg:pt-0.5 ${landingEyebrowText}`}>
                    Supports
                </p>
                <div className="grid min-w-0 w-full flex-1 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {platforms.map((platform) => (
                        <div
                            key={platform.label}
                            className="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-md border border-black/10 bg-[#F5F0E8] px-3 py-2 text-center text-[13px] font-semibold text-zinc-500 sm:px-4"
                        >
                            <span className="shrink-0">
                                <PlatformIcon
                                    name={platform.name}
                                    className={
                                        platform.name === "Snapchat"
                                            ? "h-5 w-5 translate-y-[0.5px]"
                                            : "h-4 w-4"
                                    }
                                />
                            </span>
                            <span className="truncate">{platform.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
