import { getAuthUser } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET  — Fetch auto-reply settings for user's connections
// POST — Create/update settings
// PATCH — Quick toggle enabled/disabled

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    let query = supabaseAdmin
      .from("auto_reply_settings")
      .select("*, social_connections(id, platform, profile_name, profile_image, internal_id)")
      .eq("user_id", userId);

    if (connectionId) {
      query = query.eq("connection_id", connectionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[AutoReply Settings] GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const {
      connectionId,
      enabled,
      pollingIntervalMinutes,
      maxRepliesPerDay,
      minDelaySeconds,
      maxDelaySeconds,
      blacklistKeywords,
      monitorAllPosts,
      aiProvider,
    } = body;

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("auto_reply_settings")
      .upsert(
        {
          user_id: userId,
          connection_id: connectionId,
          enabled: enabled ?? false,
          polling_interval_minutes: pollingIntervalMinutes ?? 10,
          max_replies_per_day: maxRepliesPerDay ?? 30,
          min_delay_seconds: minDelaySeconds ?? 2,
          max_delay_seconds: maxDelaySeconds ?? 12,
          blacklist_keywords: blacklistKeywords ?? [],
          monitor_all_posts: monitorAllPosts ?? true,
          ai_provider: aiProvider ?? "gemini",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,connection_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[AutoReply Settings] POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { connectionId, enabled } = body;

    if (!connectionId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "connectionId and enabled (boolean) are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("auto_reply_settings")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("connection_id", connectionId)
      .select()
      .single();

    if (error) {
      console.error("[AutoReply Settings] PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
