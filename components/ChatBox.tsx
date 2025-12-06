'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  createdAt?: Date;
  tool_calls?: Array<{
    toolName: string;
    args: Record<string, unknown>;
    result: Record<string, unknown>;
  }>;
}

interface ChatBoxProps {
  sessionId?: string;
  onSessionCreated?: (sessionId: string) => void;
}

/**
 * Premium ChatBox Component
 * World-class chat interface with modern aesthetics and smooth interactions
 */
export default function ChatBox({ sessionId, onSessionCreated }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send to API
      const response = await sendChatMessage(
        [...messages, userMessage],
        currentSessionId
      );

      // Update session ID if this was the first message
      if (!currentSessionId && response.session_id) {
        setCurrentSessionId(response.session_id);
        onSessionCreated?.(response.session_id);
      }

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message.content,
        id: response.message.id,
        createdAt: response.message.createdAt,
        tool_calls: response.tool_calls,
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            {/* AI Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-semibold text-slate-900">Start a conversation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ask about your spending, budgets, financial goals, or request transactions.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl pt-4">
              {[
                { icon: '💰', text: "What's my current balance?" },
                { icon: '📊', text: 'Show my spending trends' },
                { icon: '💸', text: 'Withdraw $100' },
                { icon: '🔄', text: 'Transfer money' },
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt.text)}
                  className="group flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all duration-200 text-left"
                >
                  <span className="text-2xl">{prompt.icon}</span>
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-slate-900/20'
                  : 'bg-white/90 backdrop-blur-sm text-slate-900 border border-slate-200/60 shadow-slate-200/50'
              }`}
            >
              {/* Show tool execution indicators */}
              {message.tool_calls && message.tool_calls.length > 0 && (
                <div className="mb-3 pb-3 border-b border-slate-200/50 space-y-2">
                  {message.tool_calls.map((toolCall, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-semibold text-slate-700">{toolCall.toolName.replace(/_/g, ' ')}</span>
                      </div>
                      {toolCall.result.success ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Failed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-slate-500 ml-1">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances or request a transaction..."
              disabled={loading}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400 resize-none text-[15px] leading-relaxed transition-all duration-200"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {input.trim() && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="absolute right-2 bottom-2 p-2 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-600 hover:to-slate-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Hint text */}
        <p className="text-xs text-slate-500 mt-2 px-1">
          Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
