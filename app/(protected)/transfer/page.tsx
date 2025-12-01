import { requireUser } from '@/lib/session';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { FormTransfer } from '@/components/FormTransfer';

interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
}

export default async function TransferPage() {
  const user = await requireUser();
  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, user.id),
  });

  const accountsList: Account[] = userAccounts.map(acc => ({
    id: acc.id,
    name: acc.name,
    balance: acc.balance,
    type: acc.type,
  }));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transfer Money</h1>
          <p className="text-gray-600 mt-1">Move money between your accounts</p>
        </div>
        <FormTransfer accounts={accountsList} />
      </div>
    </div>
  );
}
