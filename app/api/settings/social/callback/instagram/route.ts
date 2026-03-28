import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { encryptSocialToken } from "@/lib/token-crypto";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const stateBase64 = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Dynamically get the current host (works for ngrok or localhost)
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        if (error) {
            console.error("Instagram OAuth Error:", error, errorDescription);
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=${encodeURIComponent(errorDescription || error)}`);
        }

        if (!code || !stateBase64) {
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=missing_params`);
        }

        let stateObj;
        try {
            const stateStr = Buffer.from(stateBase64, 'base64').toString('utf-8');
            stateObj = JSON.parse(stateStr);
        } catch (e) {
            console.error("Failed to decode state:", e);
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=invalid_state`);
        }

        const { userId, integrationId } = stateObj;

        if (!userId || !integrationId) {
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=invalid_state`);
        }

        // 1. Fetch custom app credentials
        const { data: integration, error: intError } = await supabaseAdmin
            .from('social_integrations')
            .select('client_id, client_secret')
            .eq('id', integrationId)
            .eq('user_id', userId)
            .single();

        if (intError || !integration) {
            console.error("Integration fetch error", intError);
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=invalid_integration`);
        }

        const clientId = integration.client_id;
        const clientSecret = integration.client_secret;
        const redirectUri = `${baseUrl}/api/settings/social/callback/instagram`;

        // 2. Exchange authorization code for access token using Facebook Graph API
        // With the Facebook App Secret, we MUST exchange the token at graph.facebook.com.
        // This is what grants the publishing permissions.
        const tokenParams = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code: code,
        });

        const tokenRes = await fetch(
            `https://graph.facebook.com/v21.0/oauth/access_token?${tokenParams.toString()}`,
            { method: 'GET' }
        );
        const tokenData = await tokenRes.json();

        if (tokenData.error_type || tokenData.error) {
            console.error("Instagram Token Error:", tokenData);
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=instagram_token_error&detail=${encodeURIComponent(tokenData.error_message || tokenData.error?.message || 'token_error')}`);
        }

        const accessToken = tokenData.access_token;

        // 3. Get the Facebook user info
        const meRes = await fetch(
            `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${accessToken}`
        );
        const meData = await meRes.json();
        if (meData.error) {
            console.error("Facebook Me Error:", meData);
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=instagram_profile_error`);
        }

        // 4. Get Linked Instagram Business Account
        // Try me/accounts first (personally-owned pages), then me/businesses + owned_pages (Business Suite pages)
        const fields = 'instagram_business_account,name,id,access_token';
        let pages: any[] = [];

        // 4a. Try me/accounts (works for personally-owned pages)
        const accountsRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}&fields=${fields}`
        );
        const accountsData = await accountsRes.json();
        if (accountsData.data && accountsData.data.length > 0) {
            pages = accountsData.data;
        }

        // 4b. If empty, try me/businesses → owned_pages (Business Suite / Business-owned pages)
        if (pages.length === 0 && !accountsData.error) {
            const businessesRes = await fetch(
                `https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}&fields=id,name`
            );
            const businessesData = await businessesRes.json();
            if (businessesData.data && businessesData.data.length > 0) {
                // Check ALL businesses - user may have multiple (e.g. Agent Elephant, Not bio check the stuff)
                for (const biz of businessesData.data) {
                    // Try owned_pages (pages the business owns)
                    const ownedRes = await fetch(
                        `https://graph.facebook.com/v21.0/${biz.id}/owned_pages?access_token=${accessToken}&fields=${fields}`
                    );
                    const ownedData = await ownedRes.json();
                    if (ownedData.data && ownedData.data.length > 0) {
                        pages = ownedData.data;
                        break;
                    }
                    // Try client_pages (pages the business has been granted access to)
                    const clientRes = await fetch(
                        `https://graph.facebook.com/v21.0/${biz.id}/client_pages?access_token=${accessToken}&fields=${fields}`
                    );
                    const clientData = await clientRes.json();
                    if (clientData.data && clientData.data.length > 0) {
                        pages = clientData.data;
                        break;
                    }
                }
            }
        }

        let igAccountId = '';
        let profileName = meData.name || 'Instagram Business';
        let profileImage = '';
        let pageAccessToken = accessToken;

        if (pages.length > 0) {
            const page = pages.find((p: any) => p.instagram_business_account);
            
            if (page?.instagram_business_account) {
                igAccountId = page.instagram_business_account.id;
                if (page.access_token) {
                    pageAccessToken = page.access_token;
                }

                const igProfileRes = await fetch(
                    `https://graph.facebook.com/v21.0/${igAccountId}?fields=username,name,profile_picture_url&access_token=${pageAccessToken}`
                );
                const igProfileData = await igProfileRes.json();
                if (!igProfileData.error) {
                    profileName = igProfileData.username || igProfileData.name || profileName;
                    profileImage = igProfileData.profile_picture_url || '';
                }
            } else {
                console.error("📌 Found Pages but NONE have Instagram Business Account linked.");
                return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_ig_business_account`);
            }
        } else {
            console.error("📌 Error: No Facebook Pages found (tried me/accounts and me/businesses).");
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_facebook_pages`);
        }

        if (!igAccountId) {
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_ig_account_found`);
        }

        // 4.5. Ensure user exists in users table (required FK for social_connections)
        await supabaseAdmin
            .from('users')
            .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

        // 5. Store in Supabase
        // Notice we save 'pageAccessToken' which has the required Page/Publish scopes
        const encryptedAccess = encryptSocialToken(pageAccessToken);
        const { error: upsertError } = await supabaseAdmin
            .from('social_connections')
            .upsert({
                user_id: userId,
                integration_id: integrationId,
                platform: 'instagram',
                access_token: encryptedAccess.value,
                token_encrypted: encryptedAccess.encrypted,
                status: 'connected',
                connected_at: new Date().toISOString(),
                last_sync_at: new Date().toISOString(),
                profile_name: profileName,
                profile_image: profileImage,
                platform_user_id: igAccountId,
                internal_id: igAccountId,
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id,platform,platform_user_id' });

        if (upsertError) {
            console.error("Supabase storage error:", upsertError);
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=database_error`);
        }

        return NextResponse.redirect(`${baseUrl}/dashboard/settings?connected=instagram`);

    } catch (error: any) {
        console.error("Instagram Callback Error:", error);
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        return NextResponse.redirect(`${protocol}://${host}/dashboard/settings?error=internal_error`);
    }
}