'use client';

import { Search, ArrowUpDown } from 'lucide-react';

const PLATFORMS = ['All Platforms', 'YouTube', 'Facebook', 'Instagram'];
const CATEGORIES = ['All Categories', 'fashion', 'lifestyle', 'footwear', 'streetwear', 'beauty', 'wellness'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Alphabetical' },
  { value: 'subscribers', label: 'Subscribers (High to Low)' },
  { value: 'engagementRate', label: 'Engagement Rate (High to Low)' },
  { value: 'avgLikes', label: 'Avg Likes (High to Low)' },
  { value: 'totalVideosPosts', label: 'Total Posts (High to Low)' },
];

export default function FilterBar({ 
  search, setSearch, 
  platform, setPlatform, 
  category, setCategory,
  sortBy, setSortBy
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-[5px] border border-[#E5E7EB] shadow-sm mb-4">
      {/* Global Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search competitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[6px] border border-[#E5E7EB] bg-white pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all"
        />
      </div>

      {/* Platform filter */}
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        className="rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all cursor-pointer"
      >
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all cursor-pointer capitalize"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c} className="capitalize">{c}</option>
        ))}
      </select>

      <div className="w-px h-8 bg-[#E5E7EB] mx-1 hidden sm:block" />

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-zinc-400" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all cursor-pointer"
        >
          <option value="" disabled>Sort Competitors by...</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
