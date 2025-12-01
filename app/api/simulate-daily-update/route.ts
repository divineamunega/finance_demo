import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

// Transaction categories
const CATEGORIES = [
  'groceries',
  'dining',
  'utilities',
  'entertainment',
  'shopping',
  'transportation',
  'healthcare',
  'income',
  'transfer',
  'investment',
] as const;

// Merchants by category
const MERCHANTS: Record<string, string[]> = {
  groceries: ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Costco', 'Local Market'],
  dining: ['Starbucks', 'Chipotle', 'Olive Garden', 'Local Cafe', 'Pizza Place'],
  utilities: ['Electric Company', 'Water Utility', 'Internet Provider', 'Gas Company'],
  entertainment: ['Netflix', 'Spotify', 'Movie Theater', 'Concert Venue', 'Gaming Store'],
  shopping: ['Amazon', 'Target', 'Best Buy', 'Clothing Store', 'Home Depot'],
  transportation: ['Gas Station', 'Uber', 'Public Transit', 'Car Service', 'Parking'],
  healthcare: ['Pharmacy', 'Doctor\'s Office', 'Dental Clinic', 'Health Insurance'],
  income: ['Salary Deposit', 'Freelance Payment', 'Investment Return', 'Bonus'],
  transfer: ['Internal Transfer', 'Savings Transfer', 'Investment Transfer'],
  investment: ['Stock Purchase', 'ETF Purchase', 'Mutual Fund', 'Dividend'],
};

function getRandomMerchant(category: string): string {
  const merchantList = MERCHANTS[category] || ['Generic Merchant'];
  return faker.helpers.arrayElement(merchantList);
}

function generateTransactionAmount(category: string): number {
  const ranges: Record<string, [number, number]> = {
    groceries: [20, 150],
    dining: [10, 80],
    utilities: [50, 200],
    entertainment: [10, 100],
    shopping: [25, 300],
    transportation: [5, 60],
    healthcare: [30, 500],
    income: [1000, 5000],
    transfer: [100, 2000],
    investment: [200, 3000],
  };

  const [min, max] = ranges[category] || [10, 100];
  return faker.number.float({ min, max, fractionDigits: 2 });
}

/**
 * POST /api/simulate-daily-update
 * Generates new transactions for all accounts and updates balances
 * Simulates daily financial activity
 */
export async function POST(request: NextRequest) {
  try {
    // Get all accounts
    const allAccounts = await db.select().from(accounts);

    let totalNewTransactions = 0;

    // Generate transactions for each account
    for (const account of allAccounts) {
      // Generate 1-3 transactions for today
      const transactionsToday = faker.number.int({ min: 1, max: 3 });
      const newTransactions = [];

      let currentBalance = parseFloat(account.balance);

      for (let i = 0; i < transactionsToday; i++) {
        // Determine if this is income/credit or expense/debit
        // 30% chance of credit transaction
        const isCredit = faker.number.float({ min: 0, max: 1 }) < 0.3;
        
        // Select category based on account type and transaction direction
        let category: string;
        if (account.type === 'checking') {
          category = isCredit 
            ? faker.helpers.arrayElement(['income', 'transfer'])
            : faker.helpers.arrayElement(['groceries', 'dining', 'utilities', 'entertainment', 'shopping', 'transportation']);
        } else if (account.type === 'savings') {
          category = isCredit
            ? faker.helpers.arrayElement(['income', 'transfer', 'investment'])
            : faker.helpers.arrayElement(['transfer']);
        } else { // investment
          category = faker.helpers.arrayElement(['investment', 'income', 'transfer']);
        }

        const amount = generateTransactionAmount(category);
        const signedAmount = isCredit ? amount : -amount;
        currentBalance += signedAmount;

        // 5% chance of anomaly flag
        const isAnomaly = faker.number.float({ min: 0, max: 1 }) < 0.05;

        const now = new Date();
        // Spread transactions throughout the day
        const transactionTime = new Date(now.getTime() + i * 3600000);

        newTransactions.push({
          accountId: account.id,
          date: transactionTime,
          amount: signedAmount.toFixed(2),
          merchant: getRandomMerchant(category),
          category,
          balanceAfter: currentBalance.toFixed(2),
          isAnomaly,
          description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
        });
      }

      // Insert new transactions into database
      if (newTransactions.length > 0) {
        await db.insert(transactions).values(newTransactions);
        
        // Update account balance
        await db
          .update(accounts)
          .set({ balance: currentBalance.toFixed(2) })
          .where(eq(accounts.id, account.id));

        totalNewTransactions += newTransactions.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Daily update completed successfully',
      data: {
        accountsUpdated: allAccounts.length,
        transactionsCreated: totalNewTransactions,
      },
    });
  } catch (error) {
    console.error('Error simulating daily update:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to simulate daily update',
      },
      { status: 500 }
    );
  }
}
