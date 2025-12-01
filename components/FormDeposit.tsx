'use client';

interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
}

interface FormDepositProps {
  accounts: Account[];
}

export function FormDeposit({ accounts }: FormDepositProps) {
  const handleSubmit = async (formData: FormData) => {
    const accountId = formData.get('accountId') as string;
    const amount = parseFloat(formData.get('amount') as string);

    const response = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, amount }),
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      // Handle error
      console.error('Deposit failed');
      alert('Deposit failed');
    }
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
        <select name="accountId" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
          <option value="">Select account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type}) - ${acc.balance}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <input type="number" name="amount" step="0.01" min="0.01" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all">
        Deposit Money
      </button>
    </form>
  );
}
