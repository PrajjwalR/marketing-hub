'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Inbox, Loader2, Radio, ArrowDown, ArrowUp, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type Report = {
  range: { start: string; end: string; compareStart: string; compareEnd: string };
  filters: { platform: string | null; messageType: string | null; tag: string | null };
  summary: {
    received: { value: number; change: number };
    actioned: { value: number; change: number };
    actionRate: { value: number; previous: number; change: number };
    avgTimeToActionLabel: string;
    avgTimeChange: number;
  };
  daily: Array<{ date: string; label: string; received: number; actioned: number; actionRate: number }>;
  slaBuckets: Array<{
    key: string;
    label: string;
    count: number;
    pct: number;
    previousCount: number;
    countChangePct: number;
  }>;
  weekdayActionRate: Array<{
    day: string;
    avgActionRate: number;
    avgReceived: number;
    avgActioned: number;
    avgTimeLabel: string;
  }>;
  weekdayTimeToAction: Array<{ day: string; avgTimeLabel: string; avgTimeSec: number }>;
  hourActionRate: Array<{
    hour: number;
    label: string;
    shortLabel: string;
    avgActionRate: number;
    avgTimeLabel: string;
    avgReceived: number;
    avgActioned: number;
  }>;
  hourTimeToAction: Array<{ hour: number; label: string; avgTimeLabel: string }>;
  sentiment: Record<string, number>;
  listeningTrend: Array<{ date: string; positive: number; negative: number; neutral: number; volume: number }>;
  priorityPreview: Array<{
    platform: string;
    message_type: string;
    received_at: string;
    priority_score: number;
    preview: string | null;
  }>;
  sampleSize: number;
};

const TEAL = '#14b8a6';
const PURPLE = '#9333ea';
const SENT_COLORS: Record<string, string> = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#94a3b8',
  unknown: '#cbd5e1',
};

function ChangePill({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-bold',
        up ? 'text-emerald-600' : 'text-red-600'
      )}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

