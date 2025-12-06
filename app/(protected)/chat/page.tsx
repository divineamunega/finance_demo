'use client';

import { useState, useEffect } from 'react';
import ChatBox from '@/components/ChatBox';

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>();
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
      } catch (err: unknown) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl blur-lg opacity-20"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                AI Financial Assistant
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">
                Intelligent insights and actions for your finances
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {error ? (
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200/60 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h3>
                <p className="text-red-800 text-sm leading-relaxed">Unable to load chat. Please ensure the database is running and seeded.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <ChatBox
              sessionId={sessionId}
              onSessionCreated={setSessionId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
