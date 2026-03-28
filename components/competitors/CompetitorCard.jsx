'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const PLATFORM_COLORS = {
  YouTube: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  Facebook: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  Instagram: { bg: 'bg-pink-50', text: 'text-pink-500', border: 'border-pink-200' },
};

const ENGAGEMENT_BADGE = {
  High: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Low: 'bg-red-100 text-red-600 border border-red-200',
};

function formatStat(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

export default function CompetitorCard({ competitor }) {
  const { id, name, platform, category, avatarInitials, avatarColor, stats } = competitor;
  const platformStyle = PLATFORM_COLORS[platform] || PLATFORM_COLORS.YouTube;
  const engagementStyle = ENGAGEMENT_BADGE[stats.engagementLevel] || ENGAGEMENT_BADGE.Medium;

  return (
    <div className="flex flex-col rounded-[5px] border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-200 overflow-hidden group">
      {/* Card header */}
      <div className="flex items-start gap-3 p-5 pb-4">
        {/* Avatar */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: avatarColor }}
        >
          {avatarInitials}
        </div>

        {/* Name + platform */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-bold text-[#111827] truncate">{name}</h3>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${platformStyle.bg} ${platformStyle.text} ${platformStyle.border}`}>
              {platform}
            </span>
          </div>
          {/* Category tags */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {category.map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 capitalize">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#F3F4F6]" />

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-[#F3F4F6] px-0 py-0">
        {[
          { label: 'Followers', value: formatStat(stats.followers) },
          { label: 'Avg Likes', value: formatStat(stats.avgLikes) },
          { label: 'Avg Comments', value: formatStat(stats.avgComments) },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-3 px-2">
            <div className="text-[16px] font-extrabold text-[#111827]">{value}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#F3F4F6]" />

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${engagementStyle}`}>
          {stats.engagementLevel} Engagement
        </span>
        <Link
          href={`/dashboard/competitors/${id}`}
          className="inline-flex items-center gap-1 text-[13px] font-bold text-[#2D66C3] hover:text-[#1d4e9f] transition-colors group-hover:gap-1.5"
        >
          View Details
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
