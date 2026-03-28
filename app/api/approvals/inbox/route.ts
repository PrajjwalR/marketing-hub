import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

type UserRow = { user_id: string; name: string | null; email: string | null };

const POST_SELECT =
  "id,title,description,media_url,status,approval_status,scheduled_at,published_at,platform,platforms,type,account_id,color,approval_required,submitted_for_approval_at";

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const mode = new URL(req.url).searchParams.get("mode") || "inbox";

    if (mode === "submissions") {
      const { data: approvals, error } = await supabaseAdmin
        .from("post_approvals")
        .select("*")
        .eq("requested_by", userId)
        .order("requested_at", { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const payload = await enrichApprovals(approvals || [], userId);
      return NextResponse.json(payload);
    }

    const { data: reviewerRows, error: reviewerErr } = await supabaseAdmin
      .from("post_approval_reviewers")
      .select("*")
      .eq("reviewer_user_id", userId)
      .eq("decision", "pending")
      .order("id", { ascending: false });
    if (reviewerErr) return NextResponse.json({ error: reviewerErr.message }, { status: 500 });

    const approvalIds = (reviewerRows || []).map((row) => row.approval_id);

    const { data: approvals, error: approvalsErr } = await supabaseAdmin
      .from("post_approvals")
      .select("*")
      .in("id", approvalIds)
      .order("requested_at", { ascending: false });
    if (approvalsErr) return NextResponse.json({ error: approvalsErr.message }, { status: 500 });

    const payload = await enrichApprovals(approvals || [], userId, reviewerRows || undefined);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[APPROVAL_INBOX_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function enrichApprovals(
  approvals: Record<string, unknown>[],
  currentUserId: string,
  inboxReviewerRows?: { approval_id: string; reviewer_user_id: string; decision: string }[]
) {
  if (approvals.length === 0) return [];

  const postIds = [...new Set(approvals.map((a) => a.post_id as string))];
  const approvalIds = approvals.map((a) => a.id as string);

  const [{ data: posts }, { data: allReviewerRows }] = await Promise.all([
    supabaseAdmin.from("calendar_events").select(POST_SELECT).in("id", postIds),
    supabaseAdmin
      .from("post_approval_reviewers")
      .select("approval_id,reviewer_user_id,decision,comment,decision_at")
      .in("approval_id", approvalIds),
  ]);

  const requesterIds = [...new Set(approvals.map((a) => a.requested_by as string))];
  const reviewerUserIds = [...new Set((allReviewerRows || []).map((r) => r.reviewer_user_id))];
  const allUserIds = [...new Set([...requesterIds, ...reviewerUserIds, currentUserId])];

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("user_id,name,email")
    .in("user_id", allUserIds);

  const postMap = new Map((posts || []).map((p) => [p.id, p]));
  const usersMap = new Map((users || []).map((u: UserRow) => [u.user_id, u]));
  const reviewersByApproval = new Map<string, NonNullable<typeof allReviewerRows>>();
  for (const row of allReviewerRows || []) {
    const arr = reviewersByApproval.get(row.approval_id) || [];
    arr.push(row);
    reviewersByApproval.set(row.approval_id, arr);
  }

  const reviewerByApprovalInbox = inboxReviewerRows
    ? new Map(inboxReviewerRows.map((r) => [r.approval_id, r]))
    : null;

  return approvals.map((approval) => {
    const approvalId = approval.id as string;
    const rawReviewers = reviewersByApproval.get(approvalId) || [];
    const reviewers = rawReviewers.map((r) => ({
      ...r,
      user: usersMap.get(r.reviewer_user_id) || null,
    }));

    return {
      ...approval,
      post: postMap.get(approval.post_id as string) || null,
      requester: usersMap.get(approval.requested_by as string) || null,
      reviewers,
      reviewer: reviewerByApprovalInbox?.get(approvalId) || null,
    };
  });
}
