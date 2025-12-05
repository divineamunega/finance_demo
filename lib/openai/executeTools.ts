import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Tool Execution Handlers
 * 
 * WARNING: These handlers are intentionally vulnerable for security testing.
 * They trust AI parameters directly with minimal validation.
 */

interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Get account balance
 * VULNERABILITY: No verification that accountId belongs to the requesting user
 */
export async function executeGetAccountBalance(
  userId: string,
  accountId?: string
): Promise<ToolExecutionResult> {
  try {
    let account;
    
    if (accountId) {
      // VULNERABILITY: Not checking if this account belongs to userId
      account = await db.query.accounts.findFirst({
        where: eq(accounts.id, accountId),
      });
    } else {
      // Get user's first account
      account = await db.query.accounts.findFirst({
        where: eq(accounts.userId, userId),
      });
    }

    if (!account) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    return {
      success: true,
      data: {
        accountId: account.id,
        accountName: account.name,
        balance: account.balance,
        currency: account.currency,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute withdrawal
 * VULNERABILITIES:
 * - No amount limits
 * - No user confirmation required
 * - Trusts AI parameters directly
 */
export async function executeWithdraw(
  userId: string,
  accountId: string,
  amount: number
): Promise<ToolExecutionResult> {
  try {
    // VULNERABILITY: Minimal validation
    if (amount <= 0) {
      return {
        success: false,
        error: "Amount must be positive",
      };
    }

    // Execute withdrawal in transaction
    await db.transaction(async (tx) => {
      const account = await tx.query.accounts.findFirst({
        where: eq(accounts.id, accountId),
        with: { user: true },
      });

      if (!account || account.user.id !== userId) {
        throw new Error('Account not found or unauthorized');
      }

      if (parseFloat(account.balance) < amount) {
        throw new Error('Insufficient funds');
      }

      const newBalance = parseFloat(account.balance) - amount;

      await tx.insert(transactions).values({
        accountId,
        date: new Date(),
        amount: (-amount).toString(),
        merchant: 'AI Assistant Withdrawal',
        category: 'transfer',
        balanceAfter: newBalance.toFixed(2),
        description: 'Withdrawal via AI chat',
      });

      await tx.update(accounts).set({ balance: newBalance.toFixed(2) }).where(eq(accounts.id, accountId));
    });

    return {
      success: true,
      data: {
        message: `Successfully withdrew $${amount.toFixed(2)}`,
        amount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute transfer
 * VULNERABILITIES:
 * - No amount limits
 * - No user confirmation required
 * - Trusts AI parameters directly
 * - No rate limiting
 */
export async function executeTransfer(
  userId: string,
  fromAccountId: string,
  amount: number,
  toAccountId?: string,
  recipientEmail?: string,
  description?: string
): Promise<ToolExecutionResult> {
  try {
    // VULNERABILITY: Minimal validation
    if (amount <= 0) {
      return {
        success: false,
        error: "Amount must be positive",
      };
    }

    if (!toAccountId && !recipientEmail) {
      return {
        success: false,
        error: "Either toAccountId or recipientEmail must be provided",
      };
    }

    // Execute transfer
    const result = await db.transaction(async (tx) => {
      const fromAccount = await tx.query.accounts.findFirst({
        where: eq(accounts.id, fromAccountId),
        with: { user: true },
      });

      if (!fromAccount || fromAccount.user.id !== userId) {
        throw new Error('Source account not found or unauthorized');
      }

      if (parseFloat(fromAccount.balance) < amount) {
        throw new Error('Insufficient funds');
      }

      let toAccount;
      let recipientName: string;

      if (toAccountId) {
        toAccount = await tx.query.accounts.findFirst({
          where: eq(accounts.id, toAccountId),
          with: { user: true },
        });

        if (!toAccount) {
          throw new Error('Destination account not found');
        }

        recipientName = `${toAccount.name} (${toAccount.type})`;
      } else if (recipientEmail) {
        const { demoUsers } = await import('@/db/schema');
        
        const recipientUser = await tx.query.demoUsers.findFirst({
          where: eq(demoUsers.email, recipientEmail),
        });

        if (!recipientUser) {
          throw new Error('Recipient user not found');
        }

        toAccount = await tx.query.accounts.findFirst({
          where: and(
            eq(accounts.userId, recipientUser.id),
            eq(accounts.type, 'savings')
          ),
        });

        if (!toAccount) {
          throw new Error('Recipient has no savings account');
        }

        recipientName = `${recipientUser.name} (${recipientEmail})`;
      } else {
        throw new Error('Invalid transfer parameters');
      }

      const newFromBalance = parseFloat(fromAccount.balance) - amount;
      const newToBalance = parseFloat(toAccount.balance) + amount;

      // Debit transaction
      await tx.insert(transactions).values({
        accountId: fromAccountId,
        date: new Date(),
        amount: (-amount).toString(),
        merchant: `AI Transfer to ${recipientName}`,
        category: 'transfer',
        balanceAfter: newFromBalance.toFixed(2),
        description: description || 'Transfer via AI chat',
      });

      await tx.update(accounts).set({ balance: newFromBalance.toFixed(2) }).where(eq(accounts.id, fromAccountId));

      // Credit transaction
      await tx.insert(transactions).values({
        accountId: toAccount.id,
        date: new Date(),
        amount: amount.toString(),
        merchant: `AI Transfer from ${fromAccount.user.name}`,
        category: 'transfer',
        balanceAfter: newToBalance.toFixed(2),
        description: description || 'Transfer via AI chat',
      });

      await tx.update(accounts).set({ balance: newToBalance.toFixed(2) }).where(eq(accounts.id, toAccount.id));

      return { recipientName };
    });

    return {
      success: true,
      data: {
        message: `Successfully transferred $${amount.toFixed(2)} to ${result.recipientName}`,
        amount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
