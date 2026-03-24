import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

type Decision = "approved" | "rejected" | "changes_requested";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const { id } = await params;

    const body = await req.json();
    const decision = body?.decision as Decision;
    const comment = (body?.comment || "") as string;

    if (!["approved", "rejected", "changes_requested"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const { data: approval, error: approvalError } = await supabaseAdmin
      .from("post_approvals")
      .select("*")
      .eq("id", id)
      .single();
    if (approvalError || !approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    const { data: reviewerRow, error: reviewerError } = await supabaseAdmin
      .from("post_approval_reviewers")
      .select("*")
      .eq("approval_id", id)
      .eq("reviewer_user_id", userId)
      .single();
    if (reviewerError || !reviewerRow) {
      return NextResponse.json({ error: "Not assigned as reviewer" }, { status: 403 });
    }

    const { error: updateReviewerError } = await supabaseAdmin
      .from("post_approval_reviewers")
      .update({
        decision,
        decision_at: new Date().toISOString(),
        comment: comment || null,
      })
      .eq("id", reviewerRow.id);
    if (updateReviewerError) {
      return NextResponse.json({ error: updateReviewerError.message }, { status: 500 });
    }

    const { data: allReviewerRows, error: allError } = await supabaseAdmin
      .from("post_approval_reviewers")
      .select("decision")
      .eq("approval_id", id);
    if (allError) return NextResponse.json({ error: allError.message }, { status: 500 });

    const decisions = (allReviewerRows || []).map((row) => row.decision);
    let finalStatus: "pending" | "approved" | "rejected" | "changes_requested" = "pending";

    if (decisions.includes("rejected")) finalStatus = "rejected";
    else if (decisions.includes("changes_requested")) finalStatus = "changes_requested";
    else if (decisions.length > 0 && decisions.every((item) => item === "approved")) finalStatus = "approved";

    const approvalUpdate: Record<string, string | null> = {
      status: finalStatus,
    };
    if (finalStatus !== "pending") {
      approvalUpdate.resolved_by = userId;
      approvalUpdate.resolved_at = new Date().toISOString();
      approvalUpdate.decision_note = comment || null;
    } else {
      approvalUpdate.resolved_by = null;
      approvalUpdate.resolved_at = null;
    }

    const { error: approvalUpdateError } = await supabaseAdmin
      .from("post_approvals")
      .update(approvalUpdate)
      .eq("id", id);
    if (approvalUpdateError) return NextResponse.json({ error: approvalUpdateError.message }, { status: 500 });

    const postUpdate: Record<string, string | null | boolean> = {
      approval_status: finalStatus,
      approval_required: true,
    };
    if (finalStatus === "approved") {
      postUpdate.approved_by = userId;
      postUpdate.approved_at = new Date().toISOString();
    } else {
      postUpdate.approved_by = null;
      postUpdate.approved_at = null;
    }

    const { error: postError } = await supabaseAdmin
      .from("calendar_events")
      .update(postUpdate)
      .eq("id", approval.post_id)
      .eq("user_id", approval.user_id);
    if (postError) return NextResponse.json({ error: postError.message }, { status: 500 });

    await supabaseAdmin.from("post_activity_log").insert({
      user_id: approval.user_id,
      post_id: approval.post_id,
      actor_user_id: userId,
      action: finalStatus,
      payload: { decision, comment: comment || null },
    });

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error) {
    console.error("[APPROVAL_DECISION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
