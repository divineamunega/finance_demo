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

// Account types
const ACCOUNT_TYPES = ['checking', 'savings', 'investment'] as const;

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

async function generateTransactions(accountId: string, accountType: string, startBalance: number) {
  const transactionsList = [];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  let currentBalance = startBalance;
  let currentDate = new Date(sixMonthsAgo);
  const today = new Date();

  while (currentDate <= today) {
    // Generate 1-3 transactions per day
    const transactionsPerDay = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < transactionsPerDay; i++) {
      // Determine if this is income/credit or expense/debit
      // Investment accounts should have more credits to grow over time
      let isCredit: boolean;
      if (accountType === 'investment') {
        isCredit = faker.number.float({ min: 0, max: 1 }) < 0.7; // 70% chance of credit for investments
      } else if (accountType === 'savings') {
        isCredit = faker.number.float({ min: 0, max: 1 }) < 0.6; // 60% chance of credit for savings
      } else {
        isCredit = faker.number.float({ min: 0, max: 1 }) < 0.3; // 30% chance of credit for checking
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
      } else { // investment
        category = isCredit
          ? faker.helpers.arrayElement(['investment', 'income', 'transfer'])
          : faker.helpers.arrayElement(['transfer']);
      }

      const amount = generateTransactionAmount(category);
      const signedAmount = isCredit ? amount : -amount;
      currentBalance += signedAmount;

      // 5% chance of anomaly
      const isAnomaly = faker.number.float({ min: 0, max: 1 }) < 0.05;

      transactionsList.push({
        accountId,
        date: new Date(currentDate.getTime() + i * 3600000), // Spread throughout the day
        amount: signedAmount.toFixed(2),
        merchant: getRandomMerchant(category),
        category,
        balanceAfter: currentBalance.toFixed(2),
        isAnomaly,
        description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return transactionsList;
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
      // Each user gets exactly one savings account
      const initialBalance = faker.number.float({ 
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

      allAccounts.push({ ...account[0], initialBalance });
    }
    console.log(`✓ Created ${allAccounts.length} accounts`);

    // Generate transactions for each account
    console.log('Generating transactions (this may take a moment)...');
    let totalTransactions = 0;
    for (const account of allAccounts) {
      const transactionsList = await generateTransactions(
        account.id,
        account.type,
        account.initialBalance
      );
      
      // Insert in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < transactionsList.length; i += batchSize) {
        const batch = transactionsList.slice(i, i + batchSize);
        await db.insert(transactions).values(batch);
      }
      
      totalTransactions += transactionsList.length;
      
      // Update account balance to match last transaction
      if (transactionsList.length > 0) {
        const lastTransaction = transactionsList[transactionsList.length - 1];
        await db.update(accounts)
          .set({ balance: lastTransaction.balanceAfter })
          .where(eq(accounts.id, account.id));
      }
    }
    console.log(`✓ Generated ${totalTransactions} transactions`);

    // Todos removed as per requirements

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

  } catch (error) {
    console.error('❌ Seed failed!');
    console.error(error);
    process.exit(1);
  }
}

main();
