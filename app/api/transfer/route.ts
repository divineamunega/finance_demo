import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireSessionUser } from '@/lib/session';


export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { fromAccountId, toAccountId, amount, description } = await request.json() as {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description: string;
    };

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      const fromAccount = await tx.query.accounts.findFirst({
        where: eq(accounts.id, fromAccountId),
        with: { user: true },
      });

      if (!fromAccount || fromAccount.user.id !== user.id) {
        throw new Error('You can only transfer from your own accounts');
      }

      const toAccount = await tx.query.accounts.findFirst({
        where: eq(accounts.id, toAccountId),
      });

      if (!toAccount) {
        throw new Error('To account not found');
      }

      if (parseFloat(fromAccount.balance) < amount) {
        throw new Error('Insufficient funds');
      }

      const debitAmount = -amount;
      const newFromBalance = parseFloat(fromAccount.balance) + debitAmount;
      const newToBalance = parseFloat(toAccount.balance) + amount;

      // Debit transaction
      await tx.insert(transactions).values({
        accountId: fromAccountId,
        date: new Date(),
        amount: debitAmount.toString(),
        merchant: `Transfer to ${toAccount.name}`,
        category: 'transfer',
        balanceAfter: newFromBalance.toFixed(2),
        description,
      });

      await tx.update(accounts).set({ balance: newFromBalance.toFixed(2) }).where(eq(accounts.id, fromAccountId));

      // Credit transaction
      await tx.insert(transactions).values({
        accountId: toAccountId,
        date: new Date(),
        amount: amount.toString(),
        merchant: `Transfer from ${fromAccount.name}`,
        category: 'transfer',
        balanceAfter: newToBalance.toFixed(2),
        description,
      });

      await tx.update(accounts).set({ balance: newToBalance.toFixed(2) }).where(eq(accounts.id, toAccountId));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}