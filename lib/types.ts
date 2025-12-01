// API Response Types

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  amount: string;
  merchant: string;
  category: string;
  balanceAfter: string;
  isAnomaly: boolean;
  description: string | null;
  createdAt: Date;
}

export interface Todo {
  id: string;
  accountId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  isCompleted: boolean;
  priority: string;
  createdAt: Date;
  completedAt: Date | null;
}

export interface Message {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Summary {
  id: string;
  userId: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalIncome: string;
  totalExpenses: string;
  netChange: string;
  topCategory: string | null;
  insights: string | null;
  createdAt: Date;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Analysis Types
export interface MonthlyBreakdown {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface Anomaly {
  transactionId: string;
  merchant: string;
  amount: number;
  date: Date;
  reason: string;
}

export interface AnalysisResult {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  totals: {
    income: number;
    expenses: number;
    netChange: number;
  };
  monthlyBreakdown: MonthlyBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  anomalies: Anomaly[];
  insights: string;
  topCategory: string;
}

// Request Bodies
export interface CreateTodoRequest {
  accountId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

// Chat Types
export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatRequest {
  user_id: string;
  session_id?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  session_id: string;
  message: {
    id: string;
    role: 'assistant';
    content: string;
    createdAt: Date;
  };
  context_used: {
    accounts_count: number;
    recent_transactions_count: number;
    has_summary: boolean;
  };
}
