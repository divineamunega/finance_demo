import { requireUser } from '@/lib/session';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { FormDeposit } from '@/components/FormDeposit';

interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
}

export default async function DepositPage() {
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
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deposit Money</h1>
          <p className="text-gray-600 mt-1">Add funds to your account</p>
        </div>
        <FormDeposit accounts={accountsList} />
      </div>
    </div>
  );
}
