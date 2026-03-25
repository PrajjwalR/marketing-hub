'use client';

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

export default function EngagementChart({ data }) {
  const chartData = data.map((post, i) => ({
    name: `Post ${i + 1}`,
    Likes: post.likes,
    Comments: post.comments,
    title: post.title,
  }));

  return (
    <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-5">
      <h3 className="text-[15px] font-bold text-[#111827] mb-1">Engagement Trend</h3>
      <p className="text-[13px] text-zinc-500 mb-5">Likes & Comments across last 7 posts</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '12px',
              fontWeight: 600,
            }}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload;
              return p?.title ? <span className="text-zinc-700 font-semibold">{p.title}</span> : '';
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: 12 }} />
          <Line
            type="monotone"
            dataKey="Likes"
            stroke="#2D66C3"
            strokeWidth={2}
            dot={{ r: 4, fill: '#2D66C3', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Comments"
            stroke="#31c667"
            strokeWidth={2}
            dot={{ r: 4, fill: '#31c667', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
