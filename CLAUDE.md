# CLAUDE.md - AI Context Guide for FinancePro

This document provides context for AI assistants working on the FinancePro project.

## 🎯 Project Overview

**FinancePro** is a personal finance management dashboard that combines:

- Real-time financial data tracking
- AI-powered analysis and insights
- Interactive chat interface for financial questions
- Multi-account management with transaction history
- Advanced analytics and anomaly detection

## 📐 Architecture

### Frontend (Next.js App Router)

```
app/
├── (protected)/          # Authenticated routes (requires login)
│   ├── page.tsx         # Main dashboard with charts & account overview
│   ├── chat/            # AI chat interface for financial questions
│   └── graph-analysis/  # Detailed analytics and trends
├── (public)/            # Public pages
└── login/               # Authentication entry point
```

### Backend (API Routes)

```
api/
├── auth/               # User authentication (login/logout)
├── accounts/           # Account CRUD operations
├── transactions/       # Transaction queries and filtering
├── chat/              # OpenAI-powered chat endpoint
├── analyze/           # Financial analysis and summarization
├── deposit/withdraw/transfer/  # Account operations
└── demo-users/        # Demo user management
```

### Database (PostgreSQL with Drizzle ORM)

```
demo_users
  ├── id (UUID primary key)
  ├── name
  ├── email (unique)
  ├── avatar (URL)
  ├── password (hashed)
  └── createdAt

accounts
  ├── id (UUID primary key)
  ├── userId (FK to demo_users)
  ├── name
  ├── type (checking|savings|investment)
  ├── balance (decimal)
  ├── currency
  └── createdAt

transactions
  ├── id (UUID primary key)
  ├── accountId (FK to accounts)
  ├── date
  ├── amount (decimal)
  ├── merchant
  ├── category
  ├── balanceAfter (decimal)
  ├── isAnomaly (boolean)
  ├── description
  └── createdAt

messages
  ├── id (UUID primary key)
  ├── userId (FK to demo_users)
  ├── title
  ├── content
  ├── type (info|warning|alert|success)
  ├── isRead (boolean)
  └── createdAt

summaries
  ├── id (UUID primary key)
  ├── userId (FK to demo_users)
  ├── period
  ├── totalIncome
  ├── totalExpenses
  ├── categoryBreakdown
  ├── insights
  └── createdAt

chatSessions
  ├── id (UUID primary key)
  ├── userId (FK to demo_users)
  ├── title
  └── createdAt

chatMessages
  ├── id (UUID primary key)
  ├── sessionId (FK to chatSessions)
  ├── role (user|assistant)
  ├── content
  └── createdAt
```

## 🔑 Key Components

### Frontend Components

- **DashboardClient.tsx** - Main dashboard UI with state management
- **ChatBox.tsx** - Chat interface for AI interactions
- **MonthlyTrendChart.tsx** - Line chart showing spending over time
- **SpendingPieChart.tsx** - Pie chart for category breakdown
- **CategoryBreakdown.tsx** - Category-wise spending analysis
- **AccountSwitcher.tsx** - Account selection dropdown
- **Sidebar.tsx** - Navigation and user info
- **FormDeposit/Withdraw/Transfer.tsx** - Financial operation forms

### API Endpoints

#### Authentication

- `POST /api/login` - Login with email
- `POST /api/logout` - Clear session
- `GET /api/me` - Get current user

#### Data Fetching

- `GET /api/accounts` - Get user's accounts
- `GET /api/transactions?accountId=UUID` - Get transactions for account
- `GET /api/dashboard` - Get dashboard data (accounts, transactions, balance)
- `GET /api/demo-users` - List all demo users

#### Financial Operations

- `POST /api/deposit` - Add deposit (body: {accountId, amount})
- `POST /api/withdraw` - Withdraw funds (body: {accountId, amount})
- `POST /api/transfer` - Transfer between accounts (body: {fromAccountId, toAccountId, amount})

#### AI Features

- `POST /api/chat` - Send message to chat
  - Body: {session_id?, messages: [{role, content}]}
  - Returns: {success, data: {response, sessionId}}
- `POST /api/analyze` - Generate financial analysis
  - Returns: {success, data: {summary, anomalies}}

#### Utility

- `POST /api/simulate-daily-update` - Add simulated daily transactions

## 🧠 Key Business Logic

### Session Management (`lib/session.ts`)

- `requireUser()` - Middleware to require logged-in user
- `requireSessionUser()` - Get current user from session
- Session stored in cookies/database

### OpenAI Integration (`lib/openai/index.ts`)

- Uses OpenRouter provider for LLM inference
- `generateFinancialSummary()` - Creates natural language analysis
- Supports tool use for structured outputs

### Transaction Analysis

- **Categorization** - Transactions auto-categorized by merchant/description
- **Anomaly Detection** - Flags unusual spending amounts
- **Aggregation** - Totals per month/category for reporting

## 🎨 UI/UX Patterns

