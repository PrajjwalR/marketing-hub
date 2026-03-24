import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const { id } = await params;

    const body = await req.json();
    const updates: Record<string, string> = {};
    if (typeof body?.name === "string") updates.name = body.name.trim();
    if (typeof body?.color === "string") updates.color = body.color.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("labels")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[LABELS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("labels")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LABELS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
