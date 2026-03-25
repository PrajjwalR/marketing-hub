'use client';

import { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { competitorsMockData } from '@/data/competitorsMockData';
import EngagementChart from '@/components/competitors/EngagementChart';
import InsightsPanel from '@/components/competitors/InsightsPanel';

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  YouTube: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  Facebook: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  Instagram: { bg: 'bg-pink-50', text: 'text-pink-500', border: 'border-pink-200' },
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col rounded-[5px] border border-[#E5E7EB] bg-white p-5">
      <div className="text-2xl font-extrabold text-[#111827]">{value}</div>
      <div className="mt-1 text-[13px] text-zinc-500 font-medium">{label}</div>
    </div>
  );
}

type SortKey = 'date' | 'likes';

export default function CompetitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const competitor = competitorsMockData.find((c) => c.id === id);
  const [sortKey, setSortKey] = useState<SortKey>('date');

  const sortedContent = useMemo(() => {
    if (!competitor) return [];
    return [...competitor.recentContent].sort((a, b) => {
      if (sortKey === 'likes') return b.likes - a.likes;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [competitor, sortKey]);

  if (!competitor) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BarChart2 className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-lg font-bold text-[#111827]">Competitor not found</h2>
        <p className="text-sm text-zinc-500 mt-1 mb-5">This competitor doesn't exist or was removed.</p>
        <Link href="/dashboard/competitors" className="text-[#2D66C3] font-semibold text-sm hover:underline">
          ← Back to Competitor Analysis
        </Link>
      </div>
    );
  }

  const { name, platform, category, avatarInitials, avatarColor, stats, recentContent } = competitor;
  const platformStyle = PLATFORM_COLORS[platform] || PLATFORM_COLORS.YouTube;
  const topPostIndex = [...recentContent]
    .map((p, i) => ({ i, score: p.likes + p.comments }))
    .sort((a, b) => b.score - a.score)[0]?.i ?? -1;

  return (
    <div className="w-full space-y-4">
      {/* Sticky header */}
      <header className="font-sans sticky top-0 z-30 -mx-3 mb-2 flex flex-wrap items-center gap-4 border-b border-zinc-200/90 bg-[#F4F5F7] px-3 py-3.5 sm:-mx-4 sm:px-4">
        <Link
          href="/dashboard/competitors"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[13px] font-bold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[16px] font-bold text-[#111827] truncate">{name}</h1>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${platformStyle.bg} ${platformStyle.text} ${platformStyle.border}`}>
                {platform}
              </span>
              {category.map((tag: string) => (
                <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Posts" value={stats.totalPosts} />
        <StatCard label="Avg Likes / Post" value={stats.avgLikes.toLocaleString()} />
        <StatCard label="Avg Comments / Post" value={stats.avgComments.toLocaleString()} />
        <StatCard label="Posting Frequency" value={stats.postingFrequency} />
      </div>

      {/* Engagement chart */}
      <EngagementChart data={recentContent} />

      {/* Recent Content Table */}
      <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[15px] font-bold text-[#111827]">Recent Content</h3>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-zinc-500 font-medium">Sort by:</span>
            <button
              onClick={() => setSortKey('date')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${sortKey === 'date' ? 'bg-[#EFF6FF] text-[#2D66C3]' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Date
            </button>
            <button
              onClick={() => setSortKey('likes')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${sortKey === 'likes' ? 'bg-[#EFF6FF] text-[#2D66C3]' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Likes
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F3F4F6] bg-[#FAFAFA]">
                {['Title', 'Published Date', 'Likes', 'Comments', 'Engagement Rate'].map((col) => (
                  <th key={col} className="px-5 py-3 text-left text-[12px] font-bold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedContent.map((post, i) => {
                const isTop = post.id === recentContent[topPostIndex]?.id;
                return (
                  <tr
                    key={post.id}
                    className={`border-b border-[#F3F4F6] transition-colors last:border-0 hover:bg-zinc-50 ${isTop ? 'bg-emerald-50 hover:bg-emerald-50/80' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-[#374151] max-w-[220px]">
                      <div className="flex items-center gap-2">
                        {isTop && (
                          <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">Top</span>
                        )}
                        <span className="truncate">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 whitespace-nowrap">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#111827]">{post.likes.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#111827]">{post.comments.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-bold ${post.engagementRate >= 4 ? 'text-emerald-600' : post.engagementRate >= 2.5 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {post.engagementRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights panel */}
      <InsightsPanel competitor={competitor} />
    </div>
  );
}
