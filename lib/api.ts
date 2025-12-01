// API client functions for fetching data from backend
const API_BASE = '/api';

/**
 * Fetch all demo users (public for login)
 */
export async function fetchDemoUsers() {
  const response = await fetch(`${API_BASE}/demo-users`);
  if (!response.ok) throw new Error('Failed to fetch demo users');
  const data = await response.json();
  return data.data;
}

/**
 * Fetch current user and accounts (session-based)
 */
export async function fetchMe() {
  const response = await fetch(`${API_BASE}/me`);
  if (!response.ok) throw new Error('Failed to fetch user');
  const data = await response.json();
  return data;
}

/**
 * Fetch accounts for current user (DEMO: uses /me)
 */
export async function fetchAccounts() {
  const me = await fetchMe();
  return me.accounts;
}

/**
 * Fetch transactions for account (client-side pagination)
 */
export async function fetchTransactions(accountId: string, page = 1, limit = 50) {
  const response = await fetch(`${API_BASE}/transactions?account_id=${accountId}&page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  const data = await response.json();
  return data;
}

/**
 * Run financial analysis (session-based demo)
 */
export async function runAnalysis() {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to run analysis');
  const data = await response.json();
  return data.data;
}

/**
 * Send chat message (session-based)
 */
export async function sendChatMessage(messages: Array<{ role: string; content: string }>, sessionId?: string) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, messages }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  const data = await response.json();
  return data.data;
}

/**
 * Fetch chat history
 */
export async function fetchChatHistory(sessionId: string) {
  const response = await fetch(`${API_BASE}/chat?session_id=${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch chat history');
  const data = await response.json();
  return data.data;
}

/**
 * Fetch chat sessions (session-based)
 */
export async function fetchChatSessions() {
  const response = await fetch(`${API_BASE}/chat`);
  if (!response.ok) throw new Error('Failed to fetch chat sessions');
  const data = await response.json();
  return data.data;
}