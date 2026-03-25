'use client';

import { useState, useMemo } from 'react';
import { Plus, BarChart2 } from 'lucide-react';
import { competitorsMockData } from '@/data/competitorsMockData';
import ComparisonTable from '@/components/competitors/ComparisonTable';
import ComparisonChart from '@/components/competitors/ComparisonChart';
import AddCompetitorModal from '@/components/competitors/AddCompetitorModal';
import FilterBar from '@/components/competitors/FilterBar';

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState(competitorsMockData);
  const [showModal, setShowModal] = useState(false);

  // Filter & Sort state
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All Platforms');
  const [category, setCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');

  function handleAdd(newCompetitor: any) {
    setCompetitors((prev) => [...prev, newCompetitor]);
  }

  const processedData = useMemo(() => {
    // 1. Separate "Our Company" from the rest
    const ourCompany = competitors.find(c => c.isOurs) || competitors[0];
    const others = competitors.filter(c => c.id !== ourCompany.id);

    // 2. Filter the competitors
    const filtered = others.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesPlatform = platform === 'All Platforms' || c.platform === platform;
      const matchesCategory = category === 'All Categories' || c.category.includes(category.toLowerCase());
      return matchesSearch && matchesPlatform && matchesCategory;
    });

    // 3. Sort the competitors
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // For metric-based sorting, we sort High to Low
      const valA = a.stats[sortBy] || 0;
      const valB = b.stats[sortBy] || 0;
      return valB - valA;
    });

    // 4. Reconstruct array: Our Company always first
    return [ourCompany, ...sorted];
  }, [competitors, search, platform, category, sortBy]);

  return (
    <div className="w-full pb-10">
      {/* Page header */}
      <header className="font-sans sticky top-0 z-30 -mx-3 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/90 bg-[#F4F5F7] px-3 py-3.5 sm:-mx-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none bg-[#FFF0EE]">
            <BarChart2 className="h-5 w-5 text-[#e85d4a]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#111827]">Competitor Analysis</h1>
            <p className="text-[13px] text-zinc-500 leading-none mt-0.5">Compare your performance head-to-head against top competitors</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#205BC3] px-4 py-2 text-sm font-bold text-white hover:bg-[#1a4fa8] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Competitor
        </button>
      </header>

      <div className="space-y-6">
        {/* Global Filter Bar */}
        <FilterBar
          search={search} setSearch={setSearch}
          platform={platform} setPlatform={setPlatform}
          category={category} setCategory={setCategory}
          sortBy={sortBy} setSortBy={setSortBy}
        />

        {/* Tabular Comparison */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[16px] font-extrabold text-[#111827]">Metrics Comparison</h2>
            <span className="text-[13px] text-zinc-500 font-medium tracking-wide">
              Comparing You vs {processedData.length - 1} Competitor{processedData.length - 1 !== 1 ? 's' : ''}
            </span>
          </div>
          
          {processedData.length > 1 ? (
            <ComparisonTable data={processedData} />
          ) : (
            <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-12 text-center">
              <p className="text-[14px] text-zinc-500 font-medium">No competitors match your filters.</p>
              <button 
                onClick={() => { setSearch(''); setPlatform('All Platforms'); setCategory('All Categories'); }}
                className="mt-3 text-[#2D66C3] font-bold text-[13px] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        {processedData.length > 1 && (
          <ComparisonChart data={processedData} />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddCompetitorModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
