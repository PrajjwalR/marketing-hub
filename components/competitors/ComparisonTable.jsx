import { Youtube, Instagram, Facebook, Plus, Trash2, Pencil, Linkedin, RefreshCw } from 'lucide-react';

const XLogo = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function formatStat(num, isPercent = false) {
  if (isPercent) return `${Number(num).toFixed(1)}%`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

// Helper to calculate aggregate depending on metric type
function getAggregate(company, metricKey, type) {
  const sum = company.accounts.reduce((acc, curr) => acc + (curr.stats[metricKey] || 0), 0);
  if (type === 'percent') {
    return company.accounts.length ? sum / company.accounts.length : 0;
  }
  return sum;
}

const PLATFORM_ICONS = {
  'YouTube': <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />,
  'Instagram': <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />,
  'Facebook': <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />,
  'X': <XLogo className="w-3.5 h-3.5 text-[#000000]" />,
  'LinkedIn': <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
};

const PLATFORM_ORDER = ['YouTube', 'Instagram', 'Facebook', 'X', 'LinkedIn'];

export default function ComparisonTable({ data, activePlatformFilter = 'All Platforms', onAddPlatform, onRemoveCompany, onEditPlatform, onRefreshPlatform, refreshingPlatforms = {} }) {
  if (!data || data.length === 0) return null;
  const isSingleCompanyView = data.length === 1;
  const companyColMinWidth = isSingleCompanyView ? 'min-w-[110px]' : 'min-w-[220px]';
  const companyColPadding = isSingleCompanyView ? 'p-1.5' : 'p-4';
  const cellPadding = isSingleCompanyView ? 'p-1.5' : 'p-4';
  const companyHeaderTextSize = isSingleCompanyView ? 'text-[12px]' : 'text-[15px]';
  const companyAvatarSize = isSingleCompanyView ? 'h-8 w-8' : 'h-10 w-10';
  const companyBadgeTextSize = isSingleCompanyView ? 'text-[8px]' : 'text-[10px]';
  const companyHeaderGap = isSingleCompanyView ? 'gap-0.5' : 'gap-2';
  const platformRowTextSize = isSingleCompanyView ? 'text-[11px]' : 'text-[13px]';
  const platformRowMinHeight = isSingleCompanyView ? 'min-h-[18px]' : 'min-h-[24px]';
  const platformRowXPad = isSingleCompanyView ? 'px-1' : 'px-1';

  // Platforms to show based on standard filter view (so empty ones can be added)
  const visiblePlatforms = activePlatformFilter === 'All Platforms' 
    ? PLATFORM_ORDER 
    : [activePlatformFilter];

  const metrics = [
    { key: 'avatar', label: 'Company', type: 'header' },
    { key: 'subscribers', label: 'Subscribers / Followers', type: 'number' },
    { key: 'totalVideosPosts', label: 'Total Videos / Posts', type: 'number' },
    { key: 'avgLikes', label: 'Avg Likes per Post', type: 'number' },
    { key: 'avgComments', label: 'Avg Comments per Post', type: 'number' },
    { key: 'reach', label: 'Estimated Reach', type: 'number' },
    { key: 'engagementRate', label: 'Avg Engagement Rate', type: 'percent' },
  ];

  return (
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-x-auto shadow-sm w-full">
      <table className={`${isSingleCompanyView ? 'w-auto min-w-[560px]' : 'w-full'} text-left border-collapse`}>
        <thead>
          <tr>
            <th className="p-4 bg-zinc-50 border-b border-r border-[#E5E7EB] w-48 text-[13px] font-bold text-zinc-500 uppercase tracking-widest sticky left-0 z-10">
              Metrics
            </th>
            {data.map((company, i) => (
              <th
                key={company.id}
                className={`group relative ${companyColPadding} border-b border-[#E5E7EB] ${companyColMinWidth} text-center ${
                  company.isOurs ? 'bg-[#EEF4FF] border-b-[#2D66C3]/20 shadow-[inset_0_2px_0_#2D66C3]' : 'bg-white'
                } ${i < data.length - 1 ? 'border-r' : ''}`}
              >
                {!company.isOurs && onRemoveCompany && (
                  <button
                    onClick={() => onRemoveCompany(company.id)}
                    className="absolute top-3 right-3 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20"
                    title="Remove Competitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className={`flex flex-col items-center ${companyHeaderGap}`}>
                  <div
                    className={`flex ${companyAvatarSize} shrink-0 items-center justify-center rounded-[8px] text-sm font-bold text-white shadow-sm overflow-hidden`}
                    style={company.avatarImage ? {} : { backgroundColor: company.avatarColor }}
                  >
                    {company.avatarImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={company.avatarImage} alt={company.name} className="h-full w-full object-cover" />
                    ) : (
                      company.avatarInitials
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`${companyHeaderTextSize} font-extrabold ${company.isOurs ? 'text-[#1d4e9f]' : 'text-[#111827]'}`}>
                      {company.name}
                    </span>
                    {company.isOurs && (
                      <span className={`mt-1.5 rounded-full bg-[#2D66C3] px-2 py-0.5 ${companyBadgeTextSize} font-bold text-white uppercase tracking-wider`}>
                        You
                      </span>
                    )}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[14px]">
          {metrics.slice(1).map((metric) => (
            <tr key={metric.key} className="transition-colors hover:bg-zinc-50/50">
              <td className="p-4 bg-zinc-50/80 border-b border-r border-[#E5E7EB] font-bold text-[#374151] sticky left-0 z-10 align-top">
                {metric.label}
              </td>
              {data.map((company, colIndex) => {
                const isOurs = company.isOurs;
                const cellClass = `${cellPadding} border-b border-[#E5E7EB] align-top ${
                  isOurs ? 'bg-[#EEF4FF]/50' : 'bg-white'
                } ${colIndex < data.length - 1 ? 'border-r' : ''}`;

                return (
                  <td key={`${company.id}-${metric.key}`} className={cellClass}>
                    <div className="flex flex-col gap-2 w-full">
                      {/* Fixed height rows per visible platform for horizontal alignment */}
                      {visiblePlatforms.map((plat) => {
                         const acc = company.accounts.find(a => a.platform === plat);
                         const refreshKey = `${company.id}-${plat}`;
                         const isRefreshing = Boolean(refreshingPlatforms[refreshKey]);
                         
                         return (
                           <div key={plat} className={`flex items-center justify-between ${platformRowTextSize} w-full ${platformRowXPad} ${platformRowMinHeight}`}>
                             <div className="flex items-center justify-center p-1 rounded-md bg-zinc-100 border border-zinc-200" title={plat}>
                               {PLATFORM_ICONS[plat]}
                             </div>
                             {acc ? (
                               <div className="flex items-center gap-1.5 group/edit relative">
                                 {onRefreshPlatform && (
                                   <button
                                     onClick={() => onRefreshPlatform(company, plat, acc.handle)}
                                     disabled={isRefreshing}
                                     title={`Refresh ${plat} stats`}
                                     className={`opacity-0 group-hover/edit:opacity-100 transition-opacity text-zinc-400 hover:text-[#2D66C3] ${isRefreshing ? 'opacity-100 text-[#2D66C3]' : ''}`}
                                   >
                                     <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                   </button>
                                 )}
                                 {onEditPlatform && (
                                   <button 
                                     onClick={() => onEditPlatform(company, plat, acc.handle)}
                                     title={`Edit ${plat} URL`}
                                     className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-zinc-400 hover:text-[#2D66C3]"
                                   >
                                     <Pencil className="w-3 h-3" />
                                   </button>
                                 )}
                                <span
                                  className={`font-semibold ${
                                    acc?.error
                                      ? 'text-zinc-400'
                                      : isOurs
                                        ? 'text-[#1d4e9f]'
                                        : 'text-zinc-700'
                                  }`}
                                  title={acc?.error ? String(acc.error) : undefined}
                                >
                                  {acc?.error ? '-' : formatStat(acc.stats[metric.key], metric.type === 'percent')}
                                </span>
                               </div>
                             ) : (
                               onAddPlatform ? (
                                 <button
                                   onClick={() => onAddPlatform(company, plat)}
                                   title={`Add ${plat} profile for ${company.name}`}
                                   className="group relative flex items-center justify-center h-5 w-12 rounded hover:bg-zinc-200 transition-colors shrink-0"
                                 >
                                   <span className="text-zinc-300 font-medium group-hover:hidden">-</span>
                                   <Plus className="hidden group-hover:block h-3.5 w-3.5 text-[#2D66C3]" />
                                 </button>
                               ) : (
                                 <span className="text-zinc-300 font-medium">-</span>
                               )
                             )}
                           </div>
                         );
                      })}
                      
                      {/* Aggregate Summary (Only show if multiple accounts exist for this metric conceptually across the table) */}
                      {visiblePlatforms.length > 1 && (
                         <div className={`flex items-center justify-between text-[13px] w-full px-1 pt-1.5 mt-1 border-t ${isOurs ? 'border-[#2D66C3]/20' : 'border-[#E5E7EB]/70'} min-h-[28px]`}>
                           <span className={`font-bold text-[11px] uppercase ${isOurs ? 'text-[#2D66C3]' : 'text-zinc-600'}`}>
                             {metric.type === 'percent' ? 'Avg' : 'Total'}
                           </span>
                           <span className={`font-extrabold ${isOurs ? 'text-[#2D66C3]' : 'text-zinc-900'}`}>
                             {formatStat(getAggregate(company, metric.key, metric.type), metric.type === 'percent')}
                           </span>
                         </div>
                      )}
                      
                      {/* Empty state completely filtered out */}
                      {visiblePlatforms.length === 0 && (
                        <div className="text-center text-zinc-400 text-xs py-2">-</div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
