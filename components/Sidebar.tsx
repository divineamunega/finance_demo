'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSessionUser } from '@/lib/session';
import { fetchMe } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await fetchMe();
        setUser(userData.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0" />;
  }

  if (!user) {
    return null; // Hide sidebar if not logged in
  }

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Finance<span className="text-blue-400">Pro</span></h1>
        <p className="text-gray-400 text-sm mt-1">Personal Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/')
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/transfer"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/transfer')
              ? 'bg-green-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="font-medium">Transfer</span>
        </Link>

        <Link
          href="/deposit"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/deposit')
              ? 'bg-green-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Deposit</span>
        </Link>

        <Link
          href="/withdraw"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/withdraw')
              ? 'bg-red-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
          </svg>
          <span className="font-medium">Withdraw</span>
        </Link>

        <Link
          href="/graph-analysis"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/graph-analysis')
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium">Analysis</span>
        </Link>

        <Link
          href="/chat"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/chat')
              ? 'bg-purple-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-medium">Chat</span>
        </Link>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors" onClick={logout}>
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{user.name}</div>
            <div className="text-gray-400 text-xs truncate">{user.email}</div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
    </div>
  );
}
