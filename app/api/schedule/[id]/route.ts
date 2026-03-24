import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { label_ids } = body;
        const action = typeof body?.action === 'string' ? body.action : null;

        const allowedFields = ['title', 'description', 'media_url', 'type', 'platform', 'platforms', 'account_id', 'color', 'scheduled_at', 'end_at', 'status', 'published_at', 'video_id', 'series_id'];
        const updates: Record<string, any> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updates[key] = body[key];
            }
        }

        if (action === 'publish_now') {
            updates.status = 'published';
            updates.published_at = new Date().toISOString();
        } else if (updates.status === 'published' && updates.published_at === undefined) {
            updates.published_at = new Date().toISOString();
        } else if (updates.status && updates.status !== 'published' && updates.published_at === undefined) {
            updates.published_at = null;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('calendar_events')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (Array.isArray(label_ids)) {
            const { error: removeError } = await supabaseAdmin
                .from('post_labels')
                .delete()
                .eq('user_id', userId)
                .eq('post_id', id);

            if (removeError) {
                return NextResponse.json({ error: removeError.message }, { status: 500 });
            }

            if (label_ids.length > 0) {
                const rows = label_ids.map((labelId: string) => ({
                    user_id: userId,
                    post_id: id,
                    label_id: labelId,
                }));
                const { error: insertError } = await supabaseAdmin
                    .from('post_labels')
                    .insert(rows);
                if (insertError) {
                    return NextResponse.json({ error: insertError.message }, { status: 500 });
                }
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
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (refetchError) {
            return NextResponse.json({ error: refetchError.message }, { status: 500 });
        }

        return NextResponse.json(withLabels);
    } catch (error) {
        console.error("[SCHEDULE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('calendar_events')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SCHEDULE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
