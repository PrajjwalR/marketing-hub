import { getAuthUser } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const integrationId = searchParams.get('integrationId');

        if (!integrationId) {
            return new NextResponse("Missing integration ID. Please use a custom app.", { status: 400 });
        }

        const { data: integration, error } = await supabaseAdmin
            .from('social_integrations')
            .select('client_id')
            .eq('id', integrationId)
            .eq('user_id', userId)
            .single();

        if (error || !integration) {
            console.error("Failed to fetch integration credentials:", error);
            return new NextResponse("Invalid integration", { status: 400 });
        }

        const clientId = integration.client_id;

        // Dynamically get the current host (works for Vercel, ngrok, or localhost).
        // Must match the callback route exactly: Meta rejects the token exchange if
        // the redirect_uri differs, so don't prefer NEXT_PUBLIC_APP_URL here.
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        const redirectUri = `${baseUrl}/api/settings/social/callback/facebook`;

        // Requesting pages read and manage posts scopes
        const scopes = ['public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];

        const stateData = JSON.stringify({ userId, integrationId });

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            state: Buffer.from(stateData).toString('base64'),
            scope: scopes.join(','),
            response_type: 'code',
            auth_type: 'rerequest' // Ensure we ask for permissions again if they previously declined
        });

        const url = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;

        return NextResponse.redirect(url);

    } catch (error: any) {
        console.error("Facebook Connect Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
