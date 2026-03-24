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
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Megaphone, Loader2, ArrowDown, ArrowUp, Filter, Calculator, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Account = {
  id: string;
  platform: string;
  display_name: string;
  timezone: string;
  currency: string;
};

type Report = {
  hasAccounts: boolean;
  accounts: Account[];
  range: { start: string; end: string; compareStart: string; compareEnd: string };
  filters: { accountId: string | null; campaignId: string | null };
  summary: {
    spendDollars: { value: number; change: number };
    impressions: { value: number; change: number };
    clicks: { value: number; change: number };
    ctr: { value: number; change: number };
    cpcDollars: { value: number; change: number };
    conversions: { value: number; change: number };
  } | null;
  daily: Array<{
    date: string;
    label: string;
    impressions: number;
    clicks: number;
    spendCents: number;
    spendDollars: number;
    conversions: number;
    ctr: number;
  }>;
  campaigns: Array<{
    campaign_external_id: string;
    campaign_name: string;
    impressions: number;
    clicks: number;
    spendCents: number;
    spendDollars: number;
    ctr: number;
    conversions: number;
  }>;
  campaignOptions: Array<{ id: string; name: string }>;
  sampleSize: number;
};

const TEAL = '#14b8a6';
const ROSE = '#f43f5e';

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

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

