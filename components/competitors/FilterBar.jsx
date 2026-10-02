'use client';

import { Search, ArrowUpDown, RotateCcw } from 'lucide-react';
import { AppSelect } from '@/components/ui/app-select';

const PLATFORMS = ['All Platforms', 'YouTube', 'Facebook', 'Instagram', 'X', 'LinkedIn'];
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
  const isFiltered = search !== '' || platform !== 'All Platforms' || category !== 'All Categories' || sortBy !== 'name';

  const handleReset = () => {
    setSearch('');
    setPlatform('All Platforms');
    setCategory('All Categories');
    setSortBy('name');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Global Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search competitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-700)]/30 focus:border-[var(--color-brand-700)] transition-all"
        />
      </div>

      {/* Platform filter */}
      <AppSelect
        aria-label="Platform"
        value={platform}
        onChange={setPlatform}
        className="w-auto min-w-[150px]"
        options={PLATFORMS.map((p) => ({ value: p, label: p }))}
      />

      {/* Category filter */}
      <AppSelect
        aria-label="Category"
        value={category}
        onChange={setCategory}
        className="w-auto min-w-[150px] capitalize"
        contentClassName="capitalize"
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />

      <div className="w-px h-8 bg-zinc-200 mx-1 hidden sm:block" />

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-zinc-400" />
        <AppSelect
          aria-label="Sort competitors by"
          value={sortBy}
          onChange={setSortBy}
          placeholder="Sort competitors by..."
          className="w-auto min-w-[220px] font-semibold"
          options={SORT_OPTIONS}
        />
      </div>

      {/* Reset Filters */}
      {isFiltered && (
        <button
          onClick={handleReset}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-[13px] font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
          title="Reset all filters and sorting"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      )}
    </div>
  );
}
