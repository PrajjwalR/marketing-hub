import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth-helpers';
import { ensureFirebaseUser } from '@/lib/auth-server-utils';

// Any localhost / 127.0.0.1 origin (any port) is allowed for local dev.
// Production origins must be listed explicitly in REDEFINE_ALLOWED_ORIGINS.
const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    if (LOCALHOST_RE.test(origin)) return true;
    const explicit = (process.env.REDEFINE_ALLOWED_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return explicit.includes(origin);
}

function corsHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin',
    };
    if (isOriginAllowed(origin)) {
        headers['Access-Control-Allow-Origin'] = origin!;
    }
    return headers;
}

export async function OPTIONS(req: Request) {
    const origin = req.headers.get('origin');
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
    const origin = req.headers.get('origin');
    const cors = corsHeaders(origin);

    try {
        const { idToken, redefineUserData } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing idToken' }, { status: 400, headers: cors });
        }

        const r2ProjectId = process.env.NEXT_PUBLIC_R2_FIREBASE_PROJECT_ID;
        if (!r2ProjectId) {
            return NextResponse.json({ error: 'Redefine Project ID not configured' }, { status: 500, headers: cors });
        }

        let decoded: { email?: string; name?: string };
        try {
            decoded = (await verifyFirebaseToken(idToken, r2ProjectId)) as { email?: string; name?: string };
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'verification failed';
            console.error('Redefine token verification failed:', msg);
            return NextResponse.json({ error: 'Invalid Redefine token: ' + msg }, { status: 401, headers: cors });
        }

        const { email, name } = decoded;
        if (!email) {
            return NextResponse.json({ error: 'Token missing required field: email' }, { status: 400, headers: cors });
        }

        const { password, uid } = await ensureFirebaseUser(email, name || email.split('@')[0]);

        return NextResponse.json(
            {
                email,
                password,
                uid,
                redefineUserData: redefineUserData || {},
                org_id: redefineUserData?.orgId || null,
                project_id: redefineUserData?.project_id || null,
                source_login: 'redefine',
                redirect: '/dashboard/calendar',
            },
            { headers: cors }
        );
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal server error';
        console.error('Redefine verification error:', msg);
        return NextResponse.json({ error: msg }, { status: 500, headers: cors });
    }
}