export default function AdInsightsPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultStart = format(subDays(new Date(), 27), 'yyyy-MM-dd');

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(today);
  const [accountId, setAccountId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState('meta');
  const [connectName, setConnectName] = useState('');
  const [connectBusy, setConnectBusy] = useState(false);
  const [seedBusy, setSeedBusy] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set('start', start);
    p.set('end', end);
    if (accountId) p.set('accountId', accountId);
    if (campaignId) p.set('campaignId', campaignId);
    return p.toString();
  }, [start, end, accountId, campaignId]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/reports/ad-performance?${qs}`, { credentials: 'include' });
      const body = (await res.json().catch(() => ({}))) as Report & { error?: string };
      if (!res.ok) {
        setData(null);
        setLoadError(body.error || `Request failed (${res.status})`);
        return;
      }
      setData(body as Report);
    } catch {
      setData(null);
      setLoadError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => {
    load();
  }, [load]);

  const activeTz = useMemo(() => {
    if (!data?.hasAccounts || !accountId) return data?.accounts[0]?.timezone || 'UTC';
    const a = data.accounts.find((x) => x.id === accountId);
    return a?.timezone || 'UTC';
  }, [data, accountId]);

  const hasSpend = useMemo(() => {
    if (!data?.summary) return false;
    return (
      data.summary.spendDollars.value > 0 ||
      data.summary.impressions.value > 0 ||
      data.sampleSize > 0
    );
  }, [data]);

  async function submitConnect(e: React.FormEvent) {
    e.preventDefault();
    const name = connectName.trim() || 'My ad account';
    setConnectBusy(true);
    try {
      const res = await fetch('/api/ads/accounts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: connectPlatform,
          displayName: name,
          externalAccountId: `manual_${connectPlatform}_${Date.now()}`,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.error || 'Could not link account');
        return;
      }
      setConnectOpen(false);
      setConnectName('');
      await load();
    } finally {
      setConnectBusy(false);
    }
  }

  async function quickDemo() {
    setConnectBusy(true);
    try {
      const ext = `demo_sprout_${Date.now()}`;
      const accRes = await fetch('/api/ads/accounts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'meta',
          displayName: 'Demo — Meta Ads',
          externalAccountId: ext,
          timezone: 'America/New_York',
        }),
      });
      const accJson = await accRes.json().catch(() => ({}));
      if (!accRes.ok && accRes.status !== 409) {
        alert(accJson.error || 'Could not create demo account');
        return;
      }
      // 409 = already linked same external id; still allow seeding first active account
      const seedRes = await fetch('/api/ads/seed-demo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const seedJson = await seedRes.json().catch(() => ({}));
      if (!seedRes.ok) {
        alert(seedJson.error || 'Could not load sample data');
        return;
      }
      await load();
    } finally {
      setConnectBusy(false);
    }
  }

  async function loadSampleForAccount() {
    const id = accountId || data?.accounts[0]?.id;
    if (!id) return;
    setSeedBusy(true);
    try {
      const res = await fetch('/api/ads/seed-demo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.error || 'Failed');
        return;
      }
      await load();
    } finally {
      setSeedBusy(false);
    }
  }

  return (
    <div className="w-full max-w-none animate-in fade-in duration-300 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 flex-wrap">
            <Megaphone className="h-7 w-7 text-pink-500" />
            Paid performance
            <Sparkles className="h-5 w-5 text-amber-400" aria-hidden />
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Report uses the ad account time zone ({activeTz}).{' '}
            {data && (
              <>
                Range {data.range.start} – {data.range.end} · vs {data.range.compareStart} –{' '}
                {data.range.compareEnd}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/settings">
            <Button variant="outline" className="rounded-xl font-bold">
              Integrations
            </Button>
          </Link>
        </div>
      </div>

      {!loading && loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center rounded-2xl border border-zinc-200 bg-white gap-2 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading…
        </div>
      ) : data && !data.hasAccounts ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 flex flex-col items-center text-center max-w-lg mx-auto shadow-sm">
          <div className="rounded-full bg-zinc-100 p-6 mb-6">
            <Calculator className="h-14 w-14 text-zinc-400" strokeWidth={1.25} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">No ad accounts found</h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm">
            It looks like you haven&apos;t connected an ad account yet. Link one to pull spend and performance, or try a
            demo dataset.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
            <Button
              className="rounded-xl font-bold bg-[#205BC3] hover:bg-[#205BC3]/90"
              onClick={() => setConnectOpen(true)}
            >
              Connect an ad account
            </Button>
            <Button variant="outline" className="rounded-xl font-bold" onClick={quickDemo} disabled={connectBusy}>
              {connectBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Try demo data'}
            </Button>
          </div>
          <a
            href="https://developers.facebook.com/docs/marketing-apis"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#205BC3] font-semibold mt-6 hover:underline"
          >
            Learn more about ad APIs
          </a>
        </div>
      ) : data ? (
        <>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
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
              <div className="flex flex-col gap-1 min-w-[200px]">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Ad accounts & campaigns</label>
                <select
                  value={accountId}
                  onChange={(e) => {
                    setAccountId(e.target.value);
                    setCampaignId('');
                  }}
                  className="h-10 rounded-xl border border-zinc-200 px-3 text-sm font-medium w-full"
                >
                  <option value="">Viewing all accounts</option>
                  {data.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.display_name} ({a.platform})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[200px]">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Campaign</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="h-10 rounded-xl border border-zinc-200 px-3 text-sm font-medium w-full"
                >
                  <option value="">All campaigns</option>
                  {data.campaignOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={() => load()} className="h-10 rounded-xl font-bold gap-2">
                <Filter className="h-4 w-4" />
                Apply
              </Button>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-500">
              <span>
                {accountId || campaignId ? 'Filtered view' : 'Viewing all'} ·{' '}
                <button type="button" className="text-[#205BC3] font-bold hover:underline" onClick={() => { setAccountId(''); setCampaignId(''); }}>
                  Clear all
                </button>
              </span>
              <button
                type="button"
                className="text-[#205BC3] font-bold hover:underline"
                onClick={() => setConnectOpen(true)}
              >
                + Link another account
              </button>
            </div>
          </div>

          {!hasSpend ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
              <p className="text-sm font-bold text-zinc-800">No performance in this date range</p>
              <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
                Linked accounts have no daily metrics yet. Real spend comes from Meta / Google / LinkedIn APIs (OAuth +
                sync jobs). For now you can load deterministic sample rows to preview the report.
              </p>
              <Button className="mt-6 rounded-xl font-bold" onClick={loadSampleForAccount} disabled={seedBusy}>
                {seedBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load sample performance'}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  { label: 'Spend', key: 'spendDollars' as const, format: (v: number) => fmtUsd(v) },
                  { label: 'Impressions', key: 'impressions' as const, format: (v: number) => v.toLocaleString() },
                  { label: 'Clicks', key: 'clicks' as const, format: (v: number) => v.toLocaleString() },
                  { label: 'CTR', key: 'ctr' as const, format: (v: number) => `${v}%` },
                  { label: 'Avg CPC', key: 'cpcDollars' as const, format: (v: number) => fmtUsd(v) },
                  { label: 'Conversions', key: 'conversions' as const, format: (v: number) => String(v) },
                ].map((card) => {
                  const s = data.summary!;
                  const block = s[card.key];
                  return (
                    <div key={card.key} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-bold uppercase text-zinc-500">{card.label}</div>
                      <div className="text-2xl font-black text-zinc-900 mt-1 tabular-nums">
                        {card.format(block.value)}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        vs prior <ChangePill value={block.change} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900">Spend & volume</h2>
                <p className="text-xs text-zinc-500 mt-1">Daily spend (USD) and impressions across the selected window.</p>
                <div className="h-[320px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name === 'spendDollars' ? fmtUsd(value) : value.toLocaleString()
                        }
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="spendDollars" name="Spend" stroke={TEAL} dot={false} strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="impressions" name="Impressions" stroke={ROSE} dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900">Campaign breakdown</h2>
                <p className="text-xs text-zinc-500 mt-1">Normalized metrics across linked accounts (same schema for every platform).</p>
                {data.campaigns.length === 0 ? (
                  <p className="text-sm text-zinc-500 mt-8 text-center py-12">No campaign rows in this range.</p>
                ) : (
                  <div className="h-[280px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.campaigns} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal />
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="campaign_name" width={160} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => fmtUsd(v)} />
                        <Bar dataKey="spendDollars" name="Spend" fill={TEAL} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : null}

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link ad account</DialogTitle>
            <DialogDescription>
              v1 stores the account record in your workspace. OAuth to Meta Ads, Google Ads, or LinkedIn Campaign Manager
              can attach tokens later and sync spend automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitConnect} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Platform</label>
              <select
                value={connectPlatform}
                onChange={(e) => setConnectPlatform(e.target.value)}
                className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm"
              >
                <option value="meta">Meta (Facebook / Instagram)</option>
                <option value="google">Google Ads</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Display name</label>
              <input
                value={connectName}
                onChange={(e) => setConnectName(e.target.value)}
                placeholder="e.g. ACME — US prospecting"
                className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setConnectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl font-bold" disabled={connectBusy}>
                {connectBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