### Dashboard Layout

- Left sidebar: Navigation and account switcher
- Main area: Charts and financial overview
- Top bar: User info and logout
- Responsive design with Tailwind CSS

### Forms

- Modal-based forms for deposits, withdrawals, transfers
- Form validation and error handling
- Success/error toast notifications

### Charts

- Recharts library for visualization
- Real-time responsive charts
- Multiple chart types: line (trends), pie (categories)

## 💾 Data Flow

### Login Flow

1. User enters email on login page
2. API checks credentials (no password validation in demo)
3. Session created and stored
4. Redirect to dashboard

### Dashboard Load

1. Get current user from session
2. Fetch user's accounts
3. Fetch recent transactions (6 months)
4. Calculate totals and balance
5. Render charts and data

### Chat Flow

1. User types message in ChatBox
2. Message sent to `/api/chat` with session context
3. OpenAI generates response with financial context
4. Response displayed and stored in chatMessages table
5. Conversation history maintained

### Financial Operation

1. User submits deposit/withdraw/transfer form
2. Validation on client and server
3. Database transaction updates account and creates transaction record
4. Balance recalculated
5. UI updates with new data

## 🔧 Common Development Tasks

### Adding New API Endpoint

1. Create `app/api/[endpoint]/route.ts`
2. Add authentication check with `requireSessionUser()`
3. Query database using Drizzle
4. Return JSON response: `{success: true, data: ...}`

### Modifying Database Schema

1. Edit `db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply
4. Update Drizzle types if needed

### Adding UI Component

1. Create component in `components/`
2. Use React hooks (useState, useEffect, useContext)
3. Consume data from context or props
4. Apply Tailwind CSS classes
5. Export and import in page.tsx

### Testing with Demo Data

1. Run `pnpm db:seed` to create demo users and transactions
2. Run `pnpm db:daily-update` to add new daily transactions
3. Login with demo credentials
4. Verify data appears correctly

## 📊 Important Features to Know

### Multi-Account Support

- Each user can have multiple accounts
- Dashboard shows aggregated balance
- Operations can target specific accounts
- Charts can filter by account

### Transaction Categories

Common categories: groceries, utilities, entertainment, salary, bonus, transfer, withdrawal, deposit

### Anomaly Detection

- Flagged when transaction amount significantly differs from typical amounts
- Shown in transaction list with visual indicator
- Can be used for fraud detection

### Time-Series Analysis

- 6-month transaction history tracked
- Monthly aggregation for trends
- Date filtering in queries

## 🚀 Performance Considerations

### Optimization Strategies

- Server-side rendering for dashboard
- Image optimization with Next.js
- Chart data limits (6 months for initial load)
- Database query indexing on frequently filtered fields

### Caching

- Dashboard data cached server-side
- Consider Redis for chat session caching
- Revalidate data on account operations

## 🔐 Security Patterns

### Current Implementation

- Session-based auth with cookies
- No HTTPS validation in demo (implement in production)
- No rate limiting (implement in production)
- All user operations isolated by userId

### Production Improvements Needed

- Implement proper password hashing (bcrypt)
- Add JWT with expiration
- Rate limiting on API endpoints
- CSRF protection
- SQL injection prevention (Drizzle handles this)
- Input validation on all endpoints

## 📱 Responsive Design

- Mobile-first Tailwind CSS approach
- Sidebar collapses on mobile
- Charts responsive to container width
- Forms work on all screen sizes
- Touch-friendly button sizes

## 🧪 Testing Areas

- Account operations (deposit, withdraw, transfer)
- Chat with various financial questions
- Multi-account switching
- Transaction filtering and aggregation
- Chart rendering and updates
- Session persistence across navigation

## 🎯 Current Limitations & Future Enhancements

### Current Limitations

- No real bank integration
- Demo data only (Faker generated)
- Simple anomaly detection
- No recurring transactions
- No budgeting features
- No investment tracking details

### Potential Enhancements

- Real Plaid integration for bank connections
- Budget management and alerts
- Investment portfolio tracking
- Bill reminders and automation
- Mobile app version
- Advanced ML-based anomaly detection
- Multi-currency support
- Export to CSV/PDF
- Tax reporting features

## 🔗 Related Documentation

- See [README.md](./README.md) for project overview
- See [API.md](./API.md) for detailed API documentation
- See [QUICKSTART.md](./QUICKSTART.md) for setup instructions
- See [DATABASE.md](./DATABASE.md) for database details

## 💡 Tips for Working with This Codebase

1. **Always use Drizzle ORM** - Don't write raw SQL queries
2. **Follow the API pattern** - Return `{success, data, error}` format
3. **Use TypeScript** - Enable strict mode for better type safety
4. **Check session.ts** - Always require user authentication for protected routes
5. **Test with demo users** - Use provided demo accounts for testing
6. **Use Drizzle Studio** - Visualize database changes easily
7. **Environment variables** - Keep sensitive data in `.env.local`
