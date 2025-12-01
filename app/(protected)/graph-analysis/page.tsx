'use client';

import { useState, useEffect } from 'react';
import SpendingChart from '@/components/SpendingChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import { runAnalysis } from '@/lib/api';

export default function GraphAnalysisPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load analysis on mount
  useEffect(() => {
    loadAnalysis();
  }, []);

  async function loadAnalysis() {
    try {
      setLoading(true);
      setError(null);
      
      const analysisData = await runAnalysis();
      setAnalysis(analysisData);
    } catch (err: any) {
      console.error('Error loading analysis:', err);
      setError(err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed analysis of your spending patterns</p>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Database Connection Error</h3>
                <p className="text-red-800 mb-4">Unable to load analytics. Please ensure the database is running and seeded.</p>
                <button
                  onClick={loadAnalysis}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-gray-500">
            Analyzing your finances...
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">Total Income</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  ${analysis.totals.income.toFixed(2)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">Total Expenses</div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  ${analysis.totals.expenses.toFixed(2)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">Net Change</div>
                <div className={`text-2xl font-bold mt-1 ${analysis.totals.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${analysis.totals.netChange.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Monthly Cashflow</h2>
                <SpendingChart data={analysis.monthlyBreakdown} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
                <CategoryBreakdown data={analysis.categoryBreakdown} />
              </div>
            </div>

            {/* Anomalies Table */}
            {analysis.anomalies && analysis.anomalies.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Detected Anomalies</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Merchant</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {analysis.anomalies.map((anomaly: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{anomaly.merchant}</td>
                          <td className="px-4 py-3 text-sm font-medium text-red-600">
                            ${anomaly.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(anomaly.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{anomaly.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {analysis.insights && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-900">AI Insights</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis.insights}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <button
              onClick={loadAnalysis}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Run Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
