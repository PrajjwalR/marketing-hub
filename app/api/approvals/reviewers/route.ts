import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("user_id,name,email")
      .neq("user_id", userId)
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("[APPROVAL_REVIEWERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
