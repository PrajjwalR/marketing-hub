import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

const WEEKDAY_LONG: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekdayAndHourInZone(iso: string, timeZone: string): { weekday: number; hour: number } | null {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;

    const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" });
    const hourFmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hour12: false,
    });
    const dayStr = dayFmt.format(d);
    const hourPart = hourFmt.formatToParts(d).find((p) => p.type === "hour");
    const hour = hourPart ? parseInt(hourPart.value, 10) : 0;
    const weekday = WEEKDAY_LONG[dayStr];
    if (weekday === undefined || hour < 0 || hour > 23) return null;
    return { weekday, hour };
  } catch {
    return null;
  }
}

function formatSlotLabel(weekday: number, hour: number): string {
  const long = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][weekday];
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${long}, ${h12}:00 ${ampm}`;
}

function matchesPlatform(
  row: { platform: string | null; platforms: unknown },
  filter: string | null
): boolean {
  if (!filter) return true;
  const f = filter.toLowerCase();
  if ((row.platform || "").toLowerCase() === f) return true;
  const plats = row.platforms;
  if (Array.isArray(plats)) {
    return plats.some((p) => typeof p === "string" && p.toLowerCase() === f);
  }
  return false;
}

/** 8-neighbor smoothing on a 7×24 torus (wrap weekday/hour). */
function smoothedScore(grid: number[][]): number[][] {
  const out: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (let dow = 0; dow < 7; dow++) {
    for (let hr = 0; hr < 24; hr++) {
      let s = grid[dow][hr];
      let n = 1;
      const neigh: [number, number][] = [
        [dow - 1, hr],
        [dow + 1, hr],
        [dow, hr - 1],
        [dow, hr + 1],
        [dow - 1, hr - 1],
        [dow - 1, hr + 1],
        [dow + 1, hr - 1],
        [dow + 1, hr + 1],
      ];
      for (const [dw, hr2] of neigh) {
        const wd = ((dw % 7) + 7) % 7;
        const hour = ((hr2 % 24) + 24) % 24;
        s += 0.25 * grid[wd][hour];
        n += 0.25;
      }
      out[dow][hr] = s / n;
    }
  }
  return out;
}

type Row = {
  published_at: string | null;
  scheduled_at: string;
  platform: string | null;
  platforms: unknown;
  status: string | null;
};

const FALLBACK_SLOTS = [
  { weekday: 1, hour: 10, reason: "Common engagement window for B2B (rule-based default)" },
  { weekday: 2, hour: 11, reason: "Mid-week late morning (rule-based default)" },
  { weekday: 3, hour: 14, reason: "Early afternoon visibility (rule-based default)" },
  { weekday: 4, hour: 9, reason: "Thursday morning catch-up (rule-based default)" },
];

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    let timeZone = (searchParams.get("tz") || "UTC").trim();
    const platformFilter = searchParams.get("platform")?.trim().toLowerCase() || null;

    try {
      Intl.DateTimeFormat(undefined, { timeZone }).format(new Date());
    } catch {
      timeZone = "UTC";
    }

    const { data: rows, error } = await supabaseAdmin
      .from("calendar_events")
      .select("published_at, scheduled_at, platform, platforms, status")
      .eq("user_id", userId)
      .eq("type", "post")
      .in("status", ["published", "completed"]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    const platformGrids = new Map<string, number[][]>();

    const bump = (g: number[][], weekday: number, hour: number) => {
      g[weekday][hour] += 1;
    };

    for (const row of (rows || []) as Row[]) {
      if (!matchesPlatform(row, platformFilter)) continue;

      const ts = row.published_at || row.scheduled_at;
      if (!ts) continue;
      const parts = getWeekdayAndHourInZone(ts, timeZone);
      if (!parts) continue;

      bump(grid, parts.weekday, parts.hour);

      const pkey = (row.platform || "").toLowerCase();
      if (pkey) {
        if (!platformGrids.has(pkey)) {
          platformGrids.set(
            pkey,
            Array.from({ length: 7 }, () => Array(24).fill(0))
          );
        }
        bump(platformGrids.get(pkey)!, parts.weekday, parts.hour);
      }
    }

    let sampleSize = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        sampleSize += grid[d][h];
      }
    }

    const scores = smoothedScore(grid);

    type Rec = {
      weekday: number;
      hour: number;
      score: number;
      count: number;
      label: string;
    };

    const candidates: Rec[] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (grid[d][h] > 0) {
          candidates.push({
            weekday: d,
            hour: h,
            score: scores[d][h],
            count: grid[d][h],
            label: formatSlotLabel(d, h),
          });
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score || b.count - a.count);

    const seen = new Set<string>();
    const recommendations: Rec[] = [];
    for (const c of candidates) {
      const key = `${c.weekday}-${c.hour}`;
      if (seen.has(key)) continue;
      seen.add(key);
      recommendations.push(c);
      if (recommendations.length >= 8) break;
    }

    const heatmap = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const c = grid[d][h];
        if (c === 0) continue;
        heatmap.push({
          weekday: d,
          weekdayLabel: WEEKDAY_NAMES[d],
          hour: h,
          count: c,
        });
      }
    }

    const insufficientData = sampleSize < 5;

    const fallbackRecommendations = FALLBACK_SLOTS.map((slot) => ({
      weekday: slot.weekday,
      hour: slot.hour,
      score: 0,
      count: 0,
      label: formatSlotLabel(slot.weekday, slot.hour),
      reason: slot.reason,
    }));

    const platformBreakdown = Array.from(platformGrids.entries()).map(([platform, g]) => {
      let total = 0;
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) total += g[d][h];
      }
      return { platform, publishedSlots: total };
    });

    return NextResponse.json({
      timeZone,
      platformFilter,
      sampleSize,
      insufficientData,
      gridMax: Math.max(1, ...grid.flat()),
      matrix: grid,
      heatmap,
      recommendations: insufficientData ? [] : recommendations,
      fallbackRecommendations: insufficientData ? fallbackRecommendations : [],
      platformBreakdown,
      method: "rule_based_history_v1",
    });
  } catch (e) {
    console.error("[OPTIMAL_SEND_TIMES_GET]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
