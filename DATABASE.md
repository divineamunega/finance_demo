# Database Setup Guide

This guide covers the PostgreSQL + Drizzle ORM setup for the finance demo application.

## Prerequisites

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE finance_demo;

# Create user (optional, if not using default postgres user)
CREATE USER finance_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE finance_demo TO finance_user;

# Exit psql
\q
```

## Environment Setup

Create a `.env.local` file in the project root (it's gitignored):

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_demo
```

Or if you created a custom user:

```bash
DATABASE_URL=postgresql://finance_user:your_password@localhost:5432/finance_demo
```

## Database Scripts

The following npm scripts are available:

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm db:generate` | `drizzle-kit generate` | Generate migration files from schema |
| `pnpm db:migrate` | `tsx db/migrate.ts` | Run migrations to update database |
| `pnpm db:seed` | `tsx db/seed.ts` | Seed database with demo data |
| `pnpm db:daily-update` | `tsx db/daily-update.ts` | Simulate daily transaction updates |
| `pnpm db:studio` | `drizzle-kit studio` | Open Drizzle Studio GUI |

## Initial Setup

Run these commands in order:

```bash
# 1. Generate migration files from schema
pnpm db:generate

# 2. Run migrations to create tables
pnpm db:migrate

# 3. Seed database with demo data
pnpm db:seed

# 4. (Optional) Open Drizzle Studio to view data
pnpm db:studio
```

## Database Schema

### Tables Overview

#### `demo_users`
Stores demo user profiles for the application.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | User's full name |
| email | TEXT | User's email (unique) |
| avatar | TEXT | Avatar URL |
| created_at | TIMESTAMP | Creation timestamp |

#### `accounts`
Financial accounts linked to users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to demo_users |
| name | TEXT | Account name |
| type | TEXT | Account type (checking, savings, investment) |
| balance | DECIMAL(12,2) | Current balance |
| currency | TEXT | Currency code (default: USD) |
| created_at | TIMESTAMP | Creation timestamp |

#### `transactions`
Transaction history for accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| account_id | UUID | Foreign key to accounts |
| date | TIMESTAMP | Transaction date/time |
| amount | DECIMAL(12,2) | Transaction amount (negative for expenses) |
| merchant | TEXT | Merchant name |
| category | TEXT | Transaction category |
| balance_after | DECIMAL(12,2) | Account balance after transaction |
| is_anomaly | BOOLEAN | Flagged as anomaly (for demo) |
| description | TEXT | Optional description |
| created_at | TIMESTAMP | Creation timestamp |

#### `messages`
User notifications and messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to demo_users |
| title | TEXT | Message title |
| content | TEXT | Message content |
| type | TEXT | Message type (info, warning, alert, success) |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Creation timestamp |

#### `summaries`
Financial summaries and insights.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to demo_users |
| period | TEXT | Summary period (daily, weekly, monthly) |
| start_date | TIMESTAMP | Period start date |
| end_date | TIMESTAMP | Period end date |
| total_income | DECIMAL(12,2) | Total income in period |
| total_expenses | DECIMAL(12,2) | Total expenses in period |
| net_change | DECIMAL(12,2) | Net change in period |
| top_category | TEXT | Top spending category |
| insights | TEXT | AI-generated insights |
| created_at | TIMESTAMP | Creation timestamp |

#### `todos`
Account-specific todo items.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| account_id | UUID | Foreign key to accounts |
| title | TEXT | Todo title |
| description | TEXT | Optional description |
| due_date | TIMESTAMP | Due date |
| is_completed | BOOLEAN | Completion status |
| priority | TEXT | Priority level (low, medium, high) |
| created_at | TIMESTAMP | Creation timestamp |
| completed_at | TIMESTAMP | Completion timestamp |

## Demo Data

### Users
The seed script creates 3 demo users:

1. **Sarah Johnson** - sarah.johnson@demo.com
2. **Michael Chen** - michael.chen@demo.com
3. **Emily Rodriguez** - emily.rodriguez@demo.com

Each user has a unique avatar from DiceBear API.

### Accounts
Each user gets 2-3 accounts randomly selected from:
- **Checking Account** - Starting balance: $1,000 - $5,000
- **Savings Account** - Starting balance: $5,000 - $20,000
- **Investment Account** - Starting balance: $10,000 - $50,000

### Transactions
- **Time Range**: 6 months of historical data
- **Frequency**: 1-3 transactions per day per account
- **Categories**: groceries, dining, utilities, entertainment, shopping, transportation, healthcare, income, transfer, investment
- **Anomalies**: ~5% of transactions are flagged as anomalies for demo purposes
- **Balance Tracking**: Each transaction includes `balance_after` to track account balance over time

### Transaction Categories

| Category | Typical Amount Range | Example Merchants |
|----------|---------------------|-------------------|
| Groceries | $20 - $150 | Whole Foods, Trader Joe's, Costco |
| Dining | $10 - $80 | Starbucks, Chipotle, Local Cafe |
| Utilities | $50 - $200 | Electric, Water, Internet |
| Entertainment | $10 - $100 | Netflix, Spotify, Movie Theater |
| Shopping | $25 - $300 | Amazon, Target, Best Buy |
| Transportation | $5 - $60 | Gas Station, Uber, Public Transit |
| Healthcare | $30 - $500 | Pharmacy, Doctor's Office |
| Income | $1,000 - $5,000 | Salary, Freelance, Bonus |
| Transfer | $100 - $2,000 | Internal transfers |
| Investment | $200 - $3,000 | Stock/ETF purchases |

## Demo User Switching

The schema is designed to support easy demo user switching:

### Query by User
```typescript
import { db } from './db';
import { demoUsers, accounts, transactions } from './db/schema';
import { eq } from 'drizzle-orm';

