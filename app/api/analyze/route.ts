import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions, summaries } from '@/db/schema';
import { eq, inArray, and, gte } from 'drizzle-orm';
import { generateFinancialSummary } from '@/lib/ai';
import { requireSessionUser } from '@/lib/session';

/**
 * POST /api/analyze
 * Performs comprehensive financial analysis for a user:
 * - Categorizes transactions using OpenAI (optional enhancement)
 * - Aggregates totals per month and category
 * - Detects anomalies using local heuristics
 * - Generates natural language summary via OpenAI
 * - Stores summary in database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const userId = user.id;

    // Get all accounts for this user
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    if (userAccounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No accounts found for this user',
        },
        { status: 404 }
      );
    }

    const accountIds = userAccounts.map(a => a.id);

    // Get all transactions for user's accounts
    // For analysis, we'll look at the last 6 months
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
      return NextResponse.json(
        {
          success: false,
          error: 'No transactions found for analysis',
        },
        { status: 404 }
      );
    }

    // ===== AGGREGATE TOTALS PER MONTH =====
    const monthlyBreakdown: Record<string, { income: number; expenses: number }> = {};

    for (const txn of userTransactions) {
      const month = new Date(txn.date).toISOString().slice(0, 7); // YYYY-MM format
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

    // Convert to array for easier processing
    const monthlyData = Object.entries(monthlyBreakdown).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
    }));

    // ===== AGGREGATE TOTALS PER CATEGORY =====
    const categoryBreakdown: Record<string, number> = {};

    for (const txn of userTransactions) {
      const amount = parseFloat(txn.amount);
      
      // Only count expenses for category breakdown
      if (amount < 0) {
        if (!categoryBreakdown[txn.category]) {
          categoryBreakdown[txn.category] = 0;
        }
        categoryBreakdown[txn.category] += Math.abs(amount);
      }
    }

    // Convert to array and sort by total descending
    const categoryData = Object.entries(categoryBreakdown)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    const topCategory = categoryData[0]?.category || 'N/A';

    // ===== DETECT ANOMALIES (LOCAL HEURISTIC) =====
    // Anomaly detection: transactions that are significantly higher than average for their category
    const categoryAverages: Record<string, { sum: number; count: number }> = {};

    // Calculate average per category
    for (const txn of userTransactions) {
      const amount = Math.abs(parseFloat(txn.amount));
      
      if (!categoryAverages[txn.category]) {
        categoryAverages[txn.category] = { sum: 0, count: 0 };
      }
      
      categoryAverages[txn.category].sum += amount;
      categoryAverages[txn.category].count += 1;
    }

    // Detect anomalies: transactions > 2.5x category average
    const anomalies = [];
    for (const txn of userTransactions) {
      const amount = Math.abs(parseFloat(txn.amount));
      const categoryAvg = categoryAverages[txn.category].sum / categoryAverages[txn.category].count;
      
      // Flag as anomaly if amount is > 2.5x average OR if already flagged in DB
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

    // ===== CALCULATE TOTALS =====
    const totalIncome = userTransactions
      .filter(t => parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = userTransactions
      .filter(t => parseFloat(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

    const netChange = totalIncome - totalExpenses;

    // ===== GENERATE AI SUMMARY =====
    const insights = await generateFinancialSummary({
      totalIncome,
      totalExpenses,
      netChange,
      topCategory,
      monthlyBreakdown: monthlyData,
      categoryBreakdown: categoryData,
      anomalies,
    });

    // ===== STORE SUMMARY IN DATABASE =====
    const now = new Date();
    const summary = await db.insert(summaries).values({
      userId,
      period: 'last_6_months',
      startDate: sixMonthsAgo,
      endDate: now,
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netChange: netChange.toFixed(2),
      topCategory,
      insights,
    }).returning();

    // ===== RETURN ANALYSIS RESULTS =====
    return NextResponse.json({
      success: true,
      data: {
        userId,
        period: {
          start: sixMonthsAgo,
          end: now,
        },
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
        summaryId: summary[0].id,
      },
    });
  } catch (error) {
    console.error('Error analyzing transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
