'use client';

import { useState } from 'react';

interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
}

interface FormWithdrawProps {
  accounts: Account[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FormWithdraw({ accounts, onSuccess, onCancel }: FormWithdrawProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const accountId = formData.get('accountId') as string;
    const amount = parseFloat(formData.get('amount') as string);

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, amount }),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/';
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Account</label>
        <select 
          name="accountId" 
          required 
          disabled={loading}
          className="w-full p-3 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type}) - ${acc.balance}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Amount</label>
        <input 
          type="number" 
          name="amount" 
          step="0.01" 
          min="0.01" 
          required 
          disabled={loading}
          placeholder="0.00"
          className="w-full p-3 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed" 
        />
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            'Withdraw Money'
          )}
        </button>
      </div>
    </form>
  );
}
