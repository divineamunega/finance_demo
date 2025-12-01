import { NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, demoUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser } from '@/lib/session';
import type { Account, DemoUser } from '@/lib/types';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAccounts = await db.query.accounts.findMany({
      where: eq(accounts.userId, user.id),
    });

    return NextResponse.json({ user, accounts: userAccounts });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}