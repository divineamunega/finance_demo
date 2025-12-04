import { NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq, inArray, and, gte, orderBy, desc } from 'drizzle-orm';
import { requireSessionUser } from '@/lib/session';

/**
 * GET /api/dashboard
 * Fetches dashboard data for the current user:
 * - Account balances
 * - Recent transactions
 * - Monthly breakdown (income vs expenses)
 * - Category breakdown for spending
 */
export async function GET() {
  try {
    const user = await requireSessionUser();
    const userId = user.id;

    // Get all accounts for this user
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    if (userAccounts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          accounts: [],
          totalBalance: 0,
          recentTransactions: [],
          monthlyBreakdown: [],
          categoryBreakdown: [],
        },
      });
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

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
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
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
