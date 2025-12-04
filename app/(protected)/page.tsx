import { requireUser } from '@/lib/session';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq, inArray, and, gte } from 'drizzle-orm';
import DashboardClient from './DashboardClient';

async function getDashboardData(userId: string) {
  // Get all accounts for this user
  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (userAccounts.length === 0) {
    return null;
  }

  const accountIds = userAccounts.map(a => a.id);

  // Calculate total balance
  const totalBalance = userAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

  // Get transactions for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const userTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        inArray(transactions.accountId, accountIds),
        gte(transactions.date, sixMonthsAgo)
      )
    );

  // Get recent transactions (last 10)
  const recentTransactions = userTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(txn => ({
      id: txn.id,
      date: txn.date,
      merchant: txn.merchant,
      amount: parseFloat(txn.amount),
      category: txn.category,
      accountId: txn.accountId,
    }));

  // Monthly breakdown
  const monthlyBreakdown: Record<string, { income: number; expenses: number }> = {};
  for (const txn of userTransactions) {
    const month = new Date(txn.date).toISOString().slice(0, 7); // YYYY-MM
    const amount = parseFloat(txn.amount);

    if (!monthlyBreakdown[month]) {
      monthlyBreakdown[month] = { income: 0, expenses: 0 };
    }

    if (amount > 0) {
      monthlyBreakdown[month].income += amount;
    } else {
      monthlyBreakdown[month].expenses += Math.abs(amount);
    }
  }

  const monthlyData = Object.entries(monthlyBreakdown)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Category breakdown (expenses only)
  const categoryBreakdown: Record<string, number> = {};
  for (const txn of userTransactions) {
    const amount = parseFloat(txn.amount);
    if (amount < 0) {
      if (!categoryBreakdown[txn.category]) {
        categoryBreakdown[txn.category] = 0;
      }
      categoryBreakdown[txn.category] += Math.abs(amount);
    }
  }

  const categoryData = Object.entries(categoryBreakdown)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // Calculate totals for the period
  const totalIncome = userTransactions
    .filter(t => parseFloat(t.amount) > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = userTransactions
    .filter(t => parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  return {
    accounts: userAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: parseFloat(acc.balance),
      currency: acc.currency,
    })),
    totalBalance,
    totalIncome,
    totalExpenses,
    recentTransactions,
    monthlyBreakdown: monthlyData,
    categoryBreakdown: categoryData,
  };
}

export default async function DashboardPage() {
  const user = await requireUser();
  
  let dashboardData;
  try {
    dashboardData = await getDashboardData(user.id);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    dashboardData = null;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Unable to load dashboard data</p>
          </div>
        </div>
      </div>
    );
  }

  const { accounts, totalBalance, totalIncome, totalExpenses, recentTransactions, monthlyBreakdown, categoryBreakdown } = dashboardData;

  return (
    <DashboardClient
      user={user}
      accounts={accounts}
      totalBalance={totalBalance}
      totalIncome={totalIncome}
      totalExpenses={totalExpenses}
      recentTransactions={recentTransactions}
      monthlyBreakdown={monthlyBreakdown}
      categoryBreakdown={categoryBreakdown}
    />
  );
}
