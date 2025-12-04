# FinancePro - Personal Finance Management Dashboard

A modern, AI-powered personal finance management dashboard built with Next.js, React, and PostgreSQL. Track accounts, transactions, analyze spending patterns, and get intelligent financial insights through an interactive chat interface.

## 🎯 Features

### Dashboard & Accounts

- **Multi-Account Management** - View and switch between checking, savings, and investment accounts
- **Real-time Balance Tracking** - Monitor total balance across all accounts
- **Account Types** - Support for multiple account types (checking, savings, investment)

### Transactions & Analytics

- **Transaction History** - Detailed 6-month transaction records with merchant, category, and amount
- **Monthly Trend Chart** - Visualize spending patterns over time
- **Category Breakdown** - Pie chart showing spending distribution by category
- **Spending Analysis** - Comprehensive spending patterns and trends
- **Anomaly Detection** - AI-powered detection of unusual transactions

### AI Chat & Analysis

- **Intelligent Chat Interface** - Ask questions about your finances naturally
- **Automated Analysis** - Generate financial summaries and insights using OpenAI
- **Natural Language Responses** - Get human-friendly explanations of your financial data
- **Chat History** - Persistent conversation storage and retrieval

### Financial Operations

- **Deposits** - Add funds to accounts
- **Withdrawals** - Withdraw funds with transaction tracking
- **Transfers** - Transfer money between your accounts
- **Daily Simulations** - Automated daily transaction simulation for demo data

### User Management

- **Demo Accounts** - 3 pre-configured demo users with realistic transaction history
- **Session Management** - Secure user sessions and authentication
- **Multi-User Support** - Each user has isolated financial data

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **AI**: OpenRouter (OpenAI integration)
- **Visualization**: Recharts for charts and graphs
- **Data Generation**: Faker.js for realistic demo data

## 📋 Project Structure

```
finance_demo/
├── app/
│   ├── (protected)/         # Protected dashboard routes
│   │   ├── page.tsx         # Main dashboard
│   │   ├── chat/            # Chat interface
│   │   └── graph-analysis/  # Financial graphs
│   ├── (public)/            # Public routes
│   ├── api/                 # API endpoints
│   │   ├── accounts/        # Account operations
│   │   ├── transactions/    # Transaction queries
│   │   ├── chat/            # Chat API with OpenAI
│   │   ├── analyze/         # Financial analysis
│   │   ├── deposit/         # Deposit endpoint
│   │   ├── withdraw/        # Withdrawal endpoint
│   │   ├── transfer/        # Transfer endpoint
│   │   └── ...
│   └── login/               # Authentication
├── components/              # React components
│   ├── ChatBox.tsx          # Chat interface
│   ├── MonthlyTrendChart.tsx
│   ├── SpendingPieChart.tsx
│   ├── CategoryBreakdown.tsx
│   └── ...
├── db/
│   ├── schema.ts            # Drizzle schema
│   ├── seed.ts              # Database seeding
│   ├── migrate.ts           # Migration runner
│   └── daily-update.ts      # Simulation script
├── lib/
│   ├── openai/              # OpenAI integration
│   ├── session.ts           # Session management
│   └── api.ts               # API helpers
└── context/                 # React context providers
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 12+ (or use Neon for PostgreSQL as a Service)

### Installation

1. **Clone the repository**

```bash
cd finance_demo
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**
   Create `.env.local`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/finance_demo
OPENROUTER_API_KEY=your_openrouter_key
```

For Neon PostgreSQL, use their connection string format.

4. **Generate migrations**

```bash
pnpm db:generate
```

5. **Run migrations**

```bash
pnpm db:migrate
```

6. **Seed database with demo data**

```bash
pnpm db:seed
```

7. **Start the development server**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Available Scripts

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `pnpm dev`             | Start development server           |
| `pnpm build`           | Build for production               |
| `pnpm start`           | Start production server            |
| `pnpm lint`            | Run ESLint                         |
| `pnpm db:generate`     | Generate Drizzle migrations        |
| `pnpm db:migrate`      | Apply migrations                   |
| `pnpm db:seed`         | Seed demo data                     |
| `pnpm db:daily-update` | Add simulated daily transactions   |
| `pnpm db:studio`       | Open Drizzle Studio (database GUI) |

## 👥 Demo Users

Three pre-configured demo users are available for testing:

1. **Sarah Johnson** - sarah.johnson@demo.com
2. **Michael Chen** - michael.chen@demo.com
3. **Emily Rodriguez** - emily.rodriguez@demo.com

Each user has:

- 2-3 accounts (checking, savings, investment)
- 6 months of realistic transaction history
- Categorized transactions (groceries, utilities, entertainment, etc.)

## 🔌 API Endpoints

### Authentication

- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

### Accounts & Data

- `GET /api/accounts` - List user accounts
- `GET /api/transactions` - Get transactions
- `GET /api/dashboard` - Get dashboard data
- `GET /api/demo-users` - List demo users

### Operations

- `POST /api/deposit` - Add deposit
- `POST /api/withdraw` - Perform withdrawal
- `POST /api/transfer` - Transfer between accounts

### AI Features

- `POST /api/chat` - Chat with AI about finances
- `POST /api/analyze` - Generate financial analysis

For detailed API documentation, see [API.md](./API.md)

## 🤖 AI Features

### Chat Interface

- Natural language questions about transactions, accounts, and spending
- Maintains conversation history per session
- Provides contextual financial insights
- Integrates with OpenRouter for LLM inference

### Financial Analysis

- Automated spending pattern analysis
- Category-based transaction summaries
- Anomaly detection for unusual transactions
- Natural language financial reports

## 🗄️ Database Schema

### Tables

- **demo_users** - User accounts and authentication
- **accounts** - Bank/investment accounts per user
- **transactions** - Transaction records with metadata
- **messages** - Notifications and alerts
- **summaries** - Cached financial analysis results
- **chatSessions** - Chat conversation storage
- **chatMessages** - Individual chat messages

## 🔐 Security Notes

⚠️ **Demo Application** - This is a demonstration app. In production:

- Implement proper authentication (OAuth, JWT)
- Hash passwords with bcrypt
- Add rate limiting
- Implement CSRF protection
- Use HTTPS
- Validate all inputs
- Add authorization checks

## 🛠️ Development

### Database Visualization

Open Drizzle Studio to view and edit data:

```bash
pnpm db:studio
```

### Adding Transactions

Simulate daily transactions:

```bash
pnpm db:daily-update
```

### Type Safety

The project uses TypeScript for full type safety. All database queries are type-safe through Drizzle ORM.

## 📦 Dependencies

- **Next.js 16** - React framework
- **React 19** - UI library
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Database
- **Recharts** - Chart library
- **OpenRouter** - LLM API provider
- **Faker.js** - Data generation
- **Tailwind CSS** - Styling

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
vercel deploy
```

### Deploy to Other Platforms

The app can run on any Node.js 18+ hosting (Railway, Render, Fly.io, etc.)

## 📝 License

This project is open source.

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests.

## 📞 Support

For issues and questions, please check the [API documentation](./API.md) or [Quick Start Guide](./QUICKSTART.md).
