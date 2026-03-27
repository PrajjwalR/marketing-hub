'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, BarChart2, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { competitorsMockData } from '@/data/competitorsMockData';
import ComparisonTable from '@/components/competitors/ComparisonTable';
import ComparisonChart from '@/components/competitors/ComparisonChart';
import ContentPillarsTable from '@/components/competitors/ContentPillarsTable';
import CompetitorProgressChart from '@/components/competitors/CompetitorProgressChart';
import AddCompetitorModal from '@/components/competitors/AddCompetitorModal';
import AddPlatformModal from '@/components/competitors/AddPlatformModal';
import FilterBar from '@/components/competitors/FilterBar';
import { useAuth } from '@/lib/auth-context';

function sanitizeCompetitorsData(data: any[]) {
  return data.map((company: any) => {
    if (!company?.isOurs) return company;
    const safeAccounts = Array.isArray(company.accounts)
      ? company.accounts.filter((acc: any) => typeof acc?.handle === 'string' && acc.handle.trim() !== '')
      : [];
    return { ...company, accounts: safeAccounts };
  });
}

export default function CompetitorsPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [competitors, setCompetitors] = useState(() => sanitizeCompetitorsData(competitorsMockData));
  const [showModal, setShowModal] = useState(false);
  const [activePlatformAdd, setActivePlatformAdd] = useState<{company: any, platform: string} | null>(null);
  const [activePlatformEdit, setActivePlatformEdit] = useState<{company: any, platform: string, handle: string} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshingPlatforms, setRefreshingPlatforms] = useState<Record<string, boolean>>({});

  // Sync with localStorage on mount and start Background Update
  useEffect(() => {
    setIsMounted(true);
    let loadedData = competitorsMockData;
    try {
      const saved = localStorage.getItem('competitorsData');
      if (saved) {
        loadedData = sanitizeCompetitorsData(JSON.parse(saved));
        setCompetitors(loadedData);
      }
    } catch (e) {
      console.error('Failed to parse competitors from LocalStorage', e);
    }

    let isSubscribed = true;

    async function backgroundSync(compsToSync: any[]) {
      try {
        setIsSyncing(true);
        // Sequentially refresh each saved competitor so we don't spam the API or hit Apify rate limits
        for (const comp of compsToSync) {
           if (comp.accounts.length === 0) continue;
           
           const response = await fetch('/api/competitors/analyze', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               name: comp.name,
               category: comp.category,
               accounts: comp.accounts,
               strictRealData: Boolean(comp.isOurs)
             })
           });

           if (response.ok) {
              const freshComp = await response.json();
              if (isSubscribed) {
                 // Update the specific competitor in place seamlessly to avoid race conditions with adding new ones
                 setCompetitors(prev => prev.map(c => c.id === comp.id ? { ...freshComp, id: comp.id, isOurs: comp.isOurs } : c));
              }
           }
        }
      } catch (err) {
        console.error("Background auto-sync failed:", err);
      } finally {
        if (isSubscribed) setIsSyncing(false);
      }
    }

    backgroundSync(loadedData);

    return () => { isSubscribed = false; };
  }, []);

  // Save to localStorage whenever competitors changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('competitorsData', JSON.stringify(competitors));
    }
  }, [competitors, isMounted]);

  // Filter & Sort state
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All Platforms');
  const [category, setCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');

  function handleAdd(newCompetitor: any) {
    setCompetitors((prev) => [...prev, newCompetitor]);
  }

  function handleDeleteCompany(id: string) {
    if (confirm("Are you sure you want to remove this tracked company?")) {
      setCompetitors(prev => prev.filter(c => c.id !== id));
    }
  }

  async function handleAddSinglePlatform(url: string) {
    if (!activePlatformAdd) return;
    try {
      const response = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activePlatformAdd.company.name,
          category: activePlatformAdd.company.category,
          accounts: [{ platform: activePlatformAdd.platform, handle: url }],
          strictRealData: Boolean(activePlatformAdd.company.isOurs)
        })
      });

      if (!response.ok) throw new Error('API Error');
      const analysisResult = await response.json();
      
      const newAccountObj = analysisResult.accounts[0];
      if (!newAccountObj || newAccountObj.error) throw new Error('Live data unavailable');

      setCompetitors(prev => prev.map(c => {
        if (c.id === activePlatformAdd.company.id) {
          const exists = c.accounts.some((a: any) => a.platform === activePlatformAdd.platform);
          if (exists) return c;
          return { ...c, accounts: [...c.accounts, newAccountObj] };
        }
        return c;
      }));
      
      setActivePlatformAdd(null);
    } catch (err) {
       alert("Failed to analyze the new platform. Please check URL.");
    }
  }

  function handleClearData() {
    if (confirm('This will clear all saved competitor data so you can start fresh. Continue?')) {
      localStorage.removeItem('competitorsData');
      setCompetitors(sanitizeCompetitorsData(competitorsMockData));
    }
  }

  async function handleEditPlatform(newUrl: string) {
    if (!activePlatformEdit) return;
    try {
      const response = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activePlatformEdit.company.name,
          category: activePlatformEdit.company.category,
          accounts: [{ platform: activePlatformEdit.platform, handle: newUrl }],
          strictRealData: Boolean(activePlatformEdit.company.isOurs)
        })
      });

      if (!response.ok) throw new Error('API Error');
      const analysisResult = await response.json();
      const newAccountObj = analysisResult.accounts[0];
      if (!newAccountObj || newAccountObj.error) throw new Error('Live data unavailable');

      setCompetitors(prev => prev.map(c => {
        if (c.id === activePlatformEdit.company.id) {
          const newAccounts = c.accounts.map((a: any) => 
            a.platform === activePlatformEdit.platform ? newAccountObj : a
          );
          return { ...c, accounts: newAccounts };
        }
        return c;
      }));
      
      setActivePlatformEdit(null);
    } catch (err) {
       alert("Failed to update and analyze the tracking URL.");
    }
  }

  async function handleRefreshPlatform(company: any, platformName: string, handle: string) {
    const refreshKey = `${company.id}-${platformName}`;
    setRefreshingPlatforms(prev => ({ ...prev, [refreshKey]: true }));
    try {
      const response = await fetch(`/api/competitors/analyze?refreshTs=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          name: company.name,
          category: company.category,
          accounts: [{ platform: platformName, handle }],
          strictRealData: Boolean(company.isOurs)
        })
      });

      if (!response.ok) throw new Error('API Error');
      const analysisResult = await response.json();
      const refreshedAccount = analysisResult.accounts?.[0];
      if (!refreshedAccount || refreshedAccount.error) throw new Error('Live data unavailable');

      setCompetitors(prev => prev.map(c => {
        if (c.id !== company.id) return c;
        return {
          ...c,
          accounts: c.accounts.map((a: any) => (
            a.platform === platformName ? refreshedAccount : a
          ))
        };
      }));
    } catch (err) {
      alert(`Failed to refresh ${platformName} account stats.`);
    } finally {
      setRefreshingPlatforms(prev => {
        const next = { ...prev };
        delete next[refreshKey];
        return next;
      });
    }
  }

  const processedData = useMemo(() => {
    // 1. Separate "Our Company" from the rest
    const ourCompanyMock = competitors.find(c => c.isOurs) || competitors[0];
    const others = competitors.filter(c => c.id !== ourCompanyMock.id);

    // Dynamically inject the authenticated user's details
    const companyName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'My Company');
    const ourCompany = {
      ...ourCompanyMock,
      name: companyName,
      avatarImage: user?.photoURL,
      avatarInitials: companyName.substring(0, 2).toUpperCase()
    };

    // Helper: Filter accounts IN the company objects based on Platform filter
    const filterCompanyAccounts = (comp: any) => {
      if (platform === 'All Platforms') return comp;
      const filteredAccounts = comp.accounts.filter((acc: any) => acc.platform === platform);
      return { ...comp, accounts: filteredAccounts };
    };

    let ourFiltered = filterCompanyAccounts(ourCompany);
    let othersFiltered = others.map(filterCompanyAccounts);

    // 2. Filter companies that have AT LEAST ONE account matching the filters
    const filtered = othersFiltered.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All Categories' || c.category.includes(category.toLowerCase());
      const hasAccounts = c.accounts.length > 0;
      return matchesSearch && matchesCategory && hasAccounts;
    });

    // 3. Sort companies by aggregate metrics of their currently visible accounts
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      
      const getAggregate = (comp: any) => comp.accounts.reduce((sum: number, acc: any) => sum + (acc.stats[sortBy] || 0), 0);
      const valA = getAggregate(a);
      const valB = getAggregate(b);
      
      // For Engagement Rate, we average it instead of summing
      if (sortBy === 'engagementRate') {
          const avgA = a.accounts.length ? valA / a.accounts.length : 0;
          const avgB = b.accounts.length ? valB / b.accounts.length : 0;
          return avgB - avgA;
      }

      return valB - valA;
    });

    // 4. Reconstruct array: Our Company always first
    return [ourFiltered, ...sorted];
  }, [competitors, search, platform, category, sortBy]);

  // Prevent hydration mismatch by blocking render until mounted
  if (!isMounted) return null;

  return (
    <div className="w-full pb-10">
      <header className="font-sans sticky top-0 z-30 -mx-3 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/90 bg-[#F4F5F7] px-3 py-3.5 sm:-mx-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none bg-[#FFF0EE]">
            <BarChart2 className="h-5 w-5 text-[#e85d4a]" />
          </div>
          <div className="min-w-0 flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-[#111827]">Competitor Analysis</h1>
              <p className="text-[13px] text-zinc-500 leading-none mt-0.5">Compare your performance head-to-head across all platform accounts</p>
            </div>
            {isSyncing && (
                <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-semibold border border-blue-100">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Syncing Live Data...
                </div>
            )}
          </div>
        </div>
        <button
          onClick={handleClearData}
          className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
          title="Clear cached data and start fresh"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Data
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#205BC3] px-4 py-2 text-sm font-bold text-white hover:bg-[#1a4fa8] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </header>

      <div className="space-y-6">
        <FilterBar
          search={search} setSearch={setSearch}
          platform={platform} setPlatform={setPlatform}
          category={category} setCategory={setCategory}
          sortBy={sortBy} setSortBy={setSortBy}
        />

        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[16px] font-extrabold text-[#111827]">Metrics Comparison</h2>
            <span className="text-[13px] text-zinc-500 font-medium tracking-wide">
              Comparing You vs {processedData.length - 1} Competitor{processedData.length - 1 !== 1 ? 's' : ''}
            </span>
          </div>
          
          {processedData.length > 1 ? (
            <ComparisonTable 
               data={processedData} 
               activePlatformFilter={platform}
               onAddPlatform={(company: any, platform: string) => setActivePlatformAdd({ company, platform })}
               onRemoveCompany={handleDeleteCompany}
               onEditPlatform={(company: any, platform: string, handle: string) => setActivePlatformEdit({ company, platform, handle })}
               onRefreshPlatform={handleRefreshPlatform}
               refreshingPlatforms={refreshingPlatforms}
            />
          ) : (
            <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-12 text-center">
              <p className="text-[14px] text-zinc-500 font-medium">No competitors match your filters.</p>
              <button 
                onClick={() => { setSearch(''); setPlatform('All Platforms'); setCategory('All Categories'); setSortBy('name'); }}
                className="mt-3 text-[#2D66C3] font-bold text-[13px] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {processedData.length > 1 && (
          <ComparisonChart data={processedData} />
        )}

        <ContentPillarsTable />

        <CompetitorProgressChart data={processedData} />
      </div>

      {showModal && (
        <AddCompetitorModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {activePlatformAdd && (
        <AddPlatformModal
          companyName={activePlatformAdd.company.name}
          platform={activePlatformAdd.platform}
          onClose={() => setActivePlatformAdd(null)}
          onAdd={handleAddSinglePlatform}
        />
      )}

      {activePlatformEdit && (
        <AddPlatformModal
          companyName={activePlatformEdit.company.name}
          platform={activePlatformEdit.platform}
          initialUrl={activePlatformEdit.handle}
          onClose={() => setActivePlatformEdit(null)}
          onAdd={handleEditPlatform}
        />
      )}
    </div>
  );
}
