import { supabaseAdmin } from '@/lib/supabase';
import { MONTHLY_LOYALTY_TEMPLATES, birthdayPostingCopy } from '@/lib/crm-calendar-templates';

export type SyncCrmCalendarResult = {
    usersProcessed: number;
    birthdayPostsCreated: number;
    loyaltyPostsCreated: number;
    skipped: number;
    errors: string[];
};

/** Calendar date (no timezone): used for birthday month/day + loyalty day-of-month + event date. */
export type CivilDay = { year: number; month: number; day: number };

export function civilDayFromUtcDate(d: Date): CivilDay {
    return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
    };
}

export function formatCivilDay(c: CivilDay): string {
    return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`;
}

function matchesBirthdayMonthDay(birthdayIso: string, month: number, day: number): boolean {
    const part = String(birthdayIso).split('T')[0];
    const segs = part.split('-');
    if (segs.length < 3) return false;
    const bm = Number(segs[1]);
    const bd = Number(segs[2]);
    return bm === month && bd === day;
}

function scheduledAtUtcNoon(c: CivilDay): string {
    return new Date(Date.UTC(c.year, c.month - 1, c.day, 12, 0, 0, 0)).toISOString();
}

async function hasBirthdayPostForDay(userId: string, contactId: string, c: CivilDay): Promise<boolean> {
    const start = new Date(Date.UTC(c.year, c.month - 1, c.day, 0, 0, 0, 0)).toISOString();
    const end = new Date(Date.UTC(c.year, c.month - 1, c.day, 23, 59, 59, 999)).toISOString();
    const { data, error } = await supabaseAdmin
        .from('calendar_events')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'crm_birthday')
        .eq('crm_contact_id', contactId)
        .gte('scheduled_at', start)
        .lte('scheduled_at', end)
        .maybeSingle();
    if (error) {
        console.error('[CRM_SYNC] hasBirthdayPostForDay', error);
        return true;
    }
    return !!data?.id;
}

async function hasLoyaltyPost(userId: string, campaignKey: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from('calendar_events')
        .select('id')
        .eq('user_id', userId)
        .eq('crm_campaign_key', campaignKey)
        .maybeSingle();
    if (error) {
        console.error('[CRM_SYNC] hasLoyaltyPost', error);
        return true;
    }
    return !!data?.id;
}

async function insertCalendarPosting(row: {
    user_id: string;
    title: string;
    description: string;
    type: string;
    scheduled_at: string;
    color: string;
    crm_contact_id?: string | null;
    crm_campaign_key?: string | null;
}): Promise<boolean> {
    const { error } = await supabaseAdmin.from('calendar_events').insert({
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        type: row.type,
        scheduled_at: row.scheduled_at,
        color: row.color,
        status: 'scheduled',
        platform: null,
        platforms: [],
        media_url: null,
        account_id: null,
        approval_required: false,
        approval_status: 'none',
        is_recurring: false,
        repeat_interval: null,
        repeat_frequency: 1,
        repeat_end_at: null,
        repeat_count: null,
        crm_contact_id: row.crm_contact_id ?? null,
        crm_campaign_key: row.crm_campaign_key ?? null,
    });
    if (error) {
        if (error.code === '23505') return false;
        console.error('[CRM_SYNC] insertCalendarPosting', error);
        return false;
    }
    return true;
}

const LOYALTY_DAYS = MONTHLY_LOYALTY_TEMPLATES.map((t) => t.dayOfMonth);

export type SyncCrmCalendarUserMeta = {
    civilDate: string;
    activeContactCount: number;
    birthdaysMatching: number;
    loyaltyRunsToday: boolean;
    loyaltyTemplateDays: number[];
};

/**
 * Creates birthday + loyalty CRM postings for one user for the given calendar day.
 * @param day Civil calendar date (manual sync: send browser local Y-M-D; cron: UTC civil day).
 */
export async function syncCrmCalendarForUser(
    userId: string,
    day: CivilDay
): Promise<{
    birthdayCreated: number;
    loyaltyCreated: number;
    meta: SyncCrmCalendarUserMeta;
}> {
    let birthdayCreated = 0;
    let loyaltyCreated = 0;

    const { count: anyContacts, error: cntErr } = await supabaseAdmin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('owner_user_id', userId);

    const metaBase: SyncCrmCalendarUserMeta = {
        civilDate: formatCivilDay(day),
        activeContactCount: anyContacts ?? 0,
        birthdaysMatching: 0,
        loyaltyRunsToday: LOYALTY_DAYS.includes(day.day),
        loyaltyTemplateDays: [...LOYALTY_DAYS],
    };

    if (cntErr || !anyContacts) {
        return { birthdayCreated: 0, loyaltyCreated: 0, meta: metaBase };
    }

    const { data: contacts, error: cErr } = await supabaseAdmin
        .from('contacts')
        .select('id, name, birthday, status, owner_user_id')
        .eq('owner_user_id', userId)
        .eq('status', 'Active');

    if (cErr) {
        return { birthdayCreated: 0, loyaltyCreated: 0, meta: metaBase };
    }

    const list = contacts ?? [];
    let birthdaysMatching = 0;
    for (const c of list) {
        if (c.birthday && matchesBirthdayMonthDay(c.birthday, day.month, day.day)) {
            birthdaysMatching += 1;
        }
    }

    const meta: SyncCrmCalendarUserMeta = { ...metaBase, birthdaysMatching };

    const scheduled_at = scheduledAtUtcNoon(day);

    for (const c of list) {
        if (!c.birthday || !matchesBirthdayMonthDay(c.birthday, day.month, day.day)) continue;
        if (await hasBirthdayPostForDay(userId, c.id, day)) continue;
        const copy = birthdayPostingCopy(c.name);
        const ok = await insertCalendarPosting({
            user_id: userId,
            title: copy.title,
            description: copy.description,
            type: 'crm_birthday',
            scheduled_at,
            color: 'rose',
            crm_contact_id: c.id,
        });
        if (ok) birthdayCreated += 1;
    }

    for (const tpl of MONTHLY_LOYALTY_TEMPLATES) {
        if (tpl.dayOfMonth !== day.day) continue;
        const campaignKey = `loyalty-${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
        if (await hasLoyaltyPost(userId, campaignKey)) continue;
        const ok = await insertCalendarPosting({
            user_id: userId,
            title: tpl.title,
            description: tpl.description,
            type: 'crm_loyalty',
            scheduled_at,
            color: tpl.color,
            crm_campaign_key: campaignKey,
        });
        if (ok) loyaltyCreated += 1;
    }

    return { birthdayCreated, loyaltyCreated, meta };
}

