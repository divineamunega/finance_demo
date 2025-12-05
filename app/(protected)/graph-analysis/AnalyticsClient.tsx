'use client';

import SpendingChart from '@/components/SpendingChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import IncomeExpenseComparison from '@/components/IncomeExpenseComparison';
import MarkdownText from '@/components/MarkdownText';

interface AnalyticsClientProps {
  analysis: {
    totals: {
      income: number;
      expenses: number;
      netChange: number;
    };
    monthlyBreakdown: Array<{ month: string; income: number; expenses: number }>;
    categoryBreakdown: Array<{ category: string; total: number }>;
    anomalies: Array<{ merchant: string; amount: number; date: Date; reason: string }>;
    insights: string;
    topCategory: string;
  } | null;
}

export default function AnalyticsClient({ analysis }: AnalyticsClientProps) {
  if (!analysis) {
    return (
      <div 
        className="min-h-screen p-8"
        style={{ background: 'var(--color-background)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="p-8 rounded-lg"
            style={{ 
              background: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger)'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-danger)' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-danger)' }}>
                  Unable to Load Analytics
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                  No transaction data available. Please ensure the database is seeded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{ background: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Financial Analytics
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Detailed analysis of your spending patterns
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Total Income
            </div>
            <div className="text-3xl font-semibold font-mono" style={{ color: 'var(--color-success)' }}>
              ${analysis.totals.income.toFixed(2)}
            </div>
          </div>
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Total Expenses
            </div>
            <div className="text-3xl font-semibold font-mono" style={{ color: 'var(--color-danger)' }}>
              ${analysis.totals.expenses.toFixed(2)}
            </div>
          </div>
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Net Change
            </div>
            <div 
              className="text-3xl font-semibold font-mono"
              style={{ color: analysis.totals.netChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
            >
              ${analysis.totals.netChange.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Income vs Expenses Comparison */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Income vs Expenses
          </h2>
          <IncomeExpenseComparison monthlyData={analysis.monthlyBreakdown} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Monthly Cashflow
            </h2>
            <SpendingChart data={analysis.monthlyBreakdown} />
          </div>
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Spending by Category
            </h2>
            <CategoryBreakdown data={analysis.categoryBreakdown} />
          </div>
        </div>

        {/* Anomalies Table */}
        {analysis.anomalies && analysis.anomalies.length > 0 && (
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Detected Anomalies
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'var(--color-background)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                      Merchant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {analysis.anomalies.map((anomaly: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {anomaly.merchant}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium font-mono" style={{ color: 'var(--color-danger)' }}>
                        ${anomaly.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(anomaly.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {anomaly.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {analysis.insights && (
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-accent-light)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-accent-light)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                AI Insights
              </h2>
            </div>
            <MarkdownText content={analysis.insights} />
          </div>
        )}
      </div>
    </div>
  );
}
