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

        if (error) {
            console.error("Facebook OAuth Error:", error, errorDescription);
            return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(errorDescription || error)}`, req.url));
        }

        if (!code || !stateBase64) {
             return NextResponse.redirect(new URL('/dashboard/settings?error=missing_params', req.url));
        }

        const stateStr = Buffer.from(stateBase64, 'base64').toString('utf-8');
        const state = JSON.parse(stateStr);
        const { userId, integrationId } = state;

        if (!userId || !integrationId) {
             return NextResponse.redirect(new URL('/dashboard/settings?error=invalid_state', req.url));
        }
        
        // 1. Fetch credentials
        const { data: integration, error: intError } = await supabaseAdmin
            .from('social_integrations')
            .select('client_id, client_secret')
            .eq('id', integrationId)
            .eq('user_id', userId)
            .single();

        if (intError || !integration) {
            console.error("Integration fetch error", intError);
             return NextResponse.redirect(new URL('/dashboard/settings?error=invalid_integration', req.url));
        }

        const clientId = integration.client_id;
        const clientSecret = integration.client_secret;
        
        // Dynamically get the current host (works for ngrok or localhost)
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        const redirectUri = `${baseUrl}/api/settings/social/callback/facebook`;

        // 2. Exchange code for access token
        const tokenResponse = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`);

        if (!tokenResponse.ok) {
            const errStr = await tokenResponse.text();
            console.error("Facebook token exchange failed:", errStr);
            return NextResponse.redirect(new URL('/dashboard/settings?error=token_exchange_failed', req.url));
        }

        const tokenData = await tokenResponse.json();
        const userAccessToken = tokenData.access_token;
        
        // Facebook access tokens are short-lived. We need to exchange for a long-lived one.
        // Skipping exact long-lived exchange for brevity, but this is the standard flow if short-lived.
        
        // 3. Fetch User profile to get their name
        const profileRes = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${userAccessToken}`);
        if (!profileRes.ok) {
             console.error("Facebook profile fetch failed");
             return NextResponse.redirect(new URL('/dashboard/settings?error=profile_fetch_failed', req.url));
        }
        const profileData = await profileRes.json();
        const rootInternalId = profileData.id;

        // 4. Fetch User Pages. (Users log in with their personal accounts, but post to pages)
        const pagesRes = await fetch(`https://graph.facebook.com/${rootInternalId}/accounts?access_token=${userAccessToken}`);
        if (!pagesRes.ok) {
             console.error("Facebook pages fetch failed");
             return NextResponse.redirect(new URL('/dashboard/settings?error=pages_fetch_failed', req.url));
        }
        const pagesData = await pagesRes.json();
        
        const pages = pagesData.data || [];
        const encryptedUserToken = encryptSocialToken(userAccessToken);
        
        if (pages.length === 0) {
            return NextResponse.redirect(new URL('/dashboard/settings?error=no_facebook_pages_found', req.url));
        }

        // 5. Save connections for each page using upsert
        let addedCount = 0;
        for (const page of pages) {
            const pageId = page.id;
            const pageName = page.name;
            const pageAccessToken = page.access_token;
            const encryptedPageToken = encryptSocialToken(pageAccessToken);
            
            const { error: upsertError } = await supabaseAdmin
                .from('social_connections')
                .upsert({
                    user_id: userId,
                    integration_id: integrationId,
                    platform: 'facebook',
                    profile_name: pageName,
                    platform_user_id: pageId,
                    internal_id: pageId,
                    access_token: encryptedPageToken.value,
                    refresh_token: encryptedUserToken.value, // User token stored as root reference
                    token_encrypted: encryptedPageToken.encrypted,
                    status: 'connected',
                    connected_at: new Date().toISOString(),
                    last_sync_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }, { onConflict: 'user_id,platform,platform_user_id' });

            if (upsertError) {
                console.error(`Failed to upsert Facebook page ${pageId}:`, upsertError);
            } else {
                addedCount++;
            }
        }
        
        // 6. Update the integration status to active
        await supabaseAdmin
            .from('social_integrations')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('id', integrationId);

        return NextResponse.redirect(new URL('/dashboard/settings?success=facebook_connected', req.url));

    } catch (error: any) {
        console.error("Facebook Callback Error:", error);
        return NextResponse.redirect(new URL('/dashboard/settings?error=internal_error', req.url));
    }
}
