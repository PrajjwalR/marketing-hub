import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

type ImageEntry = { url: string; label: string };

type PhotoSessionRow = {
  id: string;
  run_session_id: string | null;
  model_name: string | null;
  model_style: string | null;
  jewelry_type: string | null;
  images: unknown;
  created_at: string;
};

type VideoSessionRow = {
  id: string;
  run_session_id: string | null;
  model_name: string | null;
  model_style: string | null;
  jewelry_type: string | null;
  video_url: string | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch photo sessions
    const { data: photoData, error: photoError } = await supabaseAdmin
      .from("ai_photoshoot_sessions")
      .select(
        "id, run_session_id, model_name, model_style, jewelry_type, images, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (photoError) {
      console.error("[ai_photoshoot sessions GET - photos]", photoError);
      return NextResponse.json({ error: photoError.message }, { status: 500 });
    }

    const sessions = ((photoData ?? []) as PhotoSessionRow[]).map((row) => {
      const imgs = Array.isArray(row.images) ? (row.images as ImageEntry[]) : [];
      const preview_url = imgs[0]?.url ?? null;
      return {
        id: row.id,
        run_session_id: row.run_session_id,
        model_name: row.model_name,
        model_style: row.model_style,
        jewelry_type: row.jewelry_type,
        generation_mode: "photo" as const,
        image_count: imgs.length,
        images: imgs,
        preview_url,
        video_url: null as string | null,
        created_at: row.created_at,
      };
    });

    // Fetch video sessions
    const { data: videoData, error: videoError } = await supabaseAdmin
      .from("ai_video_sessions")
      .select(
        "id, run_session_id, model_name, model_style, jewelry_type, video_url, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (videoError) {
      console.error("[ai_photoshoot sessions GET - videos]", videoError);
      // Non-fatal: return photos even if video table doesn't exist yet
    }

    const videoSessions = ((videoData ?? []) as VideoSessionRow[]).map((row) => ({
      id: row.id,
      run_session_id: row.run_session_id,
      model_name: row.model_name,
      model_style: row.model_style,
      jewelry_type: row.jewelry_type,
      generation_mode: "video" as const,
      image_count: 0,
      images: [] as ImageEntry[],
      preview_url: null as string | null,
      video_url: row.video_url,
      created_at: row.created_at,
    }));

    // Merge and sort by created_at descending
    const allSessions = [...sessions, ...videoSessions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ sessions: allSessions });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[ai_photoshoot sessions GET]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      run_session_id,
      model_id,
      model_name,
      model_style,
      jewelry_type,
      generation_mode,
      video_url,
      images,
    } = body as {
      run_session_id?: string;
      model_id?: string;
      model_name?: string;
      model_style?: string;
      jewelry_type?: string;
      generation_mode?: string;
      video_url?: string | null;
      images?: unknown;
    };

    if (!run_session_id || typeof run_session_id !== "string") {
      return NextResponse.json(
        { error: "run_session_id is required" },
        { status: 400 }
      );
    }
    if (!jewelry_type || typeof jewelry_type !== "string") {
      return NextResponse.json(
        { error: "jewelry_type is required" },
        { status: 400 }
      );
    }

    // ─── VIDEO SESSION ──────────────────────────────────────────────────
    if (generation_mode === "video") {
      const { data, error } = await supabaseAdmin
        .from("ai_video_sessions")
        .insert({
          user_id: userId,
          run_session_id: run_session_id.slice(0, 64),
          model_id: model_id ?? null,
          model_name: model_name ?? null,
          model_style: model_style ?? null,
          jewelry_type,
          video_url: video_url ?? null,
        })
        .select("id")
        .single();

      if (error) {
        console.error("[ai_video_sessions POST]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ id: data.id });
    }

    // ─── PHOTO SESSION (existing logic) ─────────────────────────────────
    let normalized: ImageEntry[] = [];
    if (Array.isArray(images)) {
      normalized = images.map((item: unknown) => {
        if (typeof item === "string") {
          return { url: item, label: "Result" };
        }
        if (
          item &&
          typeof item === "object" &&
          "url" in item &&
          typeof (item as { url: string }).url === "string"
        ) {
          const o = item as { url: string; label?: string };
          return { url: o.url, label: o.label || "Variation" };
        }
        return { url: "", label: "?" };
      }).filter((x) => x.url);
    }

    const { data, error } = await supabaseAdmin
      .from("ai_photoshoot_sessions")
      .insert({
        user_id: userId,
        run_session_id: run_session_id.slice(0, 64),
        model_id: model_id ?? null,
        model_name: model_name ?? null,
        model_style: model_style ?? null,
        jewelry_type,
        images: normalized,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[ai_photoshoot sessions POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[ai_photoshoot sessions POST]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
