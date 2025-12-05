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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div 
          className="px-4 py-3 rounded-md text-sm"
          style={{ 
            background: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)'
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Account
        </label>
        <select 
          name="accountId" 
          required 
          disabled={loading}
          className="w-full px-3 py-2.5 rounded-md text-sm transition-colors disabled:opacity-50"
          style={{ 
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
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
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Amount
        </label>
        <input 
          type="number" 
          name="amount" 
          step="0.01" 
          min="0.01" 
          required 
          disabled={loading}
          placeholder="0.00"
          className="w-full px-3 py-2.5 rounded-md text-sm font-mono transition-colors disabled:opacity-50"
          style={{ 
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all disabled:opacity-50"
            style={{ 
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)'
            }}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ 
            background: 'var(--color-danger)',
            color: '#FFFFFF'
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            'Withdraw'
          )}
        </button>
      </div>
    </form>
  );
}
