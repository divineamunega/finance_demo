'use client';

interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
}

interface FormTransferProps {
  accounts: Account[];
}

export function FormTransfer({ accounts }: FormTransferProps) {
  const handleSubmit = async (formData: FormData) => {
    const fromAccountId = formData.get('fromAccountId') as string;
    const toAccountId = formData.get('toAccountId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    const response = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAccountId, toAccountId, amount, description }),
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      // Handle error
      console.error('Transfer failed');
    }
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">From Account</label>
        <select name="fromAccountId" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
          <option value="">Select from account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type}) - ${acc.balance}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">To Account</label>
        <select name="toAccountId" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
          <option value="">Select to account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <input type="number" name="amount" step="0.01" min="0.01" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
        <input type="text" name="description" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all">
        Transfer Money
      </button>
    </form>
  );
}
