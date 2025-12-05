'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyTrendChartProps {
  data: Array<{ month: string; income: number; expenses: number }>;
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = data.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    Income: item.income,
    Expenses: item.expenses,
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
        Monthly Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line type="monotone" dataKey="Income" stroke="#059669" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Expenses" stroke="#DC2626" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
