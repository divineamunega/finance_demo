// Load .env.local file FIRST before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now import everything else
import { db } from './index';
import { demoUsers, accounts, transactions, messages, summaries } from './schema';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

// Demo user data
const DEMO_USERS = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@demo.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    password: '1234',
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@demo.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    password: 'pass',
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@demo.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    password: 'demo',
  },
];

// Realistic merchants by category
const MERCHANTS: Record<string, string[]> = {
  groceries: ['Whole Foods Market', 'Trader Joe\'s', 'Safeway', 'Kroger', 'Target Grocery'],
  dining: ['Starbucks', 'Chipotle', 'Panera Bread', 'Local Diner', 'Subway', 'McDonald\'s'],
  utilities: ['PG&E Electric', 'City Water Dept', 'Comcast Internet', 'AT&T Mobile'],
  entertainment: ['Netflix', 'Spotify Premium', 'AMC Theaters', 'Steam Games', 'Apple Music'],
  shopping: ['Amazon.com', 'Target', 'Best Buy', 'Macy\'s', 'Home Depot', 'IKEA'],
  transportation: ['Shell Gas Station', 'Uber', 'Lyft', 'Bay Area Transit', 'Parking Meter'],
  healthcare: ['CVS Pharmacy', 'Kaiser Permanente', 'Dental Care', 'Blue Cross Insurance'],
  income: ['Payroll Deposit', 'Freelance Client', 'Dividend Payment', 'Bonus Payment'],
  transfer: ['Savings Transfer', 'Investment Transfer', 'Account Transfer'],
  investment: ['Vanguard ETF', 'Stock Purchase', 'Mutual Fund', 'Dividend Reinvestment'],
};

function getRandomMerchant(category: string): string {
  const merchantList = MERCHANTS[category] || ['Generic Merchant'];
  return faker.helpers.arrayElement(merchantList);
}

