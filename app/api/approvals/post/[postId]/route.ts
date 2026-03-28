import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

/** Latest approval + current reviewer ids for a post (owner only). */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { postId } = await params;

    const { data: post, error: postError } = await supabaseAdmin
      .from("calendar_events")
      .select("id")
      .eq("id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { data: approval } = await supabaseAdmin
      .from("post_approvals")
      .select("id,status,requested_at")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!approval) {
      return NextResponse.json({ approval: null, reviewerIds: [] as string[] });
    }

    const { data: rows } = await supabaseAdmin
      .from("post_approval_reviewers")
      .select("reviewer_user_id")
      .eq("approval_id", approval.id);

    return NextResponse.json({
      approval,
      reviewerIds: (rows || []).map((r) => r.reviewer_user_id),
    });
  } catch (error) {
    console.error("[APPROVAL_POST_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
