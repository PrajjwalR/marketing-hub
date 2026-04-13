import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";
import { encryptSocialToken } from "@/lib/token-crypto";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { userId } = await getAuthUser(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('social_connections')
            .select('id, platform, profile_name, profile_image, platform_user_id, status, connected_at, last_sync_at, created_at')
            .eq('user_id', userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        type SocialConnectionRow = {
            id: string;
            platform: string;
            profile_name?: string | null;
            profile_image?: string | null;
            platform_user_id?: string | null;
            status?: string | null;
            connected_at?: string | null;
            last_sync_at?: string | null;
            created_at?: string | null;
        };

        return NextResponse.json(
            ((data ?? []) as SocialConnectionRow[]).map((row) => ({
                ...row,
                status: row.status ?? 'connected',
                connected_at: row.connected_at ?? row.created_at ?? null,
                last_sync_at: row.last_sync_at ?? row.connected_at ?? row.created_at ?? null,
            }))
        );

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { platform, name, accessToken } = await req.json();
        const encryptedToken = encryptSocialToken(accessToken || 'placeholder_token');

        const { data, error } = await supabaseAdmin
            .from('social_connections')
            .upsert({
                user_id: userId,
                platform,
                profile_name: name,
                access_token: encryptedToken.value,
                token_encrypted: encryptedToken.encrypted,
                status: 'connected',
                connected_at: new Date().toISOString(),
                last_sync_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
            }, { onConflict: 'user_id,platform' })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await req.json();

        if (!id) {
            return new NextResponse("Connection ID required", { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('social_connections')
            .delete()
            .eq('user_id', userId)
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
