import { getAuthUser } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET    — List monitored posts
// POST   — Add post to monitoring
// DELETE — Remove post

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    let query = supabaseAdmin
      .from("monitored_posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (connectionId) query = query.eq("connection_id", connectionId);

    const { data, error } = await query;

    if (error) {
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
    const { connectionId, postId, postText } = body;

    if (!connectionId || !postId) {
      return NextResponse.json(
        { error: "connectionId and postId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("monitored_posts")
      .upsert(
        {
          user_id: userId,
          connection_id: connectionId,
          post_id: postId,
          post_text: postText || null,
          active: true,
        },
        { onConflict: "connection_id,post_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
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
      .from("monitored_posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
