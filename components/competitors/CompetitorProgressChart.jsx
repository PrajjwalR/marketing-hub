'use client';

import { useState } from 'react';

const METRICS = [
  { key: 'subscribers', label: 'Subscribers / Followers' },
  { key: 'avgLikes', label: 'Avg Likes' },
  { key: 'avgComments', label: 'Avg Comments' },
  { key: 'reach', label: 'Reach' },
  { key: 'engagementRate', label: 'Engagement Rate', isPercent: true },
];

function formatStat(num, isPercent) {
  if (isPercent) return `${Number(num).toFixed(2)}%`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

export default function CompetitorProgressChart({ data }) {
  const [activeMetric, setActiveMetric] = useState(METRICS[0].key);

  if (!data || data.length === 0) return null;

  const metricDef = METRICS.find(m => m.key === activeMetric);

  // Build per-company aggregate data using live dashboard array
  const companyData = data.map(company => {
    const values = company.accounts.map(acc => acc.stats[activeMetric] || 0);
    const total = values.reduce((a, b) => a + b, 0);
    const value = metricDef.isPercent
      ? (values.length ? total / values.length : 0)
      : total;
    return { ...company, value };
  });

  // Sort descending by value for natural ranking
  const sorted = [...companyData].sort((a, b) => b.value - a.value);
  const max = sorted[0]?.value || 1;
  const industryAvg = sorted.reduce((sum, c) => sum + c.value, 0) / (sorted.length || 1);
  const industryBenchmark = max * 0.85; // hypothetical "best in class" benchmark line

  const avgPct = (industryAvg / max) * 100;
  const benchPct = (industryBenchmark / max) * 100;

  return (
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-[16px] font-extrabold text-[#111827]">Competitor Rankings</h3>
          <p className="text-[13px] text-zinc-500 mt-0.5">See where you stand against each competitor</p>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-1.5">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-full transition-all ${
                activeMetric === m.key
                  ? 'bg-[#2D66C3] text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {/* Benchmark & Average ghost markers (above bars) */}
        <div className="relative mb-3 h-5 ml-[200px] mr-20">
          {/* Industry Avg marker */}
          <div
            className="absolute -top-0 flex flex-col items-center"
            style={{ left: `calc(${avgPct}% - 1px)` }}
          >
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5 whitespace-nowrap">
              Avg
            </span>
            <div className="w-px h-2 bg-zinc-400 mt-0.5" />
          </div>
          {/* Industry Benchmark marker */}
          <div
            className="absolute -top-0 flex flex-col items-center"
            style={{ left: `calc(${benchPct}% - 1px)` }}
          >
            <span className="text-[10px] font-bold text-[#2D66C3] bg-[#EEF4FF] border border-[#2D66C3]/30 rounded px-1.5 py-0.5 whitespace-nowrap">
              Top
            </span>
            <div className="w-px h-2 bg-[#2D66C3] mt-0.5" />
          </div>
        </div>

        {/* Bars */}
        <div className="space-y-3">
          {sorted.map(company => {
            const pct = max > 0 ? (company.value / max) * 100 : 0;
            const isOurs = company.isOurs;
            const isAhead = company.value >= industryAvg;

            return (
              <div key={company.id} className="flex items-center gap-4 group">
                {/* Avatar + Name */}
                <div className="flex items-center gap-2.5 w-[200px] min-w-[200px]">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] text-[12px] font-bold text-white shadow-sm overflow-hidden"
                    style={company.avatarImage ? {} : { backgroundColor: company.avatarColor }}
                  >
                    {company.avatarImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={company.avatarImage} alt={company.name} className="h-full w-full object-cover" />
                    ) : (
                      company.avatarInitials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[13px] font-bold truncate ${isOurs ? 'text-[#1d4e9f]' : 'text-[#111827]'}`}>
                      {company.name}
                    </p>
                    {isOurs && (
                      <span className="text-[10px] font-bold text-[#2D66C3] uppercase tracking-wider">You</span>
                    )}
                  </div>
                </div>

                {/* Bar Track */}
                <div className="flex-1 relative">
                  {/* Ghost grid lines at avg and benchmark */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-zinc-300 z-10 opacity-60"
                    style={{ left: `${avgPct}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-[#2D66C3] z-10 opacity-40"
                    style={{ left: `${benchPct}%` }}
                  />

                  {/* Track background */}
                  <div className="h-7 rounded-none bg-zinc-100 overflow-hidden relative">
                    <div
                      className={`h-full rounded-none transition-all duration-500 ${
                        isOurs
                          ? 'bg-gradient-to-r from-[#2D66C3] to-[#4F86E8]'
                          : isAhead
                          ? 'bg-gradient-to-r from-zinc-300 to-zinc-400'
                          : 'bg-gradient-to-r from-zinc-200 to-zinc-300'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Value */}
                <div className="w-16 text-right">
                  <span className={`text-[13px] font-extrabold ${isOurs ? 'text-[#1d4e9f]' : 'text-zinc-700'}`}>
                    {formatStat(company.value, metricDef.isPercent)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 mt-6 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-2.5 rounded-full bg-gradient-to-r from-zinc-300 to-zinc-400" />
            <span className="text-[12px] font-semibold text-zinc-500">Competitor Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-px h-4 bg-zinc-400" />
            <span className="text-[12px] font-semibold text-zinc-500">Industry Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-px h-4 bg-[#2D66C3]" />
            <span className="text-[12px] font-semibold text-[#2D66C3]">Industry Benchmark (Top)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-2.5 rounded-full bg-gradient-to-r from-[#2D66C3] to-[#4F86E8]" />
            <span className="text-[12px] font-semibold text-[#1d4e9f]">You</span>
          </div>
        </div>
      </div>
    </div>
  );
}
