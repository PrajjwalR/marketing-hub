'use client';

import { Lightbulb, Trophy, CalendarDays } from 'lucide-react';

function getBestPostingDays(recentContent) {
  const dayCounts = {};
  recentContent.forEach((post) => {
    const day = new Date(post.date).toLocaleDateString('en-US', { weekday: 'long' });
    const engagement = post.likes + post.comments;
    dayCounts[day] = (dayCounts[day] || 0) + engagement;
  });
  const sorted = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 2).map(([day]) => day);
}

function getTopPost(recentContent) {
  return recentContent.reduce(
    (best, post) => (post.likes + post.comments > (best?.likes || 0) + (best?.comments || 0) ? post : best),
    null
  );
}

function getCounterStrategy(name, bestDays) {
  const oppositeDays = {
    Sunday: 'Tuesday–Wednesday',
    Saturday: 'Monday–Tuesday',
    Monday: 'Wednesday–Thursday',
    Tuesday: 'Thursday–Friday',
    Wednesday: 'Friday–Saturday',
    Thursday: 'Saturday–Sunday',
    Friday: 'Sunday–Monday',
  };
  const primaryDay = bestDays[0] || 'weekends';
  const counter = oppositeDays[primaryDay] || 'mid-week';
  return `${name} posts most heavily on ${primaryDay}s. You could schedule content on ${counter} to capture audience attention before they see competitor content.`;
}

export default function InsightsPanel({ competitor }) {
  const { name, recentContent, stats } = competitor;
  const topPost = getTopPost(recentContent);
  const bestDays = getBestPostingDays(recentContent);
  const counterStrategy = getCounterStrategy(name, bestDays);

  return (
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[#F3F4F6]">
          <Lightbulb className="h-4 w-4 text-[#6B7280]" />
        </div>
        <h3 className="text-[15px] font-bold text-[#111827]">Insights & Strategy</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#F3F4F6]">
        {/* Top Post */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
            <span className="text-[13px] font-bold text-[#374151]">Top Performing Post</span>
          </div>
          {topPost ? (
            <div className="rounded-[6px] bg-emerald-50 border border-emerald-100 p-3">
              <p className="text-[13px] font-semibold text-[#111827] leading-snug">{topPost.title}</p>
              <div className="mt-2 flex gap-3 text-[12px] text-zinc-600">
                <span>👍 {topPost.likes.toLocaleString()}</span>
                <span>💬 {topPost.comments.toLocaleString()}</span>
                <span className="font-bold text-emerald-700">{topPost.engagementRate}% ER</span>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-zinc-500">No data available</p>
          )}
        </div>

        {/* Best Posting Days */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-[#2D66C3] shrink-0" />
            <span className="text-[13px] font-bold text-[#374151]">Best Posting Days</span>
          </div>
          {bestDays.length > 0 ? (
            <div className="space-y-2">
              {bestDays.map((day, i) => (
                <div key={day} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-bold text-[#2D66C3] shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-[#374151]">{day}</span>
                </div>
              ))}
              <p className="text-[12px] text-zinc-500 mt-1">Based on highest engagement patterns</p>
            </div>
          ) : (
            <p className="text-[13px] text-zinc-500">No data available</p>
          )}
          {stats.postingFrequency && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[12px] font-semibold text-zinc-700">
              📅 {stats.postingFrequency}
            </div>
          )}
        </div>

        {/* Counter Strategy */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-[13px] font-bold text-[#374151]">Counter Strategy</span>
          </div>
          <div className="rounded-[6px] bg-amber-50 border border-amber-100 p-3">
            <p className="text-[13px] text-[#374151] leading-relaxed">{counterStrategy}</p>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">AI-generated suggestion based on mock data</p>
        </div>
      </div>
    </div>
  );
}
