'use client';

function formatStat(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

export default function ComparisonTable({ data }) {
  if (!data || data.length === 0) return null;

  const metrics = [
    { key: 'avatar', label: 'Company', type: 'header' },
    { key: 'subscribers', label: 'Subscribers / Followers', type: 'number' },
    { key: 'totalVideosPosts', label: 'Total Videos / Posts', type: 'number' },
    { key: 'avgLikes', label: 'Avg Likes per Post', type: 'number' },
    { key: 'avgComments', label: 'Avg Comments per Post', type: 'number' },
    { key: 'reach', label: 'Estimated Reach', type: 'number' },
    { key: 'engagementRate', label: 'Engagement Rate', type: 'percent' },
  ];

  // Separate Our Company from the rest
  const ourCompany = data.find((c) => c.isOurs) || data[0];
  const competitors = data.filter((c) => c.id !== ourCompany.id);
  const allColumns = [ourCompany, ...competitors];

  return (
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-x-auto shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-4 bg-zinc-50 border-b border-r border-[#E5E7EB] w-48 text-[13px] font-bold text-zinc-500 uppercase tracking-widest sticky left-0 z-10">
              Metrics
            </th>
            {allColumns.map((company, i) => (
              <th
                key={company.id}
                className={`p-4 border-b border-[#E5E7EB] min-w-[200px] text-center ${
                  company.isOurs ? 'bg-[#EEF4FF] border-b-[#2D66C3]/20 shadow-[inset_0_2px_0_#2D66C3]' : 'bg-white'
                } ${i < allColumns.length - 1 ? 'border-r' : ''}`}
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
                    <div className="mt-1.5 flex items-center justify-center gap-1.5">
                      {company.isOurs && (
                        <span className="rounded-full bg-[#2D66C3] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          You
                        </span>
                      )}
                      <span className="rounded-[4px] bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 border border-zinc-200">
                        {company.platform}
                      </span>
                    </div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[14px]">
          {metrics.slice(1).map((metric, rowIndex) => (
            <tr key={metric.key} className="transition-colors hover:bg-zinc-50/50">
              <td className="p-4 bg-zinc-50/80 border-b border-r border-[#E5E7EB] font-bold text-[#374151] sticky left-0 z-10">
                {metric.label}
              </td>
              {allColumns.map((company, colIndex) => {
                const value = company.stats[metric.key];
                const isOurs = company.isOurs;
                
                // Determine formatting
                let displayValue = value;
                if (metric.type === 'number') displayValue = formatStat(value);
                if (metric.type === 'percent') displayValue = `${value}%`;

                // Highlight winning cell locally (just comparing against our company for styling)
                let cellClass = `p-4 border-b border-[#E5E7EB] text-center font-semibold ${
                  isOurs ? 'bg-[#EEF4FF]/50 text-[#1d4e9f]' : 'bg-white text-zinc-700'
                } ${colIndex < allColumns.length - 1 ? 'border-r' : ''}`;

                // Simple check: if our company is winning, make the text bolder/greener
                const maxVal = Math.max(...allColumns.map((c) => c.stats[metric.key]));
                const isMax = value === maxVal;

                if (isMax) {
                  cellClass += ' text-emerald-600 bg-emerald-50/30';
                }

                return (
                  <td key={`${company.id}-${metric.key}`} className={cellClass}>
                    <span className="flex items-center justify-center gap-1.5">
                      {isMax && <span title="Leading metric" className="text-emerald-500 text-[10px]">🏆</span>}
                      {displayValue}
                    </span>
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
