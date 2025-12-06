import { requireUser } from '@/lib/session';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq, inArray, and, gte } from 'drizzle-orm';
import { generateFinancialSummary } from '@/lib/ai';
import AnalyticsClient from './AnalyticsClient';

async function getAnalysisData(userId: string) {
  // Get all accounts for this user
  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (userAccounts.length === 0) {
    return null;
  }

  const accountIds = userAccounts.map(a => a.id);

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

  if (userTransactions.length === 0) {
    return null;
  }

  // Aggregate totals per month
  const monthlyBreakdown: Record<string, { income: number; expenses: number }> = {};

  for (const txn of userTransactions) {
    const month = new Date(txn.date).toISOString().slice(0, 7);
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

  const monthlyData = Object.entries(monthlyBreakdown).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
  }));

  // Aggregate totals per category
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

  const topCategory = categoryData[0]?.category || 'N/A';

  // Detect anomalies
  const categoryAverages: Record<string, { sum: number; count: number }> = {};

  for (const txn of userTransactions) {
    const amount = Math.abs(parseFloat(txn.amount));
    
    if (!categoryAverages[txn.category]) {
      categoryAverages[txn.category] = { sum: 0, count: 0 };
    }
    
    categoryAverages[txn.category].sum += amount;
    categoryAverages[txn.category].count += 1;
  }

  const anomalies = [];
  for (const txn of userTransactions) {
    const amount = Math.abs(parseFloat(txn.amount));
    const categoryAvg = categoryAverages[txn.category].sum / categoryAverages[txn.category].count;
    
    if (amount > categoryAvg * 2.5 || txn.isAnomaly) {
      anomalies.push({
        merchant: txn.merchant,
        amount,
        date: txn.date,
        reason: txn.isAnomaly 
          ? 'Flagged as anomaly' 
          : `${(amount / categoryAvg).toFixed(1)}x higher than average ${txn.category} transaction`,
      });
    }
  }

  // Calculate totals
  const totalIncome = userTransactions
    .filter(t => parseFloat(t.amount) > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = userTransactions
    .filter(t => parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  const netChange = totalIncome - totalExpenses;

  // Generate AI summary
  const insights = await generateFinancialSummary({
    totalIncome,
    totalExpenses,
    netChange,
    topCategory,
    monthlyBreakdown: monthlyData,
    categoryBreakdown: categoryData,
    anomalies,
  });

  return {
    totals: {
      income: totalIncome,
      expenses: totalExpenses,
      netChange,
    },
    monthlyBreakdown: monthlyData,
    categoryBreakdown: categoryData,
    anomalies,
    insights,
    topCategory,
  };
}

export default async function GraphAnalysisPage() {
  const user = await requireUser();
  
  let analysisData;
  try {
    analysisData = await getAnalysisData(user.id);
  } catch (error) {
    console.error('Error loading analysis:', error);
    analysisData = null;
  }

  return <AnalyticsClient analysis={analysisData} />;
}
