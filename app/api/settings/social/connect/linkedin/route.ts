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

        let clientId = process.env.LINKEDIN_CLIENT_ID;

        if (integrationId) {
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
            clientId = integration.client_id;
        }

        if (!clientId) {
            return new NextResponse("Missing LinkedIn Client ID. Please configure it in .env or use a custom app.", { status: 400 });
        }

        // Build redirect from request host (works with ngrok, localhost, production)
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        const redirectUri = `${baseUrl}/api/settings/social/callback/linkedin`;

        // w_member_social = personal posts; w_organization_social = page/company posts (Hello Stores)
        // App must be verified in LinkedIn Developer Portal for w_organization_social to work
        const scopes = ['openid', 'profile', 'email', 'w_member_social'];

        const stateData = JSON.stringify({ userId, integrationId });

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            state: Buffer.from(stateData).toString('base64'), // encode state since it's an object now
            scope: scopes.join(' '),
        });

        const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

        return NextResponse.redirect(url);

    } catch (error: unknown) {
        console.error("LinkedIn Connect Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
