'use client';

import React, { useState, useMemo } from 'react';
import { Search, Hash, TrendingUp, Globe } from 'lucide-react';
import { contentPillarsMockData } from '@/data/contentPillarsMockData';

function formatStat(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

// Whether "You" is leading vs Industry for a given metric
function isYouLeading(tag, key) {
  return (tag.ours[key] || 0) >= (tag.industry[key] || 1);
}

export default function ContentPillarsTable() {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search.trim()) return contentPillarsMockData;
    const lowerSearch = search.toLowerCase();
    return contentPillarsMockData.map(pillar => {
      const matchesPillar = pillar.pillar.toLowerCase().includes(lowerSearch);
      if (matchesPillar) return pillar;
      const filteredTags = pillar.tags.filter(tag => tag.name.toLowerCase().includes(lowerSearch));
      return { ...pillar, tags: filteredTags };
    }).filter(pillar => pillar.tags.length > 0);
  }, [search]);

  const renderCell = (tag, key, formatType = 'number') => {
    const formatFn = (val) => {
      if (formatType === 'percent') return `${Number(val).toFixed(1)}%`;
      if (formatType === 'currency') return `$${formatStat(val)}`;
      return formatStat(val);
    };
    const leading = isYouLeading(tag, key);
    const isEmpty = tag.ours[key] === 0;

    return (
      <div className="flex flex-col gap-0 w-full divide-y divide-zinc-100 rounded-lg overflow-hidden border border-zinc-100">
        {/* Industry Row */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-50">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Industry</span>
          </div>
          <span className="text-[13px] font-bold text-zinc-700">
            {formatFn(tag.industry[key])}
          </span>
        </div>
        {/* You Row */}
        <div className={`flex items-center justify-between px-3 py-2 ${isEmpty ? 'bg-white' : leading ? 'bg-[#F0FDF4]' : 'bg-[#FFF5F5]'}`}>
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`w-3 h-3 ${isEmpty ? 'text-zinc-300' : leading ? 'text-emerald-500' : 'text-red-400'}`} />
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isEmpty ? 'text-zinc-300' : leading ? 'text-emerald-600' : 'text-red-500'}`}>You</span>
          </div>
          <span className={`text-[13px] font-extrabold ${isEmpty ? 'text-zinc-300' : leading ? 'text-emerald-700' : 'text-red-500'}`}>
            {isEmpty ? '—' : formatFn(tag.ours[key])}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-[16px] font-extrabold text-[#111827]">Content Pillars Analysis</h3>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-[13px] text-zinc-500">Your performance vs. industry benchmark per tag</p>
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-zinc-200">
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Industry</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#2D66C3]" />
                <span className="text-[11px] font-semibold text-[#2D66C3] uppercase tracking-wider">You</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tags (e.g. #newyear)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-[#E5E7EB]">
              <th className="p-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest w-[200px] border-r border-zinc-100">Content Pillars</th>
              <th className="p-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest border-r border-zinc-100">Posts</th>
              <th className="p-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest border-r border-zinc-100">Engagement</th>
              <th className="p-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest border-r border-zinc-100">Avg ER / Followers</th>
              <th className="p-4 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Organic Value</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 font-medium">
                  No tags match your search &ldquo;{search}&rdquo;
                </td>
              </tr>
            ) : (
              filteredData.map(pillar => (
                <React.Fragment key={pillar.pillar}>
                  {/* Pillar Group Header */}
                  <tr className="bg-gradient-to-r from-zinc-100 to-zinc-50 border-y border-[#E5E7EB]">
                    <td colSpan={5} className="px-4 py-2.5">
                      <span className="font-extrabold text-[#111827] text-[13px] uppercase tracking-widest">{pillar.pillar}</span>
                    </td>
                  </tr>

                  {/* Tags Rows */}
                  {pillar.tags.map((tag, idx) => (
                    <tr key={tag.name} className={`hover:bg-zinc-50/40 transition-colors ${idx !== pillar.tags.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
                      <td className="p-4 align-top border-r border-zinc-100 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-[5px] bg-[#EEF4FF] text-[#2D66C3]">
                            <Hash className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-bold text-[#111827] text-[14px]">{tag.name.replace('#', '')}</span>
                        </div>
                      </td>
                      <td className="p-3 align-top border-r border-zinc-100 min-w-[160px]">{renderCell(tag, 'posts', 'number')}</td>
                      <td className="p-3 align-top border-r border-zinc-100 min-w-[160px]">{renderCell(tag, 'engagement', 'number')}</td>
                      <td className="p-3 align-top border-r border-zinc-100 min-w-[160px]">{renderCell(tag, 'avgErByFollowers', 'percent')}</td>
                      <td className="p-3 align-top min-w-[160px]">{renderCell(tag, 'organicValue', 'currency')}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
