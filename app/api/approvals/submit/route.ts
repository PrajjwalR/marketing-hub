import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const postId = body?.postId as string | undefined;
    const reviewerIds = (body?.reviewerIds || []) as string[];
    const note = (body?.note || "") as string;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }
    if (!Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      return NextResponse.json({ error: "At least one reviewer is required" }, { status: 400 });
    }

    const normalizedReviewerIds = Array.from(
      new Set(
        reviewerIds
          .map((id) => (typeof id === "string" ? id.trim() : ""))
          .filter((id) => id.length > 0)
      )
    );

    if (normalizedReviewerIds.length === 0) {
      return NextResponse.json({ error: "At least one valid reviewer is required" }, { status: 400 });
    }

    if (normalizedReviewerIds.includes(userId)) {
      return NextResponse.json(
        { error: "Creator cannot be selected as a reviewer" },
        { status: 400 }
      );
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("calendar_events")
      .select("id,user_id,title,approval_status,status")
      .eq("id", postId)
      .eq("user_id", userId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.approval_status === "pending") {
      return NextResponse.json({ error: "Post is already pending approval" }, { status: 409 });
    }

    const { data: approval, error: approvalError } = await supabaseAdmin
      .from("post_approvals")
      .insert({
        user_id: userId,
        post_id: postId,
        requested_by: userId,
        requested_at: new Date().toISOString(),
        status: "pending",
        decision_note: note || null,
      })
      .select()
      .single();

    if (approvalError) return NextResponse.json({ error: approvalError.message }, { status: 500 });

    const reviewerRows = normalizedReviewerIds.map((reviewerId) => ({
      approval_id: approval.id,
      reviewer_user_id: reviewerId,
      role: "required",
      decision: "pending",
    }));
    const { error: reviewersError } = await supabaseAdmin
      .from("post_approval_reviewers")
      .insert(reviewerRows);
    if (reviewersError) return NextResponse.json({ error: reviewersError.message }, { status: 500 });

    const { error: updateError } = await supabaseAdmin
      .from("calendar_events")
      .update({
        approval_required: true,
        approval_status: "pending",
        submitted_for_approval_at: new Date().toISOString(),
        approved_at: null,
        approved_by: null,
      })
      .eq("id", postId)
      .eq("user_id", userId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    await supabaseAdmin.from("post_activity_log").insert({
      user_id: userId,
      post_id: postId,
      actor_user_id: userId,
      action: "submitted",
      payload: { reviewerIds: normalizedReviewerIds, note: note || null },
    });

    return NextResponse.json({ success: true, approvalId: approval.id });
  } catch (error) {
    console.error("[APPROVAL_SUBMIT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