export default function InboxActivityPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultStart = format(subDays(new Date(), 27), 'yyyy-MM-dd');

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(today);
  const [platform, setPlatform] = useState('');
  const [messageType, setMessageType] = useState('');
  const [tag, setTag] = useState('');
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'inbox' | 'listening'>('inbox');

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set('start', start);
    p.set('end', end);
    if (platform) p.set('platform', platform);
    if (messageType) p.set('messageType', messageType);
    if (tag) p.set('tag', tag);
    return p.toString();
  }, [start, end, platform, messageType, tag]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/reports/inbox-activity?${qs}`, {
        credentials: 'include',
      });
      const body = (await res.json().catch(() => ({}))) as Report & { error?: string };
      if (!res.ok) {
        setData(null);
        setLoadError(
          body.error ||
            (res.status === 401
              ? 'You need to be signed in to load this report.'
              : `Request failed (${res.status}).`)
        );
        return;
      }
      setData(body as Report);
    } catch {
      setData(null);
      setLoadError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#/, '');
      if (raw === 'listening') setMainTab('listening');
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const onMainTabChange = (v: string) => {
    const next = v as 'inbox' | 'listening';
    setMainTab(next);
    const path = window.location.pathname + window.location.search;
    if (next === 'listening') {
      window.history.replaceState(null, '', `${path}#listening`);
    } else if (window.location.hash === '#listening') {
      window.history.replaceState(null, '', path);
    }
  };

  const sentimentPie = useMemo(() => {
    if (!data?.sentiment) return [];
    return Object.entries(data.sentiment)
      .filter(([, n]) => n > 0)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="w-full max-w-none animate-in fade-in duration-300 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Inbox className="h-7 w-7 text-violet-600" />
            Inbox Activity
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Activity from {data?.range.start ?? start} – {data?.range.end ?? end}
            {data && (
              <>
                {' '}
                · vs {data.range.compareStart} – {data.range.compareEnd}
              </>
            )}
          </p>
        </div>
        <Link href="/dashboard/conversations">
          <Button variant="outline" className="rounded-xl font-bold">
            Smart Inbox
          </Button>
        </Link>
      </div>

      <Tabs value={mainTab} onValueChange={onMainTabChange} className="w-full">
        <TabsList className="rounded-xl bg-zinc-100 p-1">
          <TabsTrigger value="inbox" className="rounded-lg font-bold data-[state=active]:bg-white">
            Inbox Activity
          </TabsTrigger>
          <TabsTrigger value="listening" className="rounded-lg font-bold data-[state=active]:bg-white">
            <Radio className="h-3.5 w-3.5 mr-1.5" />
            Listening & sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Start</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">End</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Source</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-10 rounded-xl border border-zinc-200 px-3 text-sm font-medium min-w-[140px]"
              >
                <option value="">All platforms</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter / X</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Message type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="h-10 rounded-xl border border-zinc-200 px-3 text-sm font-medium min-w-[140px]"
              >
                <option value="">All types</option>
                <option value="dm">DM</option>
                <option value="comment">Comment</option>
                <option value="mention">Mention</option>
                <option value="review">Review</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Tag contains</label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="vip, urgent…"
                className="h-10 rounded-xl border border-zinc-200 px-3 text-sm w-[140px]"
              />
            </div>
            <Button onClick={() => load()} className="h-10 rounded-xl font-bold gap-2">
              <Filter className="h-4 w-4" />
              Apply
            </Button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center rounded-2xl border border-zinc-200 bg-white gap-2 text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading report…
            </div>
          ) : !data ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-2">
              <p className="font-bold text-zinc-900">Could not load inbox activity</p>
              {loadError ? (
                <p className="text-sm text-zinc-600 max-w-lg mx-auto">{loadError}</p>
              ) : (
                <p className="text-sm text-zinc-500">Unknown error.</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold text-zinc-500">Received messages</div>
                  <div className="text-3xl font-black text-zinc-900 mt-1">{data.summary.received.value}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    vs prev <ChangePill value={data.summary.received.change} />
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold text-zinc-500">Actioned messages</div>
                  <div className="text-3xl font-black text-zinc-900 mt-1">{data.summary.actioned.value}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    vs prev <ChangePill value={data.summary.actioned.change} />
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold text-zinc-500">Action rate</div>
                  <div className="text-3xl font-black text-zinc-900 mt-1">
                    {data.sampleSize === 0 ? '—' : `${data.summary.actionRate.value}%`}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    vs prev <ChangePill value={data.summary.actionRate.change} />
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold text-zinc-500">Avg. time to action</div>
                  <div className="text-3xl font-black text-zinc-900 mt-1">
                    {data.summary.avgTimeToActionLabel}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    vs prev <ChangePill value={data.summary.avgTimeChange} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900">Received and actioned messages</h2>
                <p className="text-xs text-zinc-500 mt-1">Daily volume in your selected range.</p>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }}
                        labelStyle={{ fontWeight: 700 }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="received"
                        name="Received"
                        stroke={TEAL}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="actioned"
                        name="Actioned"
                        stroke={PURPLE}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-zinc-500 text-xs font-bold uppercase">
                        <th className="py-2">Metric</th>
                        <th className="py-2">Current</th>
                        <th className="py-2">% vs prev</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-800">
                      <tr className="border-b border-zinc-50">
                        <td className="py-2 font-medium">Received</td>
                        <td className="py-2">{data.summary.received.value}</td>
                        <td className="py-2">
                          <ChangePill value={data.summary.received.change} />
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-50">
                        <td className="py-2 font-medium">Actioned</td>
                        <td className="py-2">{data.summary.actioned.value}</td>
                        <td className="py-2">
                          <ChangePill value={data.summary.actioned.change} />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Action rate</td>
                        <td className="py-2">{data.sampleSize === 0 ? '—' : `${data.summary.actionRate.value}%`}</td>
                        <td className="py-2">
                          <ChangePill value={data.summary.actionRate.change} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900">Time to action breakdown (SLA-style)</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  How long until a first action for messages received in this period.
                </p>
                <div className="h-[260px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.slaBuckets} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal stroke="#f4f4f5" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={200}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill={TEAL} name="Messages" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-zinc-500 text-xs font-bold uppercase">
                        <th className="py-2">Bucket</th>
                        <th className="py-2">%</th>
                        <th className="py-2">Totals</th>
                        <th className="py-2">Δ vs prev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slaBuckets.map((row) => (
                        <tr key={row.key} className="border-b border-zinc-50">
                          <td className="py-2 font-medium">{row.label}</td>
                          <td className="py-2">{row.pct}%</td>
                          <td className="py-2">{row.count}</td>
                          <td className="py-2">
                            <ChangePill value={row.countChangePct} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-zinc-900">Action rate by day</h2>
                  <p className="text-xs text-zinc-500 mt-1">Average across weeks in range.</p>
                  <div className="h-[260px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.weekdayActionRate}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                        <Tooltip formatter={(v: number) => [`${v}%`, 'Action rate']} />
                        <Line type="monotone" dataKey="avgActionRate" name="Avg action rate" stroke={TEAL} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-zinc-900">Time to action by day</h2>
                  <p className="text-xs text-zinc-500 mt-1">Labels show average latency when actions exist.</p>
                  <div className="h-[260px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.weekdayTimeToAction}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          dataKey="avgTimeSec"
                          tickFormatter={(s) => (s >= 3600 ? `${Math.round(s / 3600)}h` : `${Math.round(s / 60)}m`)}
                        />
                        <Tooltip
                          formatter={(v: number, name) => (name === 'avgTimeSec' ? [formatSec(v), 'Avg seconds'] : [v, name])}
                        />
                        <Line type="monotone" dataKey="avgTimeSec" name="Avg seconds" stroke={PURPLE} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-zinc-900">Action rate by hour (UTC)</h2>
                  <p className="text-xs text-zinc-500 mt-1">When messages arrive — share of actioned vs received.</p>
                  <div className="h-[260px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.hourActionRate}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgActionRate" name="Avg action rate %" stroke={TEAL} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-zinc-900">Time to action by hour (UTC)</h2>
                  <div className="h-[260px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.hourTimeToAction}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgTimeLabel" hide />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    For detailed latency-by-hour, average seconds are computed per bucket in the API; chart uses labels
                    in tooltips when hovering raw rows — upgrade to numeric series in a follow-up.
                  </p>
                </div>
              </div>

              <div id="prioritization" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm scroll-mt-20">
                <h2 className="text-sm font-bold text-zinc-900">Message prioritization</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Highest <code className="bg-zinc-100 px-1 rounded">priority_score</code> in the selected window (from
                  unified inbox). Wire VIP/keyword rules when ingesting from platform APIs.
                </p>
                {data.priorityPreview.length === 0 ? (
                  <p className="text-sm text-zinc-500 mt-4">No messages in range — add rows via{' '}
                    <code className="bg-zinc-100 px-1 rounded">POST /api/inbox/messages</code> or ingestion pipeline.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-zinc-100">
                    {data.priorityPreview.map((m, i) => (
                      <li key={i} className="py-3 flex flex-wrap items-start justify-between gap-2 text-sm">
                        <div>
                          <span className="font-bold text-zinc-800 capitalize">{m.platform}</span>
                          <span className="text-zinc-400 mx-1">·</span>
                          <span className="text-zinc-600">{m.message_type}</span>
                          <div className="text-zinc-500 text-xs mt-0.5">{new Date(m.received_at).toLocaleString()}</div>
                          {m.preview && <div className="text-zinc-700 mt-1 line-clamp-2">{m.preview}</div>}
                        </div>
                        <span className="shrink-0 rounded-full bg-violet-100 text-violet-800 px-2 py-0.5 text-xs font-bold">
                          P{m.priority_score}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="text-xs text-zinc-400">
                Data model: <code className="bg-zinc-100 px-1 rounded">inbox_messages</code>. Connect platform webhooks
                or polling jobs to populate; this report is already normalized across sources.
              </p>
            </>
          )}
        </TabsContent>

        <TabsContent value="listening" className="mt-6 space-y-6">
          {loading ? (
            <div className="h-48 flex items-center justify-center rounded-2xl border bg-white gap-2 text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading…
            </div>
          ) : !data ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-2">
              <p className="font-bold text-zinc-900">Could not load listening data</p>
              {loadError ? (
                <p className="text-sm text-zinc-600 max-w-lg mx-auto">{loadError}</p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Sentiment mix (from inbox labels)
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  v1 uses optional <code className="bg-zinc-100 px-1 rounded">sentiment</code> on each message. Full NLP
                  pipeline can replace this later.
                </p>
                <div className="flex flex-col md:flex-row gap-8 mt-6 items-center justify-center">
                  <div className="h-[220px] w-full max-w-[280px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={sentimentPie.length ? sentimentPie : [{ name: 'no data', value: 1 }]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {(sentimentPie.length ? sentimentPie : [{ name: 'none', value: 1 }]).map((e, i) => (
                            <Cell key={i} fill={SENT_COLORS[e.name.toLowerCase()] || SENT_COLORS.unknown} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-sm text-zinc-600 max-w-md">
                    <p>
                      For <strong>social listening</strong> breadth (keywords, trends, brand volume), add a dedicated
                      listening index and topic monitors — this tab summarizes sentiment attached to inbox rows only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="text-sm font-bold text-zinc-900">Sentiment trend over time</h2>
                <div className="h-[280px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.listeningTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke={SENT_COLORS.positive} name="Positive %" dot={false} />
                      <Line type="monotone" dataKey="neutral" stroke={SENT_COLORS.neutral} name="Neutral %" dot={false} />
                      <Line type="monotone" dataKey="negative" stroke={SENT_COLORS.negative} name="Negative %" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatSec(s: number) {
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}
