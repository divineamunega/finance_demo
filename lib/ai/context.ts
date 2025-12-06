import { db } from '@/db';
import { accounts, transactions, summaries } from '@/db/schema';
import { eq, desc, and, gte, inArray } from 'drizzle-orm';

/**
 * Fetches financial context for a user to provide to the AI
 */
export async function getFinancialContext(userId: string): Promise<string> {
  // Get user's accounts
  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  // Get recent transactions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let recentTransactions: any[] = [];
  if (userAccounts.length > 0) {
    const accountIds = userAccounts.map(a => a.id);
    recentTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          inArray(transactions.accountId, accountIds),
          gte(transactions.date, thirtyDaysAgo)
        )
      )
      .orderBy(desc(transactions.date))
      .limit(20);
  }

  // Get latest summary if available
  const latestSummary = await db
    .select()
    .from(summaries)
    .where(eq(summaries.userId, userId))
    .orderBy(desc(summaries.createdAt))
    .limit(1);

  // Build context string
  const contextParts: string[] = [];

  // Add account information
  if (userAccounts.length > 0) {
    const accountsInfo = userAccounts.map(acc => 
      `${acc.name} (${acc.type}): $${acc.balance}`
    ).join(', ');
    contextParts.push(`User's accounts: ${accountsInfo}`);
  }

  // Add recent transactions summary
  if (recentTransactions.length > 0) {
    const totalSpent = recentTransactions
      .filter(t => parseFloat(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    
    const totalIncome = recentTransactions
      .filter(t => parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    contextParts.push(
      `Recent activity (last 30 days): ${recentTransactions.length} transactions, ` +
      `$${totalSpent.toFixed(2)} spent, $${totalIncome.toFixed(2)} income`
    );

    // Add top spending categories
    const categoryTotals: Record<string, number> = {};
    recentTransactions
      .filter(t => parseFloat(t.amount) < 0)
      .forEach(t => {
        const amount = Math.abs(parseFloat(t.amount));
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(', ');

    if (topCategories) {
      contextParts.push(`Top spending categories: ${topCategories}`);
    }
  }

  // Add latest insights if available
  if (latestSummary.length > 0 && latestSummary[0].insights) {
    contextParts.push(`Recent insights: ${latestSummary[0].insights.slice(0, 200)}...`);
  }

  return contextParts.join('\n');
}
