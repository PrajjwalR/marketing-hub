import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

const ALLOWED_PLATFORMS = ["youtube", "instagram", "facebook", "linkedin", "tiktok", "twitter", "email", "other"] as const;
const ALLOWED_TYPES = ["dm", "comment", "mention", "review", "email", "other"] as const;
const ALLOWED_ACTIONS = ["replied", "liked", "hidden", "archived", "resolved", "escalated", "other"] as const;

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)));

    const { data, error } = await supabaseAdmin
      .from("inbox_messages")
      .select("id,platform,message_type,received_at,actioned_at,action_type,tags,sender_handle,body_preview,priority_score,sentiment")
      .eq("user_id", userId)
      .order("received_at", { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("[INBOX_MESSAGES_GET]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const platform = (body?.platform || "").toLowerCase();
    const message_type = (body?.message_type || "comment").toLowerCase();
    const received_at = body?.received_at as string | undefined;
    const actioned_at = (body?.actioned_at as string | null) || null;
    const action_type = body?.action_type ? String(body.action_type).toLowerCase() : null;
    const tags = Array.isArray(body?.tags) ? body.tags.map(String) : [];
    const sender_handle = body?.sender_handle ? String(body.sender_handle) : null;
    const body_preview = body?.body_preview ? String(body.body_preview) : null;
    const priority_score = Number(body?.priority_score ?? 0);
    const sentiment = body?.sentiment ? String(body.sentiment) : null;
    const source_id = body?.source_id ? String(body.source_id) : null;

    if (!(ALLOWED_PLATFORMS as readonly string[]).includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }
    if (!(ALLOWED_TYPES as readonly string[]).includes(message_type)) {
      return NextResponse.json({ error: "Invalid message_type" }, { status: 400 });
    }
    if (!received_at) {
      return NextResponse.json({ error: "received_at is required" }, { status: 400 });
    }
    if (action_type && !(ALLOWED_ACTIONS as readonly string[]).includes(action_type)) {
      return NextResponse.json({ error: "Invalid action_type" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("inbox_messages")
      .insert({
        user_id: userId,
        platform,
        message_type,
        received_at,
        actioned_at,
        action_type,
        tags,
        sender_handle,
        body_preview,
        priority_score: Number.isFinite(priority_score) ? priority_score : 0,
        sentiment,
        source_id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error("[INBOX_MESSAGES_POST]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
