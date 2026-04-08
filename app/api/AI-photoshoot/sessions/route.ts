import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

type ImageEntry = { url: string; label: string };

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("ai_photoshoot_sessions")
      .select(
        "id, run_session_id, model_name, model_style, jewelry_type, images, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[ai_photoshoot sessions GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const sessions = (data || []).map((row) => {
      const imgs = Array.isArray(row.images) ? (row.images as ImageEntry[]) : [];
      const preview_url = imgs[0]?.url ?? null;
      return {
        id: row.id,
        run_session_id: row.run_session_id,
        model_name: row.model_name,
        model_style: row.model_style,
        jewelry_type: row.jewelry_type,
        image_count: imgs.length,
        preview_url,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({ sessions });
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
      images,
    } = body as {
      run_session_id?: string;
      model_id?: string;
      model_name?: string;
      model_style?: string;
      jewelry_type?: string;
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
