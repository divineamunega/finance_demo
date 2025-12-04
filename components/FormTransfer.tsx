'use client';

import { useState } from 'react';

interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
}

interface FormTransferProps {
  accounts: Account[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

type TransferMode = 'own-accounts' | 'other-user';

export function FormTransfer({ accounts, onSuccess, onCancel }: FormTransferProps) {
  const [mode, setMode] = useState<TransferMode>('own-accounts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    try {
      let requestBody: any = { amount, description };

      if (mode === 'own-accounts') {
        const fromAccountId = formData.get('fromAccountId') as string;
        const toAccountId = formData.get('toAccountId') as string;

        if (fromAccountId === toAccountId) {
          setError('Cannot transfer to the same account');
          setLoading(false);
          return;
        }

        requestBody = { ...requestBody, fromAccountId, toAccountId };
      } else {
        const fromAccountId = formData.get('fromAccountId') as string;
        const recipientEmail = formData.get('recipientEmail') as string;
        requestBody = { ...requestBody, fromAccountId, recipientEmail };
      }

      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/';
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Transfer failed');
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

      {/* Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Transfer Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('own-accounts')}
            disabled={loading}
            className={`p-3 rounded-xl border-2 transition-all font-semibold ${
              mode === 'own-accounts'
                ? 'border-blue-600 bg-blue-100 text-blue-900'
                : 'border-gray-400 bg-white text-gray-900 hover:border-gray-500 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            My Accounts
          </button>
          <button
            type="button"
            onClick={() => setMode('other-user')}
            disabled={loading}
            className={`p-3 rounded-xl border-2 transition-all font-semibold ${
              mode === 'other-user'
                ? 'border-blue-600 bg-blue-100 text-blue-900'
                : 'border-gray-400 bg-white text-gray-900 hover:border-gray-500 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Another User
          </button>
        </div>
      </div>

      {/* From Account */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">From Account</label>
        <select
          name="fromAccountId"
          required
          disabled={loading}
          className="w-full p-3 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type}) - ${acc.balance}
            </option>
          ))}
        </select>
      </div>

      {/* To Account or Recipient Email */}
      {mode === 'own-accounts' ? (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">To Account</label>
          <select
            name="toAccountId"
            required
            disabled={loading}
            className="w-full p-3 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select account</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Recipient Email</label>
          <input
            type="email"
            name="recipientEmail"
            required
            disabled={loading}
            placeholder="recipient@example.com"
            className="w-full p-3 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Amount */}
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
          className="w-full p-3 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description (optional)</label>
        <input
          type="text"
          name="description"
          disabled={loading}
          placeholder="What's this transfer for?"
          className="w-full p-3 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Action Buttons */}
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
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            'Transfer Money'
          )}
        </button>
      </div>
    </form>
  );
}
