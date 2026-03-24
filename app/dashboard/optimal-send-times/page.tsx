'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock3, Loader2, Info } from 'lucide-react';

type Recommendation = {
  weekday: number;
  hour: number;
  score: number;
  count: number;
  label: string;
  reason?: string;
};

type ApiResponse = {
  timeZone: string;
  platformFilter: string | null;
  sampleSize: number;
  insufficientData: boolean;
  gridMax: number;
  matrix: number[][];
  recommendations: Recommendation[];
  fallbackRecommendations: Recommendation[];
  platformBreakdown: { platform: string; publishedSlots: number }[];
  method: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PLATFORMS = [
  { value: '', label: 'All platforms' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
];

export default function OptimalSendTimesPage() {
  const [tz, setTz] = useState('UTC');
  const [platform, setPlatform] = useState('');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTz(detected);
    } catch {
      /* keep UTC */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set('tz', tz);
      if (platform) q.set('platform', platform);
      const res = await fetch(`/api/analytics/optimal-send-times?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tz, platform]);

  useEffect(() => {
    load();
  }, [load]);

  const matrix = data?.matrix;
  const max = data?.gridMax ?? 1;

  const topRecs = useMemo(() => {
    if (!data) return [];
    return data.insufficientData ? data.fallbackRecommendations : data.recommendations;
  }, [data]);

  return (
    <div className="p-6 space-y-8 max-w-6xl animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Clock3 className="h-7 w-7 text-blue-600" />
            Optimal send times
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-xl">
            Rule-based suggestions from your <strong>published / completed</strong> posts, bucketed by
            weekday and hour in your timezone. Add more published history to personalize; ML can come
            later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500">Timezone</label>
            <input
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-800 w-[220px] bg-white"
              placeholder="e.g. America/Los_Angeles"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 bg-white min-w-[160px]"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value || 'all'} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" className="h-10 rounded-xl font-bold" onClick={() => load()}>
            Apply
          </Button>
          <Link href="/dashboard/calendar">
            <Button className="h-10 rounded-xl font-bold bg-amber-300 text-zinc-900 hover:bg-amber-400 border border-amber-200">
              Open calendar
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center gap-2 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          Analyzing your publish history…
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600">
          Could not load optimal send times.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-zinc-800">
                History sample:{' '}
                <span className="text-blue-600">{data.sampleSize}</span> published slot(s)
              </span>
              <span className="text-xs text-zinc-400">· {data.timeZone}</span>
              {data.insufficientData && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                  <Info className="h-3.5 w-3.5" />
                  Using starter rules until you have at least 5 data points
                </span>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-zinc-700 mb-3">Recommended slots</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {topRecs.map((r, i) => (
                  <li
                    key={`${r.weekday}-${r.hour}-${i}`}
                    className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-zinc-900">{r.label}</div>
                      {!data.insufficientData && (
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Score {r.score.toFixed(2)} · {r.count} post{r.count === 1 ? '' : 's'} in this
                          slot
                        </div>
                      )}
                      {r.reason && (
                        <div className="text-xs text-zinc-500 mt-1">{r.reason}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {matrix && data.sampleSize > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 overflow-x-auto">
              <h2 className="text-sm font-bold text-zinc-700 mb-3">Activity heatmap (published/completed)</h2>
              <p className="text-xs text-zinc-500 mb-3">
                Darker = more posts sent in that weekday + hour ({data.timeZone}).
              </p>
              <div className="min-w-[720px]">
                <div className="flex gap-0.5 mb-1 pl-8">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="w-3 text-[8px] text-zinc-400 text-center flex-1 min-w-0 truncate"
                      title={`${h}:00`}
                    >
                      {h % 6 === 0 ? h : ''}
                    </div>
                  ))}
                </div>
                {DAYS.map((day, d) => (
                  <div key={day} className="flex items-center gap-0.5 mb-0.5">
                    <div className="w-7 shrink-0 text-[10px] font-bold text-zinc-500 text-right pr-1">
                      {day}
                    </div>
                    {HOURS.map((h) => {
                      const c = matrix[d]?.[h] ?? 0;
                      const alpha = c === 0 ? 0.04 : 0.15 + (c / max) * 0.85;
                      return (
                        <div
                          key={h}
                          className="flex-1 min-w-[6px] h-4 rounded-sm bg-blue-600 transition-opacity"
                          style={{ opacity: alpha }}
                          title={`${day} ${h}:00 — ${c} post(s)`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.platformBreakdown.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-sm font-bold text-zinc-700 mb-2">By platform (slot counts)</h2>
              <ul className="flex flex-wrap gap-2">
                {data.platformBreakdown
                  .filter((p) => p.publishedSlots > 0)
                  .sort((a, b) => b.publishedSlots - a.publishedSlots)
                  .map((p) => (
                    <li
                      key={p.platform}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold capitalize text-zinc-700"
                    >
                      {p.platform}: {p.publishedSlots}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-zinc-400">
            Method: <code className="bg-zinc-100 px-1 rounded">{data.method}</code> — neighbor-smoothed
            scores over weekday × hour. Not platform API metrics yet.
          </p>
        </>
      )}
    </div>
  );
}
