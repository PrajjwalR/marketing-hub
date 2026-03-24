import { NextResponse } from "next/server";
import {
  addDays,
  eachDayOfInterval,
  differenceInCalendarDays,
  endOfDay,
  format,
  startOfDay,
} from "date-fns";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

type MetricRow = {
  ad_account_id: string;
  campaign_external_id: string;
  campaign_name: string;
  stat_date: string;
  impressions: number;
  clicks: number;
  spend_cents: number;
  conversions: number;
};

function pctChange(current: number, previous: number): number {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function sumMetrics(rows: MetricRow[]) {
  let impressions = 0;
  let clicks = 0;
  let spendCents = 0;
  let conversions = 0;
  for (const r of rows) {
    impressions += Number(r.impressions) || 0;
    clicks += Number(r.clicks) || 0;
    spendCents += Number(r.spend_cents) || 0;
    conversions += Number(r.conversions) || 0;
  }
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpcCents = clicks > 0 ? spendCents / clicks : 0;
  return { impressions, clicks, spendCents, conversions, ctr, cpcCents };
}

function filterRows(
  rows: MetricRow[],
  startIso: string,
  endIso: string,
  accountId: string | null,
  campaignId: string | null
) {
  return rows.filter((r) => {
    const d = r.stat_date;
    if (d < startIso.slice(0, 10) || d > endIso.slice(0, 10)) return false;
    if (accountId && r.ad_account_id !== accountId) return false;
    if (campaignId && r.campaign_external_id !== campaignId) return false;
    return true;
  });
}

function dailySeries(rows: MetricRow[], start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const label = format(day, "MMM d");
    let impressions = 0;
    let clicks = 0;
    let spendCents = 0;
    let conversions = 0;
    for (const r of rows) {
      if (r.stat_date !== key) continue;
      impressions += Number(r.impressions) || 0;
      clicks += Number(r.clicks) || 0;
      spendCents += Number(r.spend_cents) || 0;
      conversions += Number(r.conversions) || 0;
    }
    const ctr = impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0;
    return {
      date: key,
      label,
      impressions,
      clicks,
      spendCents,
      spendDollars: Math.round((spendCents / 100) * 100) / 100,
      conversions: Math.round(conversions * 100) / 100,
      ctr,
    };
  });
}

