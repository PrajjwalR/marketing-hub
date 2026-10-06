'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, BarChart2, Building2, CheckCircle2, Loader2, RefreshCw, RotateCcw, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHero, SectionHeader, heroButtonClass } from '@/components/dashboard/page-hero';
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
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activePlatformAdd, setActivePlatformAdd] = useState<{company: any, platform: string} | null>(null);
  const [activePlatformEdit, setActivePlatformEdit] = useState<{company: any, platform: string, handle: string} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshingPlatforms, setRefreshingPlatforms] = useState<Record<string, boolean>>({});

  // Load initial competitor snapshot from DB and start background update.
  useEffect(() => {
    setIsMounted(true);
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
                 // Merge so failed scrapes (error payloads) don't overwrite previously-correct stats.
                 setCompetitors(prev =>
                   prev.map((c: any) => {
                     if (c.id !== comp.id) return c;

                     const existingAccounts: any[] = Array.isArray(c.accounts) ? c.accounts : [];
                     const freshAccounts: any[] = Array.isArray(freshComp?.accounts) ? freshComp.accounts : [];

                     const existingByPlatform = new Map(existingAccounts.map(a => [a.platform, a]));

                     const mergedAccounts: any[] = [];

                     // Take all fresh accounts; if a fresh account has error, keep the previous one if present.
                     for (const fa of freshAccounts) {
                       if (!fa?.platform) continue;
                       if (fa.error) {
                         const prevAcc = existingByPlatform.get(fa.platform);
                         if (prevAcc) mergedAccounts.push(prevAcc);
                       } else {
                         mergedAccounts.push(fa);
                       }
                     }

                     // Keep any existing platforms not present in the fresh payload.
                     for (const ea of existingAccounts) {
                       if (!ea?.platform) continue;
                       if (!mergedAccounts.some(a => a?.platform === ea.platform)) mergedAccounts.push(ea);
                     }

                     return {
                       ...freshComp,
                       id: comp.id,
                       isOurs: c.isOurs,
                       // Keep avatar fields stable so UI doesn't flicker on background refresh.
                       avatarInitials: c.avatarInitials,
                       avatarColor: c.avatarColor,
                       accounts: mergedAccounts
                     };
                   })
                 );
              }
           }
        }
      } catch (err) {
        console.error("Background auto-sync failed:", err);
      } finally {
        if (isSubscribed) setIsSyncing(false);
      }
    }

    async function bootstrapFromDb() {
      let loadedData: any[] = [];
      try {
        const response = await fetch('/api/competitors', { cache: 'no-store' });
        if (response.ok) {
          const payload = await response.json();
          if (Array.isArray(payload?.competitors)) {
            loadedData = sanitizeCompetitorsData(payload.competitors);
          }
        }
      } catch (error) {
        console.error('Failed to load competitor snapshot from DB:', error);
      }

      if (!isSubscribed) return;
      setCompetitors(loadedData);
      setHasLoadedFromDb(true);
      if (loadedData.length > 0) backgroundSync(loadedData);
    }

    bootstrapFromDb();

    return () => { isSubscribed = false; };
  }, []);

  // Persist competitor state to DB on every change after initial load.
  useEffect(() => {
    if (!isMounted || !hasLoadedFromDb) return;

    async function persistCompetitors() {
      try {
        await fetch('/api/competitors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competitors }),
        });
      } catch (error) {
        console.error('Failed to persist competitor snapshot:', error);
      }
    }

    persistCompetitors();
  }, [competitors, isMounted, hasLoadedFromDb]);

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
      if (!newAccountObj) throw new Error('No account data returned');
      if (newAccountObj.error) throw new Error(String(newAccountObj.error));

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
       const msg = err instanceof Error ? err.message : '';
       alert(`Failed to analyze the new platform. ${msg ? `Reason: ${msg}` : 'Please check URL.'}`);
    }
  }

  function handleClearData() {
    if (confirm('This will clear all saved competitor data so you can start fresh. Continue?')) {
      setCompetitors([]);
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
      if (!newAccountObj) throw new Error('No account data returned');
      if (newAccountObj.error) throw new Error(String(newAccountObj.error));

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
       const msg = err instanceof Error ? err.message : '';
       alert(`Failed to update and analyze the tracking URL. ${msg ? `Reason: ${msg}` : ''}`);
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
      if (!refreshedAccount) throw new Error('No account data returned');
      if (refreshedAccount.error) throw new Error(String(refreshedAccount.error));

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
      const msg = err instanceof Error ? err.message : '';
      alert(`Failed to refresh ${platformName} account stats.${msg ? ` Reason: ${msg}` : ''}`);
    } finally {
      setRefreshingPlatforms(prev => {
        const next = { ...prev };
        delete next[refreshKey];
        return next;
      });
    }
  }

  const processedData = useMemo(() => {
    // Helper: Filter accounts IN the company objects based on Platform filter
    const filterCompanyAccounts = (comp: any) => {
      if (platform === 'All Platforms') return comp;
      const filteredAccounts = comp.accounts.filter((acc: any) => acc.platform === platform);
      return { ...comp, accounts: filteredAccounts };
    };

    const ourCompanyExisting = competitors.find(c => c.isOurs);
    const companyName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'My Company');
    const ourCompany = ourCompanyExisting
      ? filterCompanyAccounts({
          ...ourCompanyExisting,
          name: companyName,
          avatarImage: user?.photoURL,
          avatarInitials: companyName.substring(0, 2).toUpperCase()
        })
      : null;

    const others = competitors.filter(c => !c.isOurs);
    const othersFiltered = others.map(filterCompanyAccounts);

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

    // 4. Reconstruct array: Our Company first (if present)
    return ourCompany ? [ourCompany, ...sorted] : sorted;
  }, [competitors, search, platform, category, sortBy]);

  // Prevent hydration mismatch by blocking render until mounted
  if (!isMounted) return null;

  return (
    <div className="w-full pb-10">
      <PageHero
        titleId="competitors-header"
        title="Competitor Analysis"
        breadcrumb={['Competitors']}
        icon={Swords}
        description="Compare your performance head-to-head across every platform account."
        stats={[
          { label: 'Companies tracked', value: processedData.length, icon: Building2 },
          { label: 'Status', value: isSyncing ? 'Syncing live data…' : 'Up to date', icon: isSyncing ? RefreshCw : CheckCircle2 },
        ]}
        actions={
          <>
            <button onClick={handleClearData} className={heroButtonClass('ghost')} title="Clear cached data and start fresh">
              <RotateCcw className="h-4 w-4" />
              Reset data
            </button>
            <button onClick={() => setShowModal(true)} className={heroButtonClass('gold')}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add company
            </button>
          </>
        }
        overlap={
          <div id="competitors-filters">
            <FilterBar
              search={search} setSearch={setSearch}
              platform={platform} setPlatform={setPlatform}
              category={category} setCategory={setCategory}
              sortBy={sortBy} setSortBy={setSortBy}
            />
          </div>
        }
      />

      <div className="space-y-8">
        <div>
          <SectionHeader
            label="Head to head"
            title="Metrics comparison"
            right={
              processedData.length > 0 && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                  {processedData.some((c: any) => c.isOurs)
                    ? `You vs ${Math.max(0, processedData.length - 1)} competitor${processedData.length - 1 !== 1 ? 's' : ''}`
                    : `${processedData.length} compan${processedData.length !== 1 ? 'ies' : 'y'}`}
                </span>
              )
            }
          />

          {processedData.length > 0 ? (
            <div id="competitors-table">
              <ComparisonTable 
                 data={processedData} 
                 activePlatformFilter={platform}
                 onAddPlatform={(company: any, platform: string) => setActivePlatformAdd({ company, platform })}
                 onRemoveCompany={handleDeleteCompany}
                 onEditPlatform={(company: any, platform: string, handle: string) => setActivePlatformEdit({ company, platform, handle })}
                 onRefreshPlatform={handleRefreshPlatform}
                 refreshingPlatforms={refreshingPlatforms}
              />
            </div>
          ) : (
            <EmptyState
              icon={Swords}
              title="No tracked companies yet"
              description="Add a competitor to compare followers, engagement and content pillars side by side."
              action={
                <Button variant="gold" size="lg" onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4" />
                  Add your first company
                </Button>
              }
            />
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
