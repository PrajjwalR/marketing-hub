'use client';

export type SocialMixPlatform = 'instagram' | 'youtube' | 'linkedin' | 'x' | 'facebook';

/** Colored brand marks (aligned with landing Supports / trusted-by). */
export function SocialPlatformMixIcon({
    platform,
    className,
}: {
    platform: SocialMixPlatform;
    className?: string;
}) {
    const c = className ?? 'h-6 w-6';

    switch (platform) {
        case 'instagram':
            return (
                <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
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
        case 'youtube':
            return (
                <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#FF0000"
                        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"
                    />
                </svg>
            );
        case 'linkedin':
            return (
                <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#0A66C2"
                        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"
                    />
                </svg>
            );
        case 'x':
            return (
                <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#111827"
                        d="M18.2 2.25H21.5l-7.2 8.26 8.5 11.24h-6.7l-5.2-6.82-6 6.82H1.6l7.7-8.83L1.2 2.25h6.8l4.7 6.23 5.5-6.23zm-1.1 17.52h1.8L7.1 4.13H5.1l12 15.64z"
                    />
                </svg>
            );
        case 'facebook':
            return (
                <svg className={c} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#1877F2"
                        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.43H7.08v-3.5h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.5 0-1.97.94-1.97 1.9v2.28h3.35l-.54 3.5h-2.81V24C19.61 23.1 24 18.1 24 12.07z"
                    />
                </svg>
            );
        default:
            return null;
    }
}
