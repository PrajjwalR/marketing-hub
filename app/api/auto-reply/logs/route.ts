import { getAuthUser } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET    — Paginated activity logs
export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");
    const action = searchParams.get("action");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("auto_reply_logs")
      .select("*, social_connections(profile_name, profile_image)", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (connectionId) query = query.eq("connection_id", connectionId);
    if (action) query = query.eq("action", action);

    const { data, error, count } = await query;

    if (error) {
      console.error("[AutoReply Logs] GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      pagination: { page, limit, total: count || 0 },
    });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
