import { getAuthUser } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET    — List templates (filter by connectionId)
// POST   — Create template
// PUT    — Update template
// DELETE — Delete template

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    let query = supabaseAdmin
      .from("reply_templates")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: false });

    if (connectionId) {
      query = query.eq("connection_id", connectionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Templates] GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
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
      name,
      keywords,
      replyText,
      aiEnabled,
      aiGuidelines,
      priority,
      isFallback,
      active,
    } = body;

    if (!connectionId || !name) {
      return NextResponse.json(
        { error: "connectionId and name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("reply_templates")
      .insert({
        user_id: userId,
        connection_id: connectionId,
        name,
        keywords: keywords || [],
        reply_text: replyText || null,
        ai_enabled: aiEnabled ?? false,
        ai_guidelines: aiGuidelines || null,
        priority: priority ?? 0,
        is_fallback: isFallback ?? false,
        active: active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("[Templates] POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // Map camelCase to snake_case for DB
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
    if (updates.replyText !== undefined) dbUpdates.reply_text = updates.replyText;
    if (updates.aiEnabled !== undefined) dbUpdates.ai_enabled = updates.aiEnabled;
    if (updates.aiGuidelines !== undefined) dbUpdates.ai_guidelines = updates.aiGuidelines;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.isFallback !== undefined) dbUpdates.is_fallback = updates.isFallback;
    if (updates.active !== undefined) dbUpdates.active = updates.active;

    const { data, error } = await supabaseAdmin
      .from("reply_templates")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[Templates] PUT error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query param is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("reply_templates")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[Templates] DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