function campaignRollup(rows: MetricRow[]) {
  const map = new Map<
    string,
    { campaign_external_id: string; campaign_name: string; impressions: number; clicks: number; spendCents: number; conversions: number }
  >();
  for (const r of rows) {
    const k = r.campaign_external_id;
    const cur = map.get(k) || {
      campaign_external_id: k,
      campaign_name: r.campaign_name,
      impressions: 0,
      clicks: 0,
      spendCents: 0,
      conversions: 0,
    };
    cur.campaign_name = r.campaign_name;
    cur.impressions += Number(r.impressions) || 0;
    cur.clicks += Number(r.clicks) || 0;
    cur.spendCents += Number(r.spend_cents) || 0;
    cur.conversions += Number(r.conversions) || 0;
    map.set(k, cur);
  }
  return [...map.values()]
    .map((c) => ({
      ...c,
      spendDollars: Math.round((c.spendCents / 100) * 100) / 100,
      ctr: c.impressions > 0 ? Math.round((c.clicks / c.impressions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.spendCents - a.spendCents);
}

export async function GET(req: Request) {
  let userId: string;
  try {
    userId = (await getAuthUser(req)).userId;
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId") || null;
    const campaignId = searchParams.get("campaignId") || null;

    const now = new Date();
    let end = endOfDay(now);
    let start = startOfDay(addDays(end, -27));

    const endParam = searchParams.get("end");
    const startParam = searchParams.get("start");
    if (endParam) {
      const e = new Date(endParam + "T23:59:59.999Z");
      if (!Number.isNaN(e.getTime())) end = endOfDay(e);
    }
    if (startParam) {
      const s = new Date(startParam + "T00:00:00.000Z");
      if (!Number.isNaN(s.getTime())) start = startOfDay(s);
    }
    if (start > end) [start, end] = [end, start];

    const daysLen = differenceInCalendarDays(end, start) + 1;
    const compareEnd = addDays(start, -1);
    const compareStart = addDays(compareEnd, -(daysLen - 1));

    const fetchStart = format(compareStart, "yyyy-MM-dd");
    const fetchEnd = format(end, "yyyy-MM-dd");

    const { data: accounts, error: accErr } = await supabaseAdmin
      .from("ad_accounts")
      .select("id, platform, display_name, timezone, currency, status")
      .eq("user_id", userId)
      .eq("status", "active");

    if (accErr) {
      const hint = /ad_accounts|schema cache|does not exist/i.test(accErr.message || "")
        ? " Run the migration: supabase/migrations/20260326_ad_campaign_insights.sql"
        : "";
      return NextResponse.json({ error: `${accErr.message}${hint}` }, { status: 500 });
    }

    const accountList = accounts ?? [];
    if (accountList.length === 0) {
      return NextResponse.json({
        hasAccounts: false,
        accounts: [],
        range: {
          start: format(start, "yyyy-MM-dd"),
          end: format(end, "yyyy-MM-dd"),
          compareStart: format(compareStart, "yyyy-MM-dd"),
          compareEnd: format(compareEnd, "yyyy-MM-dd"),
        },
        filters: { accountId, campaignId },
        summary: null,
        daily: [],
        campaigns: [],
      });
    }

    if (accountId && !accountList.some((a) => a.id === accountId)) {
      return NextResponse.json({ error: "Unknown ad account" }, { status: 400 });
    }

    const { data: raw, error: mErr } = await supabaseAdmin
      .from("ad_campaign_daily_metrics")
      .select(
        "ad_account_id, campaign_external_id, campaign_name, stat_date, impressions, clicks, spend_cents, conversions"
      )
      .eq("user_id", userId)
      .gte("stat_date", fetchStart)
      .lte("stat_date", fetchEnd);

    if (mErr) {
      const hint = /ad_campaign_daily_metrics|schema cache|does not exist/i.test(mErr.message || "")
        ? " Run the migration: supabase/migrations/20260326_ad_campaign_insights.sql"
        : "";
      return NextResponse.json({ error: `${mErr.message}${hint}` }, { status: 500 });
    }

    const allRows = (raw || []) as MetricRow[];
    const curStartIso = startOfDay(start).toISOString();
    const curEndIso = endOfDay(end).toISOString();
    const prevStartIso = startOfDay(compareStart).toISOString();
    const prevEndIso = endOfDay(compareEnd).toISOString();

    const currentRows = filterRows(allRows, curStartIso, curEndIso, accountId, campaignId);
    const previousRows = filterRows(allRows, prevStartIso, prevEndIso, accountId, campaignId);

    const cur = sumMetrics(currentRows);
    const prev = sumMetrics(previousRows);

    const daily = dailySeries(currentRows, start, end);
    const campaigns = campaignRollup(currentRows);

    const optRows = accountId ? allRows.filter((r) => r.ad_account_id === accountId) : allRows;
    const campaignOptions = [...new Map(optRows.map((r) => [r.campaign_external_id, r.campaign_name])).entries()].map(
      ([id, name]) => ({ id, name })
    );

    return NextResponse.json({
      hasAccounts: true,
      accounts: accountList,
      range: {
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
        compareStart: format(compareStart, "yyyy-MM-dd"),
        compareEnd: format(compareEnd, "yyyy-MM-dd"),
      },
      filters: { accountId, campaignId },
      summary: {
        spendDollars: {
          value: Math.round((cur.spendCents / 100) * 100) / 100,
          change: pctChange(cur.spendCents, prev.spendCents),
        },
        impressions: { value: cur.impressions, change: pctChange(cur.impressions, prev.impressions) },
        clicks: { value: cur.clicks, change: pctChange(cur.clicks, prev.clicks) },
        ctr: {
          value: Math.round(cur.ctr * 10) / 10,
          change: pctChange(Math.round(cur.ctr * 10), Math.round(prev.ctr * 10)),
        },
        cpcDollars: {
          value: Math.round((cur.cpcCents / 100) * 100) / 100,
          change: pctChange(Math.round(cur.cpcCents), Math.round(prev.cpcCents)),
        },
        conversions: {
          value: Math.round(cur.conversions * 100) / 100,
          change: pctChange(Math.round(cur.conversions * 100), Math.round(prev.conversions * 100)),
        },
      },
      daily,
      campaigns,
      campaignOptions,
      sampleSize: currentRows.length,
    });
  } catch (e) {
    console.error("[AD_PERFORMANCE_REPORT]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
