'use client';

import { useState, useEffect } from 'react';
import ChatBox from '@/components/ChatBox';

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>();
  const [userId, setUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Auto-load first user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/demo-users');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch users');
        }
        
        if (data.data && data.data.length > 0) {
          setUserId(data.data[0].id);
        }
      } catch (err: any) {
        console.error('Error loading user:', err);
        setError(err.message || 'Failed to load chat');
      }
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Financial Assistant</h1>
          <p className="text-gray-600 mt-1">Ask questions about your finances and get personalized advice</p>
        </div>

        {/* Chat Interface */}
        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Database Connection Error</h3>
                <p className="text-red-800">Unable to load chat. Please ensure the database is running and seeded.</p>
              </div>
            </div>
          </div>
        ) : userId ? (
          <div className="h-[calc(100vh-200px)]">
            <ChatBox
              userId={userId}
              sessionId={sessionId}
              onSessionCreated={setSessionId}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            Loading chat...
          </div>
        )}
      </div>
    </div>
  );
}
