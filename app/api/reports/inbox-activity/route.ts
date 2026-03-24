import { NextResponse } from "next/server";
import {
  eachDayOfInterval,
  format,
  startOfDay,
  endOfDay,
  differenceInCalendarDays,
  addDays,
} from "date-fns";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

type Row = {
  platform: string;
  message_type: string;
  received_at: string;
  actioned_at: string | null;
  tags: string[] | null;
  priority_score: number | null;
  sentiment: string | null;
  body_preview: string | null;
};

function pctChange(current: number, previous: number): number {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function secondsBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  return Math.max(0, (b - a) / 1000);
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const SLA_LABELS = [
  { key: "0_30m", label: "0–30 minutes", maxSec: 30 * 60 },
  { key: "30_60m", label: "30 minutes–1 hour", maxSec: 60 * 60 },
  { key: "1_8h", label: "1–8 hours", maxSec: 8 * 60 * 60 },
  { key: "8_24h", label: "8–24 hours", maxSec: 24 * 60 * 60 },
  { key: "gt24h", label: "Greater than 24 hours", maxSec: Infinity },
] as const;

function bucketSla(seconds: number): string {
  if (seconds <= 30 * 60) return "0_30m";
  if (seconds <= 60 * 60) return "30_60m";
  if (seconds <= 8 * 60 * 60) return "1_8h";
  if (seconds <= 24 * 60 * 60) return "8_24h";
  return "gt24h";
}

function filterRows(rows: Row[], platform: string | null, messageType: string | null, tag: string | null): Row[] {
  return rows.filter((r) => {
    if (platform && r.platform.toLowerCase() !== platform.toLowerCase()) return false;
    if (messageType && r.message_type.toLowerCase() !== messageType.toLowerCase()) return false;
    if (tag && !(r.tags || []).map((t) => t.toLowerCase()).includes(tag.toLowerCase())) return false;
    return true;
  });
}

function aggregatePeriod(rows: Row[]) {
  const received = rows.length;
  const withAction = rows.filter((r) => r.actioned_at);
  const actioned = withAction.length;
  const actionRate = received === 0 ? 0 : actioned / received;

  const latencies = withAction.map((r) => secondsBetween(r.received_at, r.actioned_at!));
  const avgSec =
    latencies.length === 0 ? 0 : latencies.reduce((a, b) => a + b, 0) / latencies.length;

  const slaCounts: Record<string, number> = {
    "0_30m": 0,
    "30_60m": 0,
    "1_8h": 0,
    "8_24h": 0,
    gt24h: 0,
    no_action: 0,
  };

  for (const r of rows) {
    if (!r.actioned_at) {
      slaCounts.no_action += 1;
      continue;
    }
    const sec = secondsBetween(r.received_at, r.actioned_at);
    slaCounts[bucketSla(sec)] += 1;
  }

  return { received, actioned, actionRate, avgSec, slaCounts };
}

function dailySeries(rows: Row[], start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const label = format(day, "MMM d");
    const dayStart = startOfDay(day).toISOString();
    const dayEnd = endOfDay(day).toISOString();
    let rec = 0;
    let act = 0;
    for (const r of rows) {
      const t = r.received_at;
      if (t >= dayStart && t <= dayEnd) {
        rec += 1;
        if (r.actioned_at) act += 1;
      }
    }
    const rate = rec === 0 ? 0 : act / rec;
    return { date: key, label, received: rec, actioned: act, actionRate: rate };
  });
}

function byWeekday(rows: Row[]) {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = names.map((name) => ({
    day: name,
    received: 0,
    actioned: 0,
    actionRate: 0,
    avgTimeSec: 0 as number,
    avgTimeLabel: "—" as string,
    latencySum: 0,
    latencyCount: 0,
  }));

  for (const r of rows) {
    const d = new Date(r.received_at);
    const wd = d.getUTCDay();
    buckets[wd].received += 1;
    if (r.actioned_at) {
      buckets[wd].actioned += 1;
      buckets[wd].latencySum += secondsBetween(r.received_at, r.actioned_at);
      buckets[wd].latencyCount += 1;
    }
  }

  for (const b of buckets) {
    b.actionRate = b.received === 0 ? 0 : b.actioned / b.received;
    if (b.latencyCount > 0) {
      b.avgTimeSec = b.latencySum / b.latencyCount;
      b.avgTimeLabel = formatDuration(b.avgTimeSec);
    }
  }

  return buckets;
}

