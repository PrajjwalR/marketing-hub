import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { platform, clientId, clientSecret, name } = await req.json();

        if (!platform || !clientId || !clientSecret || !name) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Add to custom integrations
        const { data, error } = await supabaseAdmin
            .from('social_integrations')
            .upsert({
                user_id: userId,
                platform,
                client_id: clientId,
                client_secret: clientSecret,
                name: name,
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id,platform,client_id' })
            .select()
            .single();

        if (error) {
            console.error("Failed to save integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function GET(req: Request) {
    try {
        const { userId } = await getAuthUser(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('social_integrations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Failed to fetch integrations:", error);
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
            return new NextResponse("Missing integration ID", { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('social_integrations')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error("Failed to delete integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
