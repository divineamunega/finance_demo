'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Professional muted color palette
const COLORS = ['#64748B', '#94A3B8', '#CBD5E1', '#475569', '#334155', '#1E293B', '#0F172A', '#E2E8F0'];

interface SpendingPieChartProps {
  data: Array<{ category: string; total: number }>;
}

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
  const chartData = data.map(item => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.total,
  }));

  return (
    <div 
      className="p-6 rounded-lg"
      style={{ 
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
