import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '@/lib/auth-helpers';
import { ensureFirebaseUser } from '@/lib/auth-server-utils';

const DEFAULT_DEV_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
];

function allowedOrigins(): string[] {
    const fromEnv = (process.env.HELLOSTORES_ALLOWED_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return fromEnv.length ? fromEnv : DEFAULT_DEV_ORIGINS;
}

function corsHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin',
    };
    if (origin && allowedOrigins().includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }
    return headers;
}

type DecodedIdentity = { email?: string; name?: string };

/**
 * Verifies a token that may be either:
 *  - A Firebase RS256 ID token (from a direct Firebase sign-in in hello_stores), OR
 *  - An HS256 JWT minted by redefine-backend-api's /api/auth/login (central login).
 *
 * The algorithm is inspected from the token header. HS256 uses the shared
 * HELLOSTORES_BACKEND_JWT_SECRET env var (matching redefine-backend-api's
 * tenantAuth.js JWT_SECRET).
 */
async function verifyIdentityToken(token: string): Promise<DecodedIdentity> {
    const header = jwt.decode(token, { complete: true }) as { header?: { alg?: string } } | null;
    const alg = header?.header?.alg;

    if (alg === 'HS256') {
        const secret = process.env.HELLOSTORES_BACKEND_JWT_SECRET;
        if (!secret) throw new Error('HELLOSTORES_BACKEND_JWT_SECRET not configured');
        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as Record<string, unknown>;
        const email = typeof decoded.email === 'string' ? decoded.email : undefined;
        const first = typeof decoded.first_name === 'string' ? decoded.first_name : '';
        const last = typeof decoded.last_name === 'string' ? decoded.last_name : '';
        const name = `${first} ${last}`.trim() || undefined;
        return { email, name };
    }

    if (alg === 'RS256') {
        const h2ProjectId = process.env.NEXT_PUBLIC_H2_FIREBASE_PROJECT_ID;
        if (!h2ProjectId) throw new Error('HelloStores Project ID not configured');
        const decoded = (await verifyFirebaseToken(token, h2ProjectId)) as { email?: string; name?: string };
        return { email: decoded.email, name: decoded.name };
    }

    throw new Error(`Unsupported token algorithm: ${alg ?? 'unknown'}`);
}

export async function OPTIONS(req: Request) {
    const origin = req.headers.get('origin');
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
    const origin = req.headers.get('origin');
    const cors = corsHeaders(origin);

    try {
        const { idToken, hellostoresUserData } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing idToken' }, { status: 400, headers: cors });
        }

        let identity: DecodedIdentity;
        try {
            identity = await verifyIdentityToken(idToken);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'verification failed';
            console.error('HelloStores token verification failed:', msg);
            return NextResponse.json({ error: 'Invalid HelloStores token: ' + msg }, { status: 401, headers: cors });
        }

        const { email, name } = identity;
        if (!email) {
            return NextResponse.json({ error: 'Token missing required field: email' }, { status: 400, headers: cors });
        }

        const { password, uid } = await ensureFirebaseUser(email, name || email.split('@')[0]);

        return NextResponse.json(
            {
                email,
                password,
                uid,
                hellostoresUserData: hellostoresUserData || {},
                org_id: hellostoresUserData?.org_id || null,
                project_id: hellostoresUserData?.project_id || null,
                source_login: 'hellostores',
                redirect: '/dashboard',
            },
            { headers: cors }
        );

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal server error';
        console.error('HelloStores verification error:', msg);
        return NextResponse.json({ error: msg }, { status: 500, headers: cors });
    }
}
