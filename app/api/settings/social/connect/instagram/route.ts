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
        
        // Dynamically get the current host (works for ngrok or localhost)
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        const redirectUri = `${baseUrl}/api/settings/social/callback/instagram`;

        const scopes = [
            'public_profile',
            'pages_show_list',        // Required to get Facebook Pages and linked IG accounts
            'business_management',    // Required for Business Suite / Business-owned Pages
            'instagram_basic',        // Basic Instagram access
            'instagram_content_publish', // Publish media to Instagram
            'instagram_manage_comments', // Manage comments
            'instagram_manage_insights', // Read insights
        ];

        const stateData = JSON.stringify({ userId, integrationId });

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            state: Buffer.from(stateData).toString('base64'),
            scope: scopes.join(','),
            response_type: 'code',
        });

        // We MUST use Facebook Login to get permissions for Instagram Business Publishing.
        // instagram.com/oauth/authorize is only for the read-only Basic Display API.
        const url = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;

        return NextResponse.redirect(url);

    } catch (error: unknown) {
        console.error("Instagram Connect Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