// Get user by email
const user = await db.query.demoUsers.findFirst({
  where: eq(demoUsers.email, 'sarah.johnson@demo.com'),
  with: {
    accounts: {
      with: {
        transactions: {
          orderBy: (transactions, { desc }) => [desc(transactions.date)],
          limit: 10,
        },
        todos: true,
      },
    },
    messages: true,
    summaries: true,
  },
});
```

### Switch Active User
```typescript
// In your app, maintain current user context
const [currentUserId, setCurrentUserId] = useState<string>();

// Fetch data for current user
const userData = await db.query.demoUsers.findFirst({
  where: eq(demoUsers.id, currentUserId),
  with: { accounts: true },
});
```

## Multi-Account Simulation

The schema supports realistic multi-account scenarios:

### Account Relationships
- Each user can have multiple accounts of different types
- Transactions are linked to specific accounts
- Todos are account-specific (e.g., "Review savings goals" for savings account)
- Account balances are automatically updated with each transaction

### Cross-Account Operations
```typescript
// Get all accounts for a user
const userAccounts = await db.query.accounts.findMany({
  where: eq(accounts.userId, userId),
});

// Get transactions across all user accounts
const allTransactions = await db.query.transactions.findMany({
  where: inArray(
    transactions.accountId,
    userAccounts.map(a => a.id)
  ),
  orderBy: (transactions, { desc }) => [desc(transactions.date)],
});
```

### Transfer Simulation
The seed data includes "transfer" category transactions that simulate money movement between accounts. You can extend this with:

```typescript
async function createTransfer(fromAccountId: string, toAccountId: string, amount: number) {
  // Debit from source account
  await db.insert(transactions).values({
    accountId: fromAccountId,
    amount: -amount,
    category: 'transfer',
    merchant: 'Internal Transfer',
    // ... other fields
  });

  // Credit to destination account
  await db.insert(transactions).values({
    accountId: toAccountId,
    amount: amount,
    category: 'transfer',
    merchant: 'Internal Transfer',
    // ... other fields
  });
}
```

## Daily Update Simulation

Run the daily update script to simulate ongoing activity:

```bash
pnpm db:daily-update
```

This will:
- Generate 1-3 new transactions for each account
- Update account balances accordingly
- Use realistic transaction patterns based on account type

You can schedule this with cron or run it manually to keep demo data fresh.

## Drizzle Studio

Drizzle Studio provides a GUI for browsing and editing your database:

```bash
pnpm db:studio
```

This will open a web interface (usually at `https://local.drizzle.studio`) where you can:
- Browse all tables and data
- Edit records directly
- Run custom queries
- View relationships

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Ensure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check connection string in `.env.local`

**Error: "Database does not exist"**
- Create the database: `createdb finance_demo`

### Migration Issues

**Error: "Migration failed"**
- Ensure database is accessible
- Check that no other process is using the database
- Try dropping and recreating: `dropdb finance_demo && createdb finance_demo`

### Seed Issues

**Error: "Seed failed"**
- Ensure migrations have been run first: `pnpm db:migrate`
- Check database connection
- Verify all dependencies are installed: `pnpm install`

## Resetting the Database

To completely reset and reseed:

```bash
# Drop and recreate database
dropdb finance_demo
createdb finance_demo

# Run migrations
pnpm db:migrate

# Reseed data
pnpm db:seed
```

Or just clear and reseed (keeps schema):

```bash
pnpm db:seed
```

The seed script automatically clears existing data before inserting new records.
