import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import {
    syncCrmCalendarForUser,
    syncCrmCalendarForAllOwners,
    civilDayFromUtcDate,
    type CivilDay,
} from '@/lib/sync-crm-calendar-posts';

function parseManualSyncDay(body: unknown): CivilDay {
    const b = body as Record<string, unknown>;
    const y = Number(b.syncYear);
    const m = Number(b.syncMonth);
    const d = Number(b.syncDay);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { year: y, month: m, day: d };
    }
    return civilDayFromUtcDate(new Date());
}

/** Manual trigger: sync CRM birthday + loyalty for the signed-in user. Body may send local calendar: { syncYear, syncMonth, syncDay }. */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await getAuthUser(req);
        const body = await req.json().catch(() => ({}));
        const day = parseManualSyncDay(body);
        const result = await syncCrmCalendarForUser(userId, day);
        return NextResponse.json({
            ok: true,
            ...result,
        });
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

/**
 * Cron / automation: sync all owners. Protect with CRON_SECRET in Authorization: Bearer or x-cron-secret header.
 */
export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const auth = req.headers.get('authorization');
    const headerSecret = req.headers.get('x-cron-secret');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : headerSecret;
    if (!secret || token !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await syncCrmCalendarForAllOwners(civilDayFromUtcDate(new Date()));
    return NextResponse.json({ ok: true, ...result });
}
