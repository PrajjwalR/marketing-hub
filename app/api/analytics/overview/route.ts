import { NextResponse } from "next/server";
import { format, subDays } from "date-fns";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

type PostRow = {
  id: string;
  status: string | null;
  type: string | null;
  scheduled_at: string;
  published_at: string | null;
  media_url: string | null;
  description: string | null;
};

function safePercentChange(current: number, previous: number): number {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

function withinRange(iso: string | null | undefined, start: Date, end: Date): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return date >= start && date <= end;
}

function computeMetrics(rows: PostRow[], connectedProfiles: number, start: Date, end: Date) {
  const inRange = rows.filter((row) => withinRange(row.scheduled_at, start, end));
  const totalPosts = inRange.length;
  const publishedRows = inRange.filter((row) => ["published", "completed"].includes((row.status || "").toLowerCase()));
  const publishedPosts = publishedRows.length;
  const withMedia = inRange.filter((row) => !!row.media_url && row.media_url.trim() !== "").length;
  const richCaptionPosts = inRange.filter((row) => (row.description || "").trim().length >= 80).length;

  // Internal-only estimate; replace with platform metrics later.
  const engagementEstimate = Math.round(
    publishedPosts * 16 +
      withMedia * 6 +
      richCaptionPosts * 3 +
      connectedProfiles * 2
  );

  // Internal proxy for responses while platform inbox APIs are pending.
  const responseCount = Math.round(publishedPosts * 0.42 + withMedia * 0.18);

  return {
    totalPosts,
    publishedPosts,
    engagementEstimate,
    responseCount,
  };
}

function buildDailyTrend(rows: PostRow[], start: Date, days: number) {
  const trend = Array.from({ length: days }).map((_, index) => {
    const day = subDays(start, -(index));
    const key = format(day, "yyyy-MM-dd");
    return {
      date: key,
      totalPosts: 0,
      publishedPosts: 0,
    };
  });

  const trendByDate = new Map(trend.map((item) => [item.date, item]));

  for (const row of rows) {
    const scheduledKey = format(new Date(row.scheduled_at), "yyyy-MM-dd");
    const bucket = trendByDate.get(scheduledKey);
    if (!bucket) continue;
    bucket.totalPosts += 1;
    if (["published", "completed"].includes((row.status || "").toLowerCase())) {
      bucket.publishedPosts += 1;
    }
  }

  return trend;
}

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const searchParams = new URL(req.url).searchParams;
    const rangeRaw = Number(searchParams.get("range"));
    const rangeDays = rangeRaw === 30 ? 30 : 7;

    const now = new Date();
    const currentStart = subDays(now, rangeDays - 1);
    const previousEnd = subDays(currentStart, 1);
    const previousStart = subDays(previousEnd, rangeDays - 1);

    const [{ data: posts, error: postsError }, { data: connections, error: connError }] =
      await Promise.all([
        supabaseAdmin
          .from("calendar_events")
          .select("id,status,type,scheduled_at,published_at,media_url,description")
          .eq("user_id", userId)
          .eq("type", "post"),
        supabaseAdmin
          .from("social_connections")
          .select("id,status")
          .eq("user_id", userId),
      ]);

    if (postsError) return NextResponse.json({ error: postsError.message }, { status: 500 });
    if (connError) return NextResponse.json({ error: connError.message }, { status: 500 });

    const connectedProfiles = (connections || []).filter(
      (row: { status?: string | null }) => (row.status || "connected") === "connected"
    ).length;

    const current = computeMetrics((posts || []) as PostRow[], connectedProfiles, currentStart, now);
    const previous = computeMetrics((posts || []) as PostRow[], connectedProfiles, previousStart, previousEnd);
    const trend = buildDailyTrend((posts || []) as PostRow[], currentStart, rangeDays);

    return NextResponse.json({
      rangeDays,
      metrics: {
        totalPosts: {
          value: current.totalPosts,
          change: safePercentChange(current.totalPosts, previous.totalPosts),
        },
        publishedPosts: {
          value: current.publishedPosts,
          change: safePercentChange(current.publishedPosts, previous.publishedPosts),
        },
        engagementEstimate: {
          value: current.engagementEstimate,
          change: safePercentChange(current.engagementEstimate, previous.engagementEstimate),
        },
        responseCount: {
          value: current.responseCount,
          change: safePercentChange(current.responseCount, previous.responseCount),
        },
      },
      meta: {
        connectedProfiles,
      },
      trend,
    });
  } catch (error) {
    console.error("[ANALYTICS_OVERVIEW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
