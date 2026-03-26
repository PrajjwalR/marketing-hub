import { Youtube, Instagram, Facebook } from 'lucide-react';

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
  'X': <XLogo className="w-3.5 h-3.5 text-[#000000]" />
};

const PLATFORM_ORDER = ['YouTube', 'Instagram', 'Facebook', 'X'];

export default function ComparisonTable({ data }) {
  if (!data || data.length === 0) return null;

  // Determine which platforms should be visible across the whole table 
  // (if filtered, this will naturally only contain the active platform)
  const visiblePlatforms = PLATFORM_ORDER.filter(plat => 
    data.some(c => c.accounts.some(a => a.platform === plat))
  );

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
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-x-auto shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-4 bg-zinc-50 border-b border-r border-[#E5E7EB] w-48 text-[13px] font-bold text-zinc-500 uppercase tracking-widest sticky left-0 z-10">
              Metrics
            </th>
            {data.map((company, i) => (
              <th
                key={company.id}
                className={`p-4 border-b border-[#E5E7EB] min-w-[220px] text-center ${
                  company.isOurs ? 'bg-[#EEF4FF] border-b-[#2D66C3]/20 shadow-[inset_0_2px_0_#2D66C3]' : 'bg-white'
                } ${i < data.length - 1 ? 'border-r' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: company.avatarColor }}
                  >
                    {company.avatarInitials}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[15px] font-extrabold ${company.isOurs ? 'text-[#1d4e9f]' : 'text-[#111827]'}`}>
                      {company.name}
                    </span>
                    {company.isOurs && (
                      <span className="mt-1.5 rounded-full bg-[#2D66C3] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
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
          {metrics.slice(1).map((metric, rowIndex) => (
            <tr key={metric.key} className="transition-colors hover:bg-zinc-50/50">
              <td className="p-4 bg-zinc-50/80 border-b border-r border-[#E5E7EB] font-bold text-[#374151] sticky left-0 z-10 align-top">
                {metric.label}
              </td>
              {data.map((company, colIndex) => {
                const isOurs = company.isOurs;
                const cellClass = `p-4 border-b border-[#E5E7EB] align-top ${
                  isOurs ? 'bg-[#EEF4FF]/50' : 'bg-white'
                } ${colIndex < data.length - 1 ? 'border-r' : ''}`;

                return (
                  <td key={`${company.id}-${metric.key}`} className={cellClass}>
                    <div className="flex flex-col gap-2 w-full">
                      {/* Fixed height rows per visible platform for horizontal alignment */}
                      {visiblePlatforms.map((plat) => {
                         const acc = company.accounts.find(a => a.platform === plat);
                         
                         return (
                           <div key={plat} className="flex items-center justify-between text-[13px] w-full px-1 min-h-[24px]">
                             <div className="flex items-center justify-center p-1 rounded-md bg-zinc-100 border border-zinc-200" title={plat}>
                               {PLATFORM_ICONS[plat]}
                             </div>
                             {acc ? (
                               <span className={`font-semibold ${isOurs ? 'text-[#1d4e9f]' : 'text-zinc-700'}`}>
                                 {formatStat(acc.stats[metric.key], metric.type === 'percent')}
                               </span>
                             ) : (
                               <span className="text-zinc-300 font-medium">-</span>
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