function byHour(rows: Row[]) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: h % 12 === 0 ? `${h === 0 ? 12 : 12} ${h < 12 ? "am" : "pm"}` : `${h % 12} ${h < 12 ? "am" : "pm"}`,
    received: 0,
    actioned: 0,
    actionRate: 0,
    avgTimeSec: 0,
    avgTimeLabel: "—" as string,
    latencySum: 0,
    latencyCount: 0,
  }));

  for (const r of rows) {
    const d = new Date(r.received_at);
    const h = d.getUTCHours();
    hours[h].received += 1;
    if (r.actioned_at) {
      hours[h].actioned += 1;
      hours[h].latencySum += secondsBetween(r.received_at, r.actioned_at);
      hours[h].latencyCount += 1;
    }
  }

  for (const b of hours) {
    b.actionRate = b.received === 0 ? 0 : b.actioned / b.received;
    if (b.latencyCount > 0) {
      b.avgTimeSec = b.latencySum / b.latencyCount;
      b.avgTimeLabel = formatDuration(b.avgTimeSec);
    }
  }

  return hours;
}

function sentimentTrend(rows: Row[], start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => {
    const dayStart = startOfDay(day).toISOString();
    const dayEnd = endOfDay(day).toISOString();
    let pos = 0,
      neg = 0,
      neu = 0,
      unk = 0;
    for (const r of rows) {
      if (r.received_at < dayStart || r.received_at > dayEnd) continue;
      const s = (r.sentiment || "").toLowerCase();
      if (s === "positive") pos += 1;
      else if (s === "negative") neg += 1;
      else if (s === "neutral") neu += 1;
      else unk += 1;
    }
    const total = pos + neg + neu + unk;
    return {
      date: format(day, "MMM d"),
      positive: total ? Math.round((pos / total) * 100) : 0,
      negative: total ? Math.round((neg / total) * 100) : 0,
      neutral: total ? Math.round((neu / total) * 100) : 0,
      volume: total,
    };
  });
}

