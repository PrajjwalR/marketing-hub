import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export async function GET(req: Request) {
    try {
        const { userId } = await getAuthUser(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('calendar_events')
            .select(`
                *,
                post_labels (
                    label:labels (
                        id,
                        name,
                        color
                    )
                ),
                video:video_id (
                    id,
                    title,
                    video_url,
                    status
                ),
                series:series_id (
                    id,
                    series_name
                )
            `)
            .eq('user_id', userId)
            .order('scheduled_at', { ascending: true });

        if (error) {
            console.error("[SCHEDULE_POST_INSERT_ERROR]", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[SCHEDULE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await getAuthUser(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, description, media_url, type, platform, platforms, account_id, color, scheduled_at, end_at, status, published_at, video_id, series_id, label_ids, approval_required } = body;

        if (!title || !scheduled_at) {
            return NextResponse.json(
                { error: "Title and scheduled date are required" },
                { status: 400 }
            );
        }

        if (approval_required && status === 'published') {
            return NextResponse.json(
                { error: "Post requires approval before publishing" },
                { status: 409 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('calendar_events')
            .insert({
                user_id: userId,
                title,
                description: description || null,
                media_url: media_url || null,
                type: type || 'event',
                platform: platform || null,
                account_id: account_id || null,
                color: color || 'indigo',
                scheduled_at,
                end_at: end_at || null,
                platforms: Array.isArray(platforms) ? platforms : (platform ? [platform] : []),
                published_at: published_at || null,
                approval_required: !!approval_required,
                approval_status: 'none',
                video_id: video_id || null,
                series_id: series_id || null,
                status: status || 'scheduled',
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (Array.isArray(label_ids) && label_ids.length > 0) {
            const rows = label_ids.map((labelId: string) => ({
                user_id: userId,
                post_id: data.id,
                label_id: labelId,
            }));
            const { error: labelError } = await supabaseAdmin
                .from('post_labels')
                .upsert(rows, { onConflict: 'user_id,post_id,label_id' });
            if (labelError) {
                console.error("[SCHEDULE_POST_LABELS_ERROR]", labelError);
                return NextResponse.json({ error: labelError.message }, { status: 500 });
            }
        }

        const { data: withLabels, error: refetchError } = await supabaseAdmin
            .from('calendar_events')
            .select(`
                *,
                post_labels (
                    label:labels (
                        id,
                        name,
                        color
                    )
                )
            `)
            .eq('id', data.id)
            .single();

        if (refetchError) {
            console.error("[SCHEDULE_POST_REFETCH_ERROR]", refetchError);
            return NextResponse.json({ error: refetchError.message }, { status: 500 });
        }

        return NextResponse.json(withLabels, { status: 201 });
    } catch (error) {
        console.error("[SCHEDULE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
