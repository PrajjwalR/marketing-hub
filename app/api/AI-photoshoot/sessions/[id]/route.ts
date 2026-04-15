import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Try photo sessions first
    const { data: photoData, error: photoError } = await supabaseAdmin
      .from("ai_photoshoot_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (photoError) {
      console.error("[ai_photoshoot session GET]", photoError);
      return NextResponse.json({ error: photoError.message }, { status: 500 });
    }

    if (photoData) {
      return NextResponse.json({
        session: { ...photoData, generation_mode: "photo" },
      });
    }

    // If not found in photos, try video sessions
    const { data: videoData, error: videoError } = await supabaseAdmin
      .from("ai_video_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (videoError) {
      console.error("[ai_video_session GET]", videoError);
      return NextResponse.json({ error: videoError.message }, { status: 500 });
    }

    if (videoData) {
      return NextResponse.json({
        session: { ...videoData, generation_mode: "video" },
      });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[ai_photoshoot session GET]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
