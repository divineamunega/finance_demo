import { pgTable, text, timestamp, boolean, decimal, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Demo Users Table
export const demoUsers = pgTable('demo_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar').notNull(),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Accounts Table
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => demoUsers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'checking', 'savings', 'investment'
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('0'),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  merchant: text('merchant').notNull(),
  category: text('category').notNull(),
  balanceAfter: decimal('balance_after', { precision: 12, scale: 2 }).notNull(),
  isAnomaly: boolean('is_anomaly').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Messages Table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => demoUsers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // 'info', 'warning', 'alert', 'success'
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Summaries Table
export const summaries = pgTable('summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => demoUsers.id, { onDelete: 'cascade' }),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalIncome: decimal('total_income', { precision: 12, scale: 2 }).notNull().default('0'),
  totalExpenses: decimal('total_expenses', { precision: 12, scale: 2 }).notNull().default('0'),
  netChange: decimal('net_change', { precision: 12, scale: 2 }).notNull().default('0'),
  topCategory: text('top_category'),
  insights: text('insights'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// Chat Sessions Table
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => demoUsers.id, { onDelete: 'cascade' }),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chat Messages Table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const demoUsersRelations = relations(demoUsers, ({ many }) => ({
  accounts: many(accounts),
  messages: many(messages),
  summaries: many(summaries),
  chatSessions: many(chatSessions),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(demoUsers, {
    fields: [accounts.userId],
    references: [demoUsers.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(demoUsers, {
    fields: [messages.userId],
    references: [demoUsers.id],
  }),
}));

export const summariesRelations = relations(summaries, ({ one }) => ({
  user: one(demoUsers, {
    fields: [summaries.userId],
    references: [demoUsers.id],
  }),
}));


export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(demoUsers, {
    fields: [chatSessions.userId],
    references: [demoUsers.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));
