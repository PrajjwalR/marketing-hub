import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("labels")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("[LABELS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const name = (body?.name || "").trim();
    const color = (body?.color || "#6366F1").trim();

    if (!name) {
      return NextResponse.json({ error: "Label name is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("labels")
      .insert({
        user_id: userId,
        name,
        color,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[LABELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
