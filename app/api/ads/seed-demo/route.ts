import { NextResponse } from "next/server";
import { addDays, format, startOfDay } from "date-fns";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

/**
 * Inserts deterministic demo daily metrics for the last 28 days (two campaigns).
 * Use after linking an ad account so charts populate without real platform APIs.
 */
export async function POST(req: Request) {
  let userId: string;
  try {
    userId = (await getAuthUser(req)).userId;
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    let accountId = body?.accountId as string | undefined;

    if (!accountId) {
      const { data: first, error: aErr } = await supabaseAdmin
        .from("ad_accounts")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
      if (!first) {
        return NextResponse.json(
          { error: "Link an ad account first, then load sample performance." },
          { status: 400 }
        );
      }
      accountId = first.id;
    }

    const { data: acc, error: accErr } = await supabaseAdmin
      .from("ad_accounts")
      .select("id, user_id")
      .eq("id", accountId)
      .eq("user_id", userId)
      .single();

    if (accErr || !acc) {
      return NextResponse.json({ error: "Unknown ad account" }, { status: 400 });
    }

    const campaigns = [
      { external_id: "cmp_spring_push", name: "Spring push — conversions" },
      { external_id: "cmp_brand_reach", name: "Brand reach — awareness" },
    ];

    const end = startOfDay(new Date());
    const rows: Record<string, unknown>[] = [];

    for (let i = 0; i < 28; i++) {
      const day = addDays(end, -i);
      const dateStr = format(day, "yyyy-MM-dd");
      const wave = Math.sin(i / 4) * 0.15 + 1;

      for (let c = 0; c < campaigns.length; c++) {
        const camp = campaigns[c];
        const baseImp = camp.external_id.includes("spring") ? 12000 : 28000;
        const impressions = Math.round(baseImp * wave * (0.9 + (i % 5) * 0.02));
        const ctr = camp.external_id.includes("spring") ? 0.012 : 0.006;
        const clicks = Math.max(1, Math.round(impressions * ctr));
        const cpcCents = camp.external_id.includes("spring") ? 85 : 42;
        const spendCents = clicks * cpcCents + (i % 3) * 50;
        const conversions = camp.external_id.includes("spring")
          ? Math.round(clicks * 0.08 * 100) / 100
          : Math.round(clicks * 0.015 * 100) / 100;

        rows.push({
          user_id: userId,
          ad_account_id: accountId,
          campaign_external_id: camp.external_id,
          campaign_name: camp.name,
          stat_date: dateStr,
          impressions,
          clicks,
          spend_cents: spendCents,
          conversions,
        });
      }
    }

    const { error: upErr } = await supabaseAdmin.from("ad_campaign_daily_metrics").upsert(rows, {
      onConflict: "ad_account_id,campaign_external_id,stat_date",
    });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      insertedOrUpdated: rows.length,
      accountId,
      message: "Demo performance data loaded for the last 28 days.",
    });
  } catch (e) {
    console.error("[AD_SEED_DEMO]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
