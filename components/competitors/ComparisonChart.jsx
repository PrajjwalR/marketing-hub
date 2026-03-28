'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ComparisonChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Find the first company with valid accounts to extract dates
    const companyWithAccounts = data.find(c => c.accounts.length > 0);
    if (!companyWithAccounts) return [];
    
    const dates = companyWithAccounts.accounts[0].recentContent.map(rc => rc.date);
    
    return dates.map(date => {
      const dataPoint = { date };
      // Map each company's aggregated engagement for that date
      data.forEach(company => {
        let sum = 0;
        company.accounts.forEach(acc => {
           const match = acc.recentContent.find(rc => rc.date === date);
           if (match) sum += match.engagement;
        });
        // We only plot companies that have some engagement data for visible platforms
        if (company.accounts.length > 0) {
            dataPoint[company.name] = sum;
        }
      });
      return dataPoint;
    });
  }, [data]);

  if (chartData.length === 0) {
      return null;
  }

  return (
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-extrabold text-[#111827]">Engagement Trajectory</h3>
          <p className="text-[13px] text-zinc-500 mt-0.5">Comparing total engagement across visible platforms over the last 7 days</p>
        </div>
      </div>
      
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getDate()} ${(d.toLocaleString('default', { month: 'short' }))}`;
              }}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ paddingBottom: '4px' }}
              labelStyle={{ color: '#6B7280', marginBottom: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            />
            <Legend 
              wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingTop: 20 }}
              iconType="circle"
            />
            
            {data.filter(c => c.accounts.length > 0).map((company) => (
              <Line
                key={company.id}
                type="monotone"
                dataKey={company.name}
                name={company.name}
                stroke={company.avatarColor}
                strokeWidth={company.isOurs ? 4 : 2}
                dot={{ r: company.isOurs ? 5 : 3, fill: company.avatarColor, strokeWidth: 0 }}
                activeDot={{ r: company.isOurs ? 8 : 6, stroke: 'white', strokeWidth: 2 }}
                strokeDasharray={company.isOurs ? undefined : "5 5"}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
