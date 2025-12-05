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
    return <div className="w-64 h-screen fixed left-0 top-0" style={{ background: 'var(--color-sidebar-bg)' }} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div 
      className="w-64 h-screen fixed left-0 top-0 flex flex-col"
      style={{ 
        background: 'var(--color-sidebar-bg)',
        borderRight: '1px solid var(--color-sidebar-border)'
      }}
    >
      {/* Logo/Brand */}
      <div className="px-6 py-8" style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}>
        <h1 className="text-xl font-semibold text-white tracking-tight">FinancePro</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Personal Banking</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
            isActive('/')
              ? 'text-white'
              : 'hover:bg-slate-700/50'
          }`}
          style={{
            background: isActive('/') ? 'var(--color-sidebar-active)' : 'transparent',
            color: isActive('/') ? '#FFFFFF' : '#CBD5E1',
            borderLeft: isActive('/') ? '3px solid var(--color-accent)' : '3px solid transparent',
            paddingLeft: isActive('/') ? '0.625rem' : '0.75rem'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/graph-analysis"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
            isActive('/graph-analysis')
              ? 'text-white'
              : 'hover:bg-slate-700/50'
          }`}
          style={{
            background: isActive('/graph-analysis') ? 'var(--color-sidebar-active)' : 'transparent',
            color: isActive('/graph-analysis') ? '#FFFFFF' : '#CBD5E1',
            borderLeft: isActive('/graph-analysis') ? '3px solid var(--color-accent)' : '3px solid transparent',
            paddingLeft: isActive('/graph-analysis') ? '0.625rem' : '0.75rem'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <span>Analytics</span>
        </Link>

        <Link
          href="/chat"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
            isActive('/chat')
              ? 'text-white'
              : 'hover:bg-slate-700/50'
          }`}
          style={{
            background: isActive('/chat') ? 'var(--color-sidebar-active)' : 'transparent',
            color: isActive('/chat') ? '#FFFFFF' : '#CBD5E1',
            borderLeft: isActive('/chat') ? '3px solid var(--color-accent)' : '3px solid transparent',
            paddingLeft: isActive('/chat') ? '0.625rem' : '0.75rem'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <span>AI Assistant</span>
        </Link>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-700/50 transition-colors text-left"
        >
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-9 h-9 rounded-md" 
            style={{ border: '1px solid var(--color-sidebar-border)' }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user.name}</div>
            <div className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{user.email}</div>
          </div>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </div>
  );
}