/**
 * Daily job: all distinct contact owners who use CRM.
 */
export async function syncCrmCalendarForAllOwners(day: CivilDay): Promise<SyncCrmCalendarResult> {
    const errors: string[] = [];
    let usersProcessed = 0;
    let birthdayPostsCreated = 0;
    let loyaltyPostsCreated = 0;
    let skipped = 0;

    const { data: owners, error } = await supabaseAdmin
        .from('contacts')
        .select('owner_user_id')
        .not('owner_user_id', 'is', null);

    if (error) {
        return {
            usersProcessed: 0,
            birthdayPostsCreated: 0,
            loyaltyPostsCreated: 0,
            skipped: 0,
            errors: [error.message],
        };
    }

    const ids = [...new Set((owners ?? []).map((r: { owner_user_id: string | null }) => r.owner_user_id).filter(Boolean))] as string[];

    for (const userId of ids) {
        try {
            const r = await syncCrmCalendarForUser(userId, day);
            usersProcessed += 1;
            birthdayPostsCreated += r.birthdayCreated;
            loyaltyPostsCreated += r.loyaltyCreated;
        } catch (e) {
            skipped += 1;
            errors.push(e instanceof Error ? e.message : String(e));
        }
    }

    return {
        usersProcessed,
        birthdayPostsCreated,
        loyaltyPostsCreated,
        skipped,
        errors,
    };
}