// Realistic transaction amounts
function generateTransactionAmount(category: string, isSarah: boolean = false): number {
  // Sarah has a professional salary, so adjust ranges accordingly
  const ranges: Record<string, [number, number]> = isSarah ? {
    groceries: [45, 180],
    dining: [15, 95],
    utilities: [80, 250],
    entertainment: [12, 85],
    shopping: [30, 450],
    transportation: [25, 120],
    healthcare: [50, 600],
    income: [3500, 4200], // Monthly salary ~$4000
    transfer: [200, 1500],
    investment: [300, 2000],
  } : {
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

// Generate realistic transactions for Sarah since June 2024
async function generateSarahTransactions(accountId: string, startDate: Date) {
  const transactionsList = [];
  const startBalance = 5000; // Starting balance in June 2024
  let currentBalance = startBalance;
  let currentDate = new Date(startDate);
  const today = new Date();

  // Track monthly salary
  let lastSalaryMonth = -1;
  let monthlySpending = 0;
  const monthlyBudget = 3200; // Spend less than salary

  while (currentDate <= today) {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Reset monthly spending on the 1st
    if (currentDate.getDate() === 1) {
      monthlySpending = 0;
    }
    
    // Monthly salary on the 1st of each month
    if (currentMonth !== lastSalaryMonth && currentDate.getDate() === 1) {
      const salary = 4000 + faker.number.float({ min: -100, max: 100, fractionDigits: 2 });
      currentBalance += salary;
      transactionsList.push({
        accountId,
        date: new Date(currentDate),
        amount: salary.toFixed(2),
        merchant: 'Payroll Deposit',
        category: 'income',
        balanceAfter: currentBalance.toFixed(2),
        isAnomaly: false,
        description: 'Monthly salary',
      });
      lastSalaryMonth = currentMonth;
    }

    // Regular daily transactions (1-4 per day, realistic)
    const transactionsPerDay = faker.number.int({ min: 1, max: 4 });
    
    for (let i = 0; i < transactionsPerDay; i++) {
      // Stop spending if we've hit monthly budget
      if (monthlySpending >= monthlyBudget) {
        break;
      }

      // Realistic spending patterns
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let category: string;
      const rand = Math.random();
      
      if (rand < 0.30) {
        // 30% groceries
        category = 'groceries';
      } else if (rand < 0.50) {
        // 20% dining
        category = 'dining';
      } else if (rand < 0.65) {
        // 15% shopping
        category = 'shopping';
      } else if (rand < 0.78) {
        // 13% transportation
        category = 'transportation';
      } else if (rand < 0.88) {
        // 10% entertainment
        category = 'entertainment';
      } else if (rand < 0.93) {
        // 5% utilities (monthly bills, first week of month)
        if (currentDate.getDate() <= 7) {
          category = 'utilities';
        } else {
          category = 'groceries';
        }
      } else {
        // 7% healthcare
        category = 'healthcare';
      }

      let amount = generateTransactionAmount(category, true);
      
      // Cap spending to avoid overspending
      const remainingBudget = monthlyBudget - monthlySpending;
      if (amount > remainingBudget) {
        amount = Math.min(amount, remainingBudget * 0.8);
      }
      
      // Skip very small transactions
      if (amount < 5) {
        continue;
      }

      const signedAmount = -amount; // Expenses are negative
      currentBalance += signedAmount;
      monthlySpending += amount;

      // Occasional anomalies (large purchases)
      const isAnomaly = amount > 350;

      transactionsList.push({
        accountId,
        date: new Date(currentDate.getTime() + i * 3600000),
        amount: signedAmount.toFixed(2),
        merchant: getRandomMerchant(category),
        category,
        balanceAfter: currentBalance.toFixed(2),
        isAnomaly,
        description: isAnomaly ? 'Large purchase' : null,
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { transactionsList, finalBalance: currentBalance };
}

// Generate standard transactions for other users
async function generateTransactions(accountId: string, accountType: string, startBalance: number) {
  const transactionsList = [];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  let currentBalance = startBalance;
  let currentDate = new Date(sixMonthsAgo);
  const today = new Date();

  while (currentDate <= today) {
    const transactionsPerDay = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < transactionsPerDay; i++) {
      let isCredit: boolean;
      if (accountType === 'investment') {
        isCredit = faker.number.float({ min: 0, max: 1 }) < 0.7;
      } else if (accountType === 'savings') {
        isCredit = faker.number.float({ min: 0, max: 1 }) < 0.6;
      } else {
        isCredit = faker.number.float({ min: 0, max: 1 }) < 0.3;
      }
      
      let category: string;
      if (accountType === 'checking') {
        category = isCredit 
          ? faker.helpers.arrayElement(['income', 'transfer'])
          : faker.helpers.arrayElement(['groceries', 'dining', 'utilities', 'entertainment', 'shopping', 'transportation']);
      } else if (accountType === 'savings') {
        category = isCredit
          ? faker.helpers.arrayElement(['income', 'transfer', 'investment'])
          : faker.helpers.arrayElement(['transfer']);
      } else {
        category = isCredit
          ? faker.helpers.arrayElement(['investment', 'income', 'transfer'])
          : faker.helpers.arrayElement(['transfer']);
      }

      const amount = generateTransactionAmount(category);
      const signedAmount = isCredit ? amount : -amount;
      currentBalance += signedAmount;

      const isAnomaly = faker.number.float({ min: 0, max: 1 }) < 0.05;

      transactionsList.push({
        accountId,
        date: new Date(currentDate.getTime() + i * 3600000),
        amount: signedAmount.toFixed(2),
        merchant: getRandomMerchant(category),
        category,
        balanceAfter: currentBalance.toFixed(2),
        isAnomaly,
        description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { transactionsList, finalBalance: currentBalance };
}

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(transactions);
    await db.delete(summaries);
    await db.delete(messages);
    await db.delete(accounts);
    await db.delete(demoUsers);

    // Create demo users
    console.log('Creating demo users...');
    const createdUsers = await db.insert(demoUsers).values(DEMO_USERS).returning();
    console.log(`✓ Created ${createdUsers.length} demo users`);

    // Create accounts for each user
    console.log('Creating accounts...');
    const allAccounts = [];
    
    for (const user of createdUsers) {
      const isSarah = user.email === 'sarah.johnson@demo.com';
      
      const initialBalance = isSarah ? 2500 : faker.number.float({ 
        min: 5000,
        max: 20000,
        fractionDigits: 2 
      });

      const account = await db.insert(accounts).values({
        userId: user.id,
        name: 'Savings Account',
        type: 'savings',
        balance: initialBalance.toFixed(2),
        currency: 'USD',
      }).returning();

      allAccounts.push({ 
        ...account[0], 
        initialBalance,
        isSarah,
        userEmail: user.email 
      });
    }
    console.log(`✓ Created ${allAccounts.length} accounts`);

    // Generate transactions for each account
    console.log('Generating transactions (this may take a moment)...');
    let totalTransactions = 0;
    
    for (const account of allAccounts) {
      let result;
      
      if (account.isSarah) {
        // Sarah's account starts from June 1, 2024
        const sarahStartDate = new Date('2024-06-01');
        console.log('  Generating realistic transactions for Sarah since June 2024...');
        result = await generateSarahTransactions(account.id, sarahStartDate);
      } else {
        // Other users get standard 6-month history
        result = await generateTransactions(
          account.id,
          account.type,
          account.initialBalance
        );
      }
      
      // Insert in batches
      const batchSize = 100;
      for (let i = 0; i < result.transactionsList.length; i += batchSize) {
        const batch = result.transactionsList.slice(i, i + batchSize);
        await db.insert(transactions).values(batch);
      }
      
      totalTransactions += result.transactionsList.length;
      
      // Update account balance
      await db.update(accounts)
        .set({ balance: result.finalBalance.toFixed(2) })
        .where(eq(accounts.id, account.id));
      
      if (account.isSarah) {
        console.log(`  ✓ Sarah's account: ${result.transactionsList.length} transactions, final balance: $${result.finalBalance.toFixed(2)}`);
      }
    }
    console.log(`✓ Generated ${totalTransactions} transactions`);

    // Generate messages for each user
    console.log('Generating messages...');
    const messageTypes = ['info', 'warning', 'alert', 'success'] as const;
    const messageTitles = {
      info: ['Account Update', 'New Feature Available', 'Monthly Statement Ready'],
      warning: ['Unusual Activity Detected', 'Low Balance Warning', 'Upcoming Payment Due'],
      alert: ['Security Alert', 'Action Required', 'Important Notice'],
      success: ['Payment Successful', 'Goal Achieved', 'Transfer Complete'],
    };

    let totalMessages = 0;
    for (const user of createdUsers) {
      const numMessages = faker.number.int({ min: 3, max: 6 });
      const messagesList = [];

      for (let i = 0; i < numMessages; i++) {
        const type = faker.helpers.arrayElement(messageTypes);
        const title = faker.helpers.arrayElement(messageTitles[type]);
        
        messagesList.push({
          userId: user.id,
          title,
          content: faker.lorem.paragraph(),
          type,
          isRead: faker.datatype.boolean(),
        });
      }

      await db.insert(messages).values(messagesList);
      totalMessages += messagesList.length;
    }
    console.log(`✓ Generated ${totalMessages} messages`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSummary:');
    console.log(`  Users: ${createdUsers.length}`);
    console.log(`  Accounts: ${allAccounts.length}`);
    console.log(`  Transactions: ${totalTransactions}`);
    console.log(`  Messages: ${totalMessages}`);
    console.log('\n📊 Sarah\'s account has realistic data from June 2024 to present!');

  } catch (error) {
    console.error('❌ Seed failed!');
    console.error(error);
    process.exit(1);
  }
}

main();
