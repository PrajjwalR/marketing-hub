/**
 * Helpers for scheduling strategy posts onto the posting calendar (calendar_events).
 */

export function strategyPostHasMedia(post: { media_url?: string | null }): boolean {
    const u = post.media_url;
    return typeof u === 'string' && u.trim().length > 0;
}

function parsePostTimeParts(s: string): { h: number; m: number } {
    const t = (s || '').trim();
    const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
    if (m12) {
        let h = parseInt(m12[1], 10);
        const min = parseInt(m12[2], 10);
        const ap = m12[3].toUpperCase();
        if (ap === 'PM' && h !== 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        return { h, m: min };
    }
    const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) return { h: parseInt(m24[1], 10), m: parseInt(m24[2], 10) };
    return { h: 10, m: 0 };
}

/** Local date for strategy day + post_time → ISO string for calendar_events.scheduled_at */
export function buildStrategyPostScheduledAt(
    startDate: string | null | undefined,
    day: number,
    postTime: string | null | undefined
): string {
    const raw = (startDate || new Date().toISOString().slice(0, 10)).split('T')[0];
    const parts = raw.split('-').map((x) => parseInt(x, 10));
    const y = parts[0];
    const month = parts[1];
    const d = parts[2];
    const date = new Date(y, month - 1, d + (day - 1));
    const { h, m } = parsePostTimeParts(postTime || '10:00 AM');
    date.setHours(h, m, 0, 0);
    return date.toISOString();
}

export function normalizeCalendarPlatform(platform: string): string {
    const p = (platform || '').toLowerCase();
    if (p.includes('instagram')) return 'instagram';
    if (p.includes('linkedin')) return 'linkedin';
    if (p.includes('facebook')) return 'facebook';
    if (p.includes('youtube')) return 'youtube';
    if (p.includes('tiktok')) return 'tiktok';
    return 'instagram';
}
