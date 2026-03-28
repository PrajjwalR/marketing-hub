import { getAuthUser } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { encryptSocialToken } from "@/lib/token-crypto";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const userId = searchParams.get('state'); // clerk userId passed in state

        if (!code) {
            return new NextResponse("Missing code", { status: 400 });
        }

        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/settings/social/callback/tiktok`;

        // 1. Exchange code for tokens
        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_key: clientKey!,
                client_secret: clientSecret!,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("TikTok Token Error:", tokenData.error, tokenData.error_description);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=tiktok_token`);
        }

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
        const encryptedAccess = encryptSocialToken(accessToken);
        const encryptedRefresh = encryptSocialToken(refreshToken);

        // 2. Get TikTok User Info
        const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const userData = await userRes.json();

        const profile = userData.data?.user;
        const profileName = profile?.display_name || 'TikTok User';
        const profileImage = profile?.avatar_url || '';

        // 3. Store in Supabase
        const { error: upsertError } = await supabaseAdmin
            .from('social_connections')
            .upsert({
                user_id: userId,
                platform: 'tiktok',
                access_token: encryptedAccess.value,
                refresh_token: encryptedRefresh.value,
                token_encrypted: encryptedAccess.encrypted,
                status: 'connected',
                connected_at: new Date().toISOString(),
                last_sync_at: new Date().toISOString(),
                expires_at: expiresAt,
                profile_name: profileName,
                profile_image: profileImage,
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id,platform' });

        if (upsertError) {
            console.error("Supabase storage error:", upsertError);
            return new NextResponse("Failed to save connection", { status: 500 });
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?connected=tiktok`);

    } catch (error: any) {
        console.error("TikTok Callback Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
