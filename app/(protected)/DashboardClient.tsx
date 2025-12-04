'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/Modal';
import { FormDeposit } from '@/components/FormDeposit';
import { FormWithdraw } from '@/components/FormWithdraw';
import { FormTransfer } from '@/components/FormTransfer';
import SpendingPieChart from '@/components/SpendingPieChart';
import MonthlyTrendChart from '@/components/MonthlyTrendChart';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface DashboardClientProps {
  user: { name: string };
  accounts: any[];
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  recentTransactions: any[];
  monthlyBreakdown: any[];
  categoryBreakdown: any[];
}

export default function DashboardClient({
  user,
  accounts,
  totalBalance,
  totalIncome,
  totalExpenses,
  recentTransactions,
  monthlyBreakdown,
  categoryBreakdown,
}: DashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const handleDepositSuccess = () => {
    setDepositModalOpen(false);
    showToast('Deposit successful!', 'success');
    router.refresh();
  };

  const handleWithdrawSuccess = () => {
    setWithdrawModalOpen(false);
    showToast('Withdrawal successful!', 'success');
    router.refresh();
  };

  const handleTransferSuccess = () => {
    setTransferModalOpen(false);
    showToast('Transfer completed successfully!', 'success');
    router.refresh();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Here's your financial overview</p>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {accounts.map((account: any) => (
            <div key={account.id} className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm font-medium">{account.name}</p>
                  <p className="text-xs text-blue-200 capitalize">{account.type} Account</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">${account.balance.toFixed(2)}</p>
              <p className="text-blue-100 text-sm mt-1">{account.currency}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-3xl font-bold text-green-600 mt-2">${totalIncome.toFixed(2)}</p>
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
                <p className="text-3xl font-bold text-red-600 mt-2">${totalExpenses.toFixed(2)}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button onClick={() => setDepositModalOpen(true)} className="group text-left">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Deposit</h3>
                <svg className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-green-100 text-sm">Add funds to your account</p>
            </div>
          </button>

          <button onClick={() => setWithdrawModalOpen(true)} className="group text-left">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Withdraw</h3>
                <svg className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <p className="text-orange-100 text-sm">Withdraw from your account</p>
            </div>
          </button>

          <button onClick={() => setTransferModalOpen(true)} className="group text-left">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Transfer</h3>
                <svg className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <p className="text-blue-100 text-sm">Transfer funds</p>
            </div>
          </button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {monthlyBreakdown.length > 0 && <MonthlyTrendChart data={monthlyBreakdown} />}
          {categoryBreakdown.length > 0 && <SpendingPieChart data={categoryBreakdown} />}
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions.map((txn: any) => {
                const isPositive = txn.amount > 0;
                return (
                  <div key={txn.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                        <svg className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {isPositive ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{txn.merchant}</p>
                        <p className="text-sm text-gray-500 capitalize">{txn.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Insights Section - Optional */}
        <div className="mt-8">
          <Link href="/graph-analysis" className="group">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200 hover:border-purple-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get AI-Powered Insights</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Click here to analyze your spending trends, get personalized recommendations, and discover insights about your financial habits.
                  </p>
                </div>
                <svg className="w-6 h-6 text-purple-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={depositModalOpen} onClose={() => setDepositModalOpen(false)} title="Deposit Funds">
        <FormDeposit
          accounts={accounts}
          onSuccess={handleDepositSuccess}
          onCancel={() => setDepositModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} title="Withdraw Funds">
        <FormWithdraw
          accounts={accounts}
          onSuccess={handleWithdrawSuccess}
          onCancel={() => setWithdrawModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} title="Transfer Funds">
        <FormTransfer
          accounts={accounts}
          onSuccess={handleTransferSuccess}
          onCancel={() => setTransferModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
