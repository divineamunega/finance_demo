import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireSessionUser } from '@/lib/session';


export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { accountId, amount } = await request.json() as {
      accountId: string;
      amount: number;
    };

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      const account = await tx.query.accounts.findFirst({
        where: eq(accounts.id, accountId),
        with: { user: true },
      });

      if (!account || account.user.id !== user.id) {
        throw new Error('You can only deposit to your own accounts');
      }

      const newBalance = parseFloat(account.balance) + amount;


      await tx.insert(transactions).values({

        accountId,
        date: new Date(),
        amount: amount.toString(),
        merchant: 'Deposit',
        category: 'income',
        balanceAfter: newBalance.toFixed(2),
        description: 'External deposit',
      });

      await tx.update(accounts).set({ balance: newBalance.toFixed(2) }).where(eq(accounts.id, accountId));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}