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
    <div className="min-h-screen p-8" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Welcome back, {user.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Here's your financial overview
          </p>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {accounts.map((account: any) => (
            <div 
              key={account.id} 
              className="p-6 rounded-lg"
              style={{ 
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {account.type} Account
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {account.name}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-md flex items-center justify-center"
                  style={{ background: 'var(--color-background)' }}
                >
                  <svg className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                ${account.balance.toFixed(2)}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {account.currency}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
                  Total Income
                </p>
                <p className="text-3xl font-semibold font-mono mt-3" style={{ color: 'var(--color-success)' }}>
                  ${totalIncome.toFixed(2)}
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  Last 6 months
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-md flex items-center justify-center"
                style={{ background: 'var(--color-success-light)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
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
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
                  Total Expenses
                </p>
                <p className="text-3xl font-semibold font-mono mt-3" style={{ color: 'var(--color-danger)' }}>
                  ${totalExpenses.toFixed(2)}
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  Last 6 months
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-md flex items-center justify-center"
                style={{ background: 'var(--color-danger-light)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--color-danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => setDepositModalOpen(true)} 
            className="text-left p-6 rounded-lg transition-all hover:shadow-md"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-success-light)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Deposit</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Add funds to account</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setWithdrawModalOpen(true)} 
            className="text-left p-6 rounded-lg transition-all hover:shadow-md"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-danger-light)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--color-danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Withdraw</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Remove funds</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setTransferModalOpen(true)} 
            className="text-left p-6 rounded-lg transition-all hover:shadow-md"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-accent-light)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Transfer</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Move funds</p>
              </div>
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
          <div 
            className="p-6 rounded-lg"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Recent Transactions
            </h3>
            <div className="space-y-1">
              {recentTransactions.map((txn: any) => {
                const isPositive = txn.amount > 0;
                return (
                  <div 
                    key={txn.id} 
                    className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ 
                          background: isPositive ? 'var(--color-success-light)' : 'var(--color-danger-light)'
                        }}
                      >
                        <svg 
                          className="w-5 h-5" 
                          style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          {isPositive ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {txn.merchant}
                        </p>
                        <p className="text-xs capitalize" style={{ color: 'var(--color-text-tertiary)' }}>
                          {txn.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p 
                        className="font-semibold font-mono text-sm"
                        style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}
                      >
                        {isPositive ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Insights Section */}
        <div className="mt-8">
          <Link href="/graph-analysis">
            <div 
              className="p-6 rounded-lg transition-all hover:shadow-md"
              style={{ 
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-accent-light)' }}
                >
                  <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    AI-Powered Insights
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Analyze spending trends and get personalized financial recommendations
                  </p>
                </div>
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
