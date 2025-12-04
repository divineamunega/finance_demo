import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions, demoUsers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireSessionUser } from '@/lib/session';


export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const body = await request.json() as {
      fromAccountId: string;
      toAccountId?: string;
      recipientEmail?: string;
      amount: number;
      description?: string;
    };

    const { fromAccountId, toAccountId, recipientEmail, amount, description } = body;

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Validate that either toAccountId or recipientEmail is provided, but not both
    if (!toAccountId && !recipientEmail) {
      return NextResponse.json({ error: 'Either toAccountId or recipientEmail must be provided' }, { status: 400 });
    }

    if (toAccountId && recipientEmail) {
      return NextResponse.json({ error: 'Cannot specify both toAccountId and recipientEmail' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      // Verify from account belongs to user
      const fromAccount = await tx.query.accounts.findFirst({
        where: eq(accounts.id, fromAccountId),
        with: { user: true },
      });

      if (!fromAccount || fromAccount.user.id !== user.id) {
        throw new Error('You can only transfer from your own accounts');
      }

      if (parseFloat(fromAccount.balance) < amount) {
        throw new Error('Insufficient funds');
      }

      let toAccount;
      let recipientName: string;

      if (toAccountId) {
        // Transfer between own accounts
        toAccount = await tx.query.accounts.findFirst({
          where: eq(accounts.id, toAccountId),
          with: { user: true },
        });

        if (!toAccount) {
          throw new Error('Destination account not found');
        }

        if (toAccount.userId !== user.id) {
          throw new Error('You can only transfer to your own accounts');
        }

        if (fromAccountId === toAccountId) {
          throw new Error('Cannot transfer to the same account');
        }

        recipientName = `${toAccount.name} (${toAccount.type})`;
      } else {
        // Transfer to another user
        if (!recipientEmail || !recipientEmail.includes('@')) {
          throw new Error('Valid recipient email required');
        }

        const recipientUser = await tx.query.demoUsers.findFirst({
          where: eq(demoUsers.email, recipientEmail),
        });

        if (!recipientUser) {
          throw new Error('Recipient user not found');
        }

        if (recipientUser.id === user.id) {
          throw new Error('Cannot transfer to yourself. Use account-to-account transfer instead.');
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
      }

      const debitAmount = -amount;
      const newFromBalance = parseFloat(fromAccount.balance) + debitAmount;
      const newToBalance = parseFloat(toAccount.balance) + amount;

      // Debit transaction
      await tx.insert(transactions).values({
        accountId: fromAccountId,
        date: new Date(),
        amount: debitAmount.toString(),
        merchant: `Transfer to ${recipientName}`,
        category: 'transfer',
        balanceAfter: newFromBalance.toFixed(2),
        description,
      });

      await tx.update(accounts).set({ balance: newFromBalance.toFixed(2) }).where(eq(accounts.id, fromAccountId));

      // Credit transaction
      await tx.insert(transactions).values({
        accountId: toAccount.id,
        date: new Date(),
        amount: amount.toString(),
        merchant: `Transfer from ${user.name} (${fromAccount.name})`,
        category: 'transfer',
        balanceAfter: newToBalance.toFixed(2),
        description,
      });

      await tx.update(accounts).set({ balance: newToBalance.toFixed(2) }).where(eq(accounts.id, toAccount.id));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}