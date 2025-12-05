'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IncomeExpenseComparisonProps {
  monthlyData: Array<{ month: string; income: number; expenses: number }>;
}

export default function IncomeExpenseComparison({ monthlyData }: IncomeExpenseComparisonProps) {
  // Format data for the chart
  const chartData = monthlyData.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    Income: item.income,
    Expenses: item.expenses,
    Net: item.income - item.expenses,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const net = data.Net;
      return (
        <div 
          className="px-4 py-3 rounded-md"
          style={{ 
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {data.month}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-success)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Income</span>
              </div>
              <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-success)' }}>
                ${data.Income.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-danger)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Expenses</span>
              </div>
              <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-danger)' }}>
                ${data.Expenses.toFixed(2)}
              </span>
            </div>
            <div 
              className="flex items-center justify-between gap-4 pt-2 mt-2"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Net</span>
              <span 
                className="text-xs font-mono font-semibold"
                style={{ color: net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {net >= 0 ? '+' : ''}${net.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-background)' }} />
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            iconType="square"
          />
          <Bar 
            dataKey="Income" 
            fill="var(--color-success)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
          <Bar 
            dataKey="Expenses" 
            fill="var(--color-danger)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {(() => {
          const totalIncome = chartData.reduce((sum, item) => sum + item.Income, 0);
          const totalExpenses = chartData.reduce((sum, item) => sum + item.Expenses, 0);
          const netChange = totalIncome - totalExpenses;
          
          return (
            <>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Total Income
                </p>
                <p className="text-lg font-semibold font-mono" style={{ color: 'var(--color-success)' }}>
                  ${totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Total Expenses
                </p>
                <p className="text-lg font-semibold font-mono" style={{ color: 'var(--color-danger)' }}>
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Net Change
                </p>
                <p 
                  className="text-lg font-semibold font-mono"
                  style={{ color: netChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                >
                  {netChange >= 0 ? '+' : ''}${netChange.toFixed(2)}
                </p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
