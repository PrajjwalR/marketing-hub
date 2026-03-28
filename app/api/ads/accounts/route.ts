import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

const PLATFORMS = ["meta", "google", "linkedin", "tiktok", "other"] as const;

export async function GET(req: Request) {
  let userId: string;
  try {
    userId = (await getAuthUser(req)).userId;
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("ad_accounts")
      .select("id, platform, external_account_id, display_name, currency, timezone, status, created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      const hint = /ad_accounts|schema cache|does not exist/i.test(error.message || "")
        ? " Run the migration: supabase/migrations/20260326_ad_campaign_insights.sql"
        : "";
      return NextResponse.json({ error: `${error.message}${hint}` }, { status: 500 });
    }

    return NextResponse.json({ accounts: data ?? [] });
  } catch (e) {
    console.error("[AD_ACCOUNTS_GET]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = (await getAuthUser(req)).userId;
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const platform = String(body?.platform || "").toLowerCase();
    const displayName = String(body?.displayName || "").trim();
    const externalAccountId = body?.externalAccountId
      ? String(body.externalAccountId).trim()
      : `linked_${Date.now()}`;
    const timezone = String(body?.timezone || "UTC").trim() || "UTC";
    const currency = String(body?.currency || "USD").trim().slice(0, 8) || "USD";

    if (!PLATFORMS.includes(platform as (typeof PLATFORMS)[number])) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }
    if (!displayName) {
      return NextResponse.json({ error: "displayName is required" }, { status: 400 });
    }
    if (!externalAccountId) {
      return NextResponse.json({ error: "externalAccountId is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("ad_accounts")
      .insert({
        user_id: userId,
        platform,
        external_account_id: externalAccountId,
        display_name: displayName,
        currency,
        timezone,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This ad account is already linked for that platform." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ account: data });
  } catch (e) {
    console.error("[AD_ACCOUNTS_POST]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
