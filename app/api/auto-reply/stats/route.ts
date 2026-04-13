import { getAuthUser } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET — Summary stats for auto-reply dashboard
export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");
    const today = new Date().toISOString().split("T")[0];

    // Daily count
    let dailyQuery = supabaseAdmin
      .from("auto_reply_daily_counts")
      .select("reply_count, connection_id")
      .eq("count_date", today);

    if (connectionId) {
      dailyQuery = dailyQuery.eq("connection_id", connectionId);
    }

    const { data: dailyCounts } = await dailyQuery;
    const repliesToday = (dailyCounts || []).reduce(
      (sum: number, r: any) => sum + (r.reply_count || 0),
      0
    );

    // Total replies ever
    let totalQuery = supabaseAdmin
      .from("processed_comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("replied", true);

    if (connectionId) totalQuery = totalQuery.eq("connection_id", connectionId);

    const { count: totalReplies } = await totalQuery;

    // Total skipped
    let skippedQuery = supabaseAdmin
      .from("processed_comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("replied", false);

    if (connectionId) skippedQuery = skippedQuery.eq("connection_id", connectionId);

    const { count: totalSkipped } = await skippedQuery;

    // Errors today
    let errQuery = supabaseAdmin
      .from("auto_reply_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "error")
      .gte("created_at", `${today}T00:00:00`);

    if (connectionId) errQuery = errQuery.eq("connection_id", connectionId);

    const { count: errorsToday } = await errQuery;

    return NextResponse.json({
      data: {
        repliesToday,
        totalReplies: totalReplies || 0,
        totalSkipped: totalSkipped || 0,
        errorsToday: errorsToday || 0,
      },
    });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
