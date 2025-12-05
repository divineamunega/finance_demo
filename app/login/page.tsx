'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Keep loading state active during navigation
        router.push('/');
      } else {
        setError('Invalid credentials');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: 'var(--color-background)' }}
    >
      <div 
        className="rounded-lg p-10 max-w-md w-full"
        style={{ 
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div className="text-center mb-10">
          <h1 
            className="text-3xl font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            FinancePro
          </h1>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2.5 rounded-md text-sm transition-colors"
              style={{ 
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          <div className="mb-6">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2.5 rounded-md text-sm transition-colors"
              style={{ 
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          {error && (
            <div 
              className="mb-5 p-3 rounded-md text-sm"
              style={{ 
                background: 'var(--color-danger-light)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-6 rounded-md font-medium text-sm transition-all disabled:opacity-50 hover:opacity-90"
            style={{ 
              background: 'var(--color-accent)',
              color: '#FFFFFF'
            }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p 
          className="text-center text-xs mt-8"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Demo app - use any seeded user credentials
        </p>
      </div>
    </div>
  );
}
