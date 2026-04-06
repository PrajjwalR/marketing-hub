import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";
import { calculateNextScheduledAt } from "@/lib/recurrence";

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
        const { label_ids, reviewer_ids } = body;
        const action = typeof body?.action === 'string' ? body.action : null;

        const { data: existingPost, error: existingError } = await supabaseAdmin
            .from('calendar_events')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (existingError || !existingPost) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const allowedFields = ['title', 'description', 'media_url', 'type', 'platform', 'platforms', 'account_id', 'color', 'scheduled_at', 'end_at', 'status', 'published_at', 'video_id', 'series_id', 'approval_required', 'is_recurring', 'repeat_interval', 'repeat_frequency', 'repeat_end_at', 'repeat_count'];
        const updates: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updates[key] = body[key];
            }
        }

        const wantsPublish = action === 'publish_now' || updates.status === 'published';
        if (wantsPublish && existingPost.approval_required && existingPost.approval_status !== 'approved') {
            return NextResponse.json(
                { error: "This post requires approval before publishing" },
                { status: 409 }
            );
        }

        if (action === 'publish_now') {
            updates.status = 'published';
            updates.published_at = new Date().toISOString();
        } else if (updates.status === 'published' && updates.published_at === undefined) {
            updates.published_at = new Date().toISOString();
        } else if (updates.status && updates.status !== 'published' && updates.published_at === undefined) {
            updates.published_at = null;
        }

        const hasCalendarUpdates = Object.keys(updates).length > 0;
        const hasLabelUpdate = Array.isArray(label_ids);
        const hasReviewerUpdate = Array.isArray(reviewer_ids);

        if (!hasCalendarUpdates && !hasLabelUpdate && !hasReviewerUpdate) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        // --- Recurrence & Recycling Logic ---
        // If the post is being published and is recurring
        const postIsNowPublished = (existingPost.status !== 'published' && updates.status === 'published') || action === 'publish_now';
        const postRecurrenceEnabled = updates.is_recurring ?? existingPost.is_recurring;

        if (postIsNowPublished && postRecurrenceEnabled) {
            const interval = updates.repeat_interval ?? existingPost.repeat_interval;
            const frequency = updates.repeat_frequency ?? existingPost.repeat_frequency;
            const endAt = updates.repeat_end_at ?? existingPost.repeat_end_at;
            const repeatCount = updates.repeat_count ?? existingPost.repeat_count;
            const recycledCount = (existingPost.recycled_count ?? 0);

            const nextDate = calculateNextScheduledAt(
                new Date().toISOString(),
                interval,
                frequency,
                endAt,
                repeatCount,
                recycledCount + 1
            );

            if (nextDate) {
                // Create the next iteration
                const nextPostPayload = {
                    user_id: userId,
                    title: updates.title ?? existingPost.title,
                    description: updates.description ?? existingPost.description,
                    media_url: updates.media_url ?? existingPost.media_url,
                    type: updates.type ?? existingPost.type,
                    platform: updates.platform ?? existingPost.platform,
                    platforms: updates.platforms ?? existingPost.platforms,
                    account_id: updates.account_id ?? existingPost.account_id,
                    color: updates.color ?? existingPost.color,
                    scheduled_at: nextDate.toISOString(),
                    status: 'scheduled',
                    video_id: updates.video_id ?? existingPost.video_id,
                    series_id: updates.series_id ?? existingPost.series_id,
                    approval_required: updates.approval_required ?? existingPost.approval_required,
                    is_recurring: true,
                    repeat_interval: interval,
                    repeat_frequency: frequency,
                    repeat_end_at: endAt,
                    repeat_count: repeatCount,
                    recycled_count: recycledCount + 1,
                    source_post_id: id
                };

                const { error: recycleError } = await supabaseAdmin
                    .from('calendar_events')
                    .insert(nextPostPayload);

                if (recycleError) {
                    console.error("[RECYCLE_ERROR]", recycleError);
                    // Silently fail or log it; we don't want to stop the main publish
                }
            }
        }

        if (hasCalendarUpdates) {
            const { error } = await supabaseAdmin
                .from('calendar_events')
                .update(updates)
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        if (hasReviewerUpdate) {
            if (existingPost.approval_status !== 'pending') {
                return NextResponse.json(
                    { error: "Reviewers can only be updated while approval is pending" },
                    { status: 409 }
                );
            }

            const normalized = Array.from(
                new Set(
                    (reviewer_ids as unknown[])
                        .map((rid) => (typeof rid === 'string' ? rid.trim() : ''))
                        .filter((rid) => rid.length > 0)
                )
            );

            if (normalized.length === 0) {
                return NextResponse.json({ error: "At least one reviewer is required" }, { status: 400 });
            }

            if (normalized.includes(userId)) {
                return NextResponse.json({ error: "Creator cannot be selected as a reviewer" }, { status: 400 });
            }

            const { data: pendingApproval, error: apprErr } = await supabaseAdmin
                .from('post_approvals')
                .select('id,status')
                .eq('post_id', id)
                .eq('user_id', userId)
                .eq('status', 'pending')
                .order('requested_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (apprErr || !pendingApproval) {
                return NextResponse.json({ error: "No pending approval found for this post" }, { status: 404 });
            }

            const { data: existingRows, error: exErr } = await supabaseAdmin
                .from('post_approval_reviewers')
                .select('decision')
                .eq('approval_id', pendingApproval.id);

            if (exErr) {
                return NextResponse.json({ error: exErr.message }, { status: 500 });
            }

            const decided = (existingRows || []).some((row) => row.decision !== 'pending');
            if (decided) {
                return NextResponse.json(
                    { error: "Cannot change reviewers after someone has already decided" },
                    { status: 409 }
                );
            }

            const { error: delErr } = await supabaseAdmin
                .from('post_approval_reviewers')
                .delete()
                .eq('approval_id', pendingApproval.id);

            if (delErr) {
                return NextResponse.json({ error: delErr.message }, { status: 500 });
            }

            const reviewerRows = normalized.map((reviewerId) => ({
                approval_id: pendingApproval.id,
                reviewer_user_id: reviewerId,
                role: 'required',
                decision: 'pending',
            }));

            const { error: insErr } = await supabaseAdmin
                .from('post_approval_reviewers')
                .insert(reviewerRows);

            if (insErr) {
                return NextResponse.json({ error: insErr.message }, { status: 500 });
            }
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
