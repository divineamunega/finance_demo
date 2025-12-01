import { requireUser } from '@/lib/session';
import { runAnalysis } from '@/lib/api';
import Link from 'next/link';

export default async function DashboardPage() {
  await requireUser();

  let analysis;
  try {
    analysis = await runAnalysis();
  } catch (error) {
    // Handle error - show error state or empty
    analysis = null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview</p>
        </div>

        {analysis ? (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${(analysis.totals.income - analysis.totals.expenses).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600 mt-1">+{analysis.totals.netChange >= 0 ? analysis.totals.netChange.toFixed(2) : '0.00'} this period</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      ${analysis.totals.income.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      ${analysis.totals.expenses.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/graph-analysis" className="group">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">View Analytics</h3>
                    <svg className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-blue-100">Detailed charts, trends, and spending patterns</p>
                </div>
              </Link>

              <Link href="/chat" className="group">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">AI Assistant</h3>
                    <svg className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-purple-100">Ask questions and get personalized financial advice</p>
                </div>
              </Link>
            </div>

            {/* Top Spending Categories */}
            {analysis.categoryBreakdown && analysis.categoryBreakdown.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
                <div className="space-y-3">
                  {analysis.categoryBreakdown.slice(0, 5).map((cat: any, index: number) => {
                    const total = analysis.categoryBreakdown.reduce((sum: number, c: any) => sum + c.total, 0);
                    const percentage = (cat.total / total * 100).toFixed(1);
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">{cat.category}</span>
                            <span className="text-sm font-semibold text-gray-900">${cat.total.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Insights */}
            {analysis.insights && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
                    <p className="text-gray-700 leading-relaxed">{analysis.insights}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No data available</p>
            <Link href="/graph-analysis" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Run Analysis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