export async function GET(req: Request) {
  let userId: string;
  try {
    const u = await getAuthUser(req);
    userId = u.userId;
  } catch {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || null;
    const messageType = searchParams.get("messageType") || null;
    const tag = searchParams.get("tag") || null;

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

    const fetchStart = startOfDay(compareStart).toISOString();
    const fetchEnd = endOfDay(end).toISOString();

    const { data: raw, error } = await supabaseAdmin
      .from("inbox_messages")
      .select(
        "platform,message_type,received_at,actioned_at,tags,priority_score,sentiment,body_preview"
      )
      .eq("user_id", userId)
      .gte("received_at", fetchStart)
      .lte("received_at", fetchEnd);

    if (error) {
      const hint =
        /inbox_messages|schema cache|does not exist/i.test(error.message || "")
          ? " Run the migration: supabase/migrations/20260325_inbox_messages.sql"
          : "";
      return NextResponse.json(
        { error: `${error.message || "Database error"}${hint}` },
        { status: 500 }
      );
    }

    const allRows = (raw || []) as Row[];
    const filtered = filterRows(allRows, platform, messageType, tag);

    const curStartIso = startOfDay(start).toISOString();
    const curEndIso = endOfDay(end).toISOString();
    const prevStartIso = startOfDay(compareStart).toISOString();
    const prevEndIso = endOfDay(compareEnd).toISOString();

    const currentRows = filtered.filter(
      (r) => r.received_at >= curStartIso && r.received_at <= curEndIso
    );
    const previousRows = filtered.filter(
      (r) => r.received_at >= prevStartIso && r.received_at <= prevEndIso
    );

    const cur = aggregatePeriod(currentRows);
    const prev = aggregatePeriod(previousRows);

    const actionRatePctCur = Math.round(cur.actionRate * 1000) / 10;
    const actionRatePctPrev = Math.round(prev.actionRate * 1000) / 10;

    const daily = dailySeries(currentRows, start, end);

    const slaRows: Array<{ key: string; label: string; count: number; pct: number }> = [
      ...SLA_LABELS.map((def) => ({
        key: def.key,
        label: def.label,
        count: cur.slaCounts[def.key],
        pct: cur.received === 0 ? 0 : Math.round((cur.slaCounts[def.key] / cur.received) * 1000) / 10,
      })),
      {
        key: "no_action",
        label: "No inbox actions taken",
        count: cur.slaCounts.no_action,
        pct: cur.received === 0 ? 0 : Math.round((cur.slaCounts.no_action / cur.received) * 1000) / 10,
      },
    ];

    const prevSla = aggregatePeriod(previousRows).slaCounts;
    const slaWithChange = slaRows.map((row) => {
      const prevCount = prevSla[row.key as keyof typeof prevSla] ?? 0;
      return {
        ...row,
        previousCount: prevCount,
        countChangePct: pctChange(row.count, prevCount),
      };
    });

    const weekday = byWeekday(currentRows);
    const hourReceived = byHour(currentRows).map((h) => ({
      hour: h.hour,
      label: `${h.hour}:00`,
      shortLabel: h.hour % 4 === 0 ? `${h.hour}` : "",
      avgActionRate: Math.round(h.actionRate * 1000) / 10,
      avgTimeLabel: h.avgTimeLabel,
      avgReceived: h.received,
      avgActioned: h.actioned,
    }));

    const sentimentCounts: Record<string, number> = {};
    for (const r of currentRows) {
      const s = (r.sentiment || "unknown").toLowerCase();
      sentimentCounts[s] = (sentimentCounts[s] || 0) + 1;
    }

    const priorityPreview = [...currentRows]
      .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
      .slice(0, 15)
      .map((r) => ({
        platform: r.platform,
        message_type: r.message_type,
        received_at: r.received_at,
        priority_score: r.priority_score ?? 0,
        preview: r.body_preview,
      }));

    const listeningTrend = sentimentTrend(currentRows, start, end);

    return NextResponse.json({
      range: {
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
        compareStart: format(compareStart, "yyyy-MM-dd"),
        compareEnd: format(compareEnd, "yyyy-MM-dd"),
      },
      filters: { platform, messageType, tag },
      summary: {
        received: {
          value: cur.received,
          change: pctChange(cur.received, prev.received),
        },
        actioned: {
          value: cur.actioned,
          change: pctChange(cur.actioned, prev.actioned),
        },
        actionRate: {
          value: actionRatePctCur,
          previous: actionRatePctPrev,
          change: pctChange(Math.round(cur.actionRate * 100), Math.round(prev.actionRate * 100)),
        },
        avgTimeToActionSec: cur.avgSec,
        avgTimeToActionLabel: cur.avgSec === 0 ? "0s" : formatDuration(cur.avgSec),
        avgTimeChange: pctChange(Math.round(cur.avgSec), Math.round(prev.avgSec)),
      },
      daily,
      slaBuckets: slaWithChange,
      weekdayActionRate: weekday.map((w) => ({
        day: w.day,
        avgActionRate: Math.round(w.actionRate * 1000) / 10,
        avgReceived: w.received,
        avgActioned: w.actioned,
        avgTimeLabel: w.avgTimeLabel,
      })),
      weekdayTimeToAction: weekday.map((w) => ({
        day: w.day,
        avgTimeLabel: w.avgTimeLabel,
        avgTimeSec: w.latencyCount > 0 ? w.avgTimeSec : 0,
      })),
      hourActionRate: hourReceived,
      hourTimeToAction: byHour(currentRows).map((h) => ({
        hour: h.hour,
        label: `${h.hour}:00`,
        avgTimeLabel: h.avgTimeLabel,
      })),
      sentiment: sentimentCounts,
      listeningTrend,
      priorityPreview,
      sampleSize: currentRows.length,
    });
  } catch (e) {
    console.error("[INBOX_ACTIVITY_REPORT]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
