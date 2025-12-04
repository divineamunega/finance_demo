// Load .env.local file FIRST before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now import everything else
import { db } from './index';
import { demoUsers, accounts, transactions } from './schema';
import { eq } from 'drizzle-orm';

async function checkData() {
  console.log('🔍 Checking all users data...\n');

  try {
    const allUsers = await db.select().from(demoUsers);
    
    for (const user of allUsers) {
      console.log(`\n📊 ${user.name} (${user.email})`);
      console.log(`   Password: ${user.password}`);
      
      // Check accounts
      const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id));
      console.log(`   Accounts: ${userAccounts.length}`);
      
      for (const account of userAccounts) {
        const balance = parseFloat(account.balance);
        const balanceColor = balance >= 0 ? '✓' : '✗';
        console.log(`   ${balanceColor} ${account.name} (${account.type}): $${balance.toFixed(2)}`);
        
        // Check transaction count
        const accountTransactions = await db.select().from(transactions).where(eq(transactions.accountId, account.id));
        console.log(`      → ${accountTransactions.length} transactions`);
      }
    }

    console.log('\n🎉 Data check complete!');
  } catch (error) {
    console.error('❌ Check failed!');
    console.error(error);
    process.exit(1);
  }
}

checkData();
