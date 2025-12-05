'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryData {
  category: string;
  total: number;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
}

// Professional muted color palette with better variety
const CATEGORY_COLORS: Record<string, string> = {
  groceries: '#059669',      // green
  dining: '#DC2626',         // red
  utilities: '#3B82F6',      // blue
  entertainment: '#8B5CF6',  // purple
  shopping: '#F59E0B',       // amber
  transportation: '#06B6D4', // cyan
  healthcare: '#EC4899',     // pink
  income: '#10B981',         // emerald
  transfer: '#6366F1',       // indigo
  investment: '#14B8A6',     // teal
};

// Fallback colors for unknown categories
const FALLBACK_COLORS = [
  '#64748B', '#94A3B8', '#475569', '#334155', '#1E293B', '#0F172A'
];

function getCategoryColor(category: string, index: number): string {
  return CATEGORY_COLORS[category.toLowerCase()] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-64 rounded-lg"
        style={{ background: 'var(--color-background)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          No spending data available
        </p>
      </div>
    );
  }

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.total, 0);

  // Prepare chart data with percentages
  const chartData = data.map((item, index) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.total,
    percentage: ((item.total / total) * 100).toFixed(1),
    color: getCategoryColor(item.category, index),
  }));

  // Custom label renderer
  const renderLabel = (entry: any) => {
    const percent = parseFloat(entry.percentage);
    // Only show label if slice is > 5%
    if (percent > 5) {
      return `${percent}%`;
    }
    return '';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="px-3 py-2 rounded-md"
          style={{ 
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {data.name}
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            ${data.value.toFixed(2)}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {data.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ background: entry.color }}
            />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={90}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>

      {/* Detailed Breakdown List */}
      <div className="mt-6 space-y-2">
        {chartData.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-4 h-4 rounded-sm flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                ${item.value.toFixed(2)}
              </span>
              <span 
                className="text-xs font-medium min-w-[3rem] text-right"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div 
        className="mt-4 pt-4 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Total Spending
        </span>
        <span className="text-lg font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
