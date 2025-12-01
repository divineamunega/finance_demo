'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { fetchDemoUsers, fetchAccounts } from '@/lib/api';

/**
 * AccountSwitcher Component
 * Allows users to select a demo user (automatically uses their first account)
 */
export default function AccountSwitcher() {
  const { currentUser, currentAccount, setCurrentUser, setCurrentAccount } = useApp();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch demo users on mount
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchDemoUsers();
        setUsers(data);
        
        // Auto-select first user if none selected
        if (!currentUser && data.length > 0) {
          setCurrentUser(data[0]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Fetch account when user changes (auto-select first account)
  useEffect(() => {
    if (!currentUser) return;

    async function loadAccount() {
      try {
        const data = await fetchAccounts();
        
        // Auto-select first account
        if (data.length > 0) {
          setCurrentAccount(data[0]);
        }
      } catch (error) {
        console.error('Error loading account:', error);
      }
    }
    loadAccount();
  }, [currentUser]);

  // Handle user selection change
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === userId);
    setCurrentUser(user || null);
    setCurrentAccount(null); // Reset account when user changes
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4 bg-white rounded-lg shadow">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow items-center">
      {/* User Selector */}
      <div className="flex-1 w-full sm:w-auto">
        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
          Demo User
        </label>
        <select
          id="user-select"
          value={currentUser?.id || ''}
          onChange={handleUserChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Current Selection Display */}
      {currentUser && currentAccount && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-md">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-medium text-gray-900">{currentUser.name}</div>
            <div className="text-sm text-gray-600">
              {currentAccount.name} - ${currentAccount.balance}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

