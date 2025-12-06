# Finance Demo - AI-Powered Personal Finance Dashboard

A modern, world-class personal finance management application with AI chat capabilities, financial tools, and beautiful data visualizations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 🎨 Premium UI/UX
- **World-class chat interface** with glassmorphism, gradients, and smooth animations
- **Responsive design** that works beautifully on all devices
- **Modern aesthetics** with slate-based color palette and premium interactions
- **Interactive visualizations** using Recharts for spending analysis

### 💬 AI Financial Assistant
- **Natural language chat** - Ask questions about your finances conversationally
- **Financial tools integration** - Check balance, withdraw, and transfer money through chat
- **Intelligent responses** - Powered by OpenAI GPT-4o-mini
- **Tool execution indicators** - Visual feedback when AI performs financial operations
- **Suggested prompts** - Quick-start buttons for common queries

### 📊 Financial Management
- **Account overview** - Real-time balance tracking across all accounts
- **Transaction history** - Detailed 6-month transaction records
- **Spending analytics** - Monthly trends and category breakdowns
- **Anomaly detection** - AI-powered unusual transaction identification

### 🔧 Financial Operations
- **Deposits** - Add funds to your accounts
- **Withdrawals** - Withdraw money with full transaction tracking
- **Transfers** - Send money to other users or between your accounts
- **Real-time updates** - Instant balance and transaction updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (or Neon for serverless PostgreSQL)
- OpenRouter API key (for AI features)

### Installation

1. **Clone and install**
```bash
cd finance_demo
pnpm install
```

2. **Environment setup**

Create `.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/finance_demo
OPENROUTER_API_KEY=your_openrouter_api_key
```

3. **Database setup**
```bash
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed with demo data
```

4. **Start development server**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed database with demo data |
| `pnpm db:daily-update` | Simulate daily transactions |
| `pnpm db:studio` | Open Drizzle Studio (DB GUI) |

## 👥 Demo Users

Three pre-configured users with realistic financial data:

1. **Sarah Johnson** - `sarah.johnson@demo.com`
2. **Michael Chen** - `michael.chen@demo.com`  
3. **Emily Rodriguez** - `emily.rodriguez@demo.com`

Each user has:
- Multiple accounts (checking, savings, investment)
- 6 months of transaction history
- Categorized spending data
- AI-generated financial summaries

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Reliable relational database
- **Neon** - Serverless PostgreSQL (optional)

### AI & Data
- **Vercel AI SDK** - AI tool calling and streaming
- **OpenRouter** - Multi-model LLM gateway
- **OpenAI GPT-4o-mini** - Fast, cost-effective AI model
- **Recharts** - Beautiful data visualizations
- **Faker.js** - Realistic demo data generation

## 🤖 AI Features

### Chat Interface
The AI chat assistant can:
- Answer questions about your finances naturally
- Execute financial operations (balance checks, withdrawals, transfers)
- Provide spending insights and recommendations
- Maintain conversation context across messages

### Financial Tools
Three AI-powered tools integrated with the chat:

1. **`get_account_balance`** - Check account balances
2. **`withdraw_money`** - Withdraw funds from accounts
3. **`transfer_money`** - Transfer money between accounts or to other users

Tools are executed automatically when the AI determines they're needed based on user requests.

### Implementation
- Uses Vercel AI SDK's `generateText` with tool calling
- Zod schemas for type-safe tool parameters
- Automatic tool execution with result feedback
- Natural language response generation

## 📁 Project Structure

```
finance_demo/
├── app/
│   ├── (protected)/          # Protected dashboard routes
│   │   ├── page.tsx          # Main dashboard
│   │   ├── chat/             # AI chat interface
│   │   └── graph-analysis/   # Financial visualizations
│   ├── api/                  # API endpoints
│   │   ├── chat/             # AI chat endpoint
│   │   ├── accounts/         # Account operations
│   │   ├── transactions/     # Transaction queries
│   │   ├── deposit/          # Deposit endpoint
│   │   ├── withdraw/         # Withdrawal endpoint
│   │   └── transfer/         # Transfer endpoint
│   └── login/                # Authentication
├── components/               # React components
│   ├── ChatBox.tsx           # Premium chat interface
│   ├── MonthlyTrendChart.tsx # Spending trends
│   ├── SpendingPieChart.tsx  # Category breakdown
│   └── ...
├── lib/
│   ├── ai/                   # AI integration
│   │   ├── chat.ts           # Chat processing
│   │   ├── tools.ts          # Financial tools
│   │   ├── executeTools.ts   # Tool execution
│   │   └── client.ts         # AI client setup
│   ├── session.ts            # Session management
│   └── api.ts                # API helpers
├── db/
│   ├── schema.ts             # Database schema
│   ├── seed.ts               # Data seeding
│   ├── migrate.ts            # Migration runner
│   └── daily-update.ts       # Transaction simulator
└── context/                  # React context providers
```

## 🗄️ Database Schema

### Core Tables
- **`demo_users`** - User accounts and profiles
- **`accounts`** - Bank/investment accounts per user
- **`transactions`** - Transaction records with categories
- **`chat_sessions`** - Chat conversation sessions
- **`chat_messages`** - Individual chat messages
- **`messages`** - System notifications
- **`summaries`** - Cached financial analysis

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

### Financial Data
- `GET /api/accounts` - List user accounts
- `GET /api/transactions` - Get transaction history
- `GET /api/dashboard` - Get dashboard summary

### Operations
- `POST /api/deposit` - Add deposit
- `POST /api/withdraw` - Withdraw funds
- `POST /api/transfer` - Transfer money

### AI Features
- `POST /api/chat` - Chat with AI assistant
- `POST /api/analyze` - Generate financial analysis

## 🎨 Design System

### Color Palette
- **Background**: Slate-50 to Slate-100 gradients
- **Surfaces**: White with glassmorphism effects
- **Text**: Slate-900 (primary), Slate-600 (secondary)
- **Accents**: Slate-700 to Slate-900 gradients
- **Success**: Emerald-600
- **Error**: Red-600

### Typography
- **Font**: Inter (sans-serif), JetBrains Mono (monospace)
- **Scale**: 12px to 32px with consistent line heights

### Components
- Glassmorphism with backdrop blur
- Smooth animations (300ms ease-out)
- Rounded corners (8px, 12px, 16px)
- Subtle shadows for depth

## 🔐 Security

⚠️ **This is a demo application**. For production use:

- [ ] Implement proper authentication (OAuth, JWT)
- [ ] Hash passwords with bcrypt
- [ ] Add rate limiting on API endpoints
- [ ] Implement CSRF protection
- [ ] Use HTTPS in production
- [ ] Validate and sanitize all inputs
- [ ] Add authorization checks
- [ ] Implement prompt injection defenses for AI features
- [ ] Add transaction limits and confirmations
- [ ] Enable audit logging

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Variables
Set these in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENROUTER_API_KEY` - OpenRouter API key

### Database
Use Neon for serverless PostgreSQL or any PostgreSQL 12+ provider.

## 🛠️ Development

### Type Safety
Full TypeScript coverage with strict mode enabled. All database queries are type-safe through Drizzle ORM.

### Database Management
```bash
pnpm db:studio  # Open Drizzle Studio GUI
```

### Adding Test Data
```bash
pnpm db:daily-update  # Simulate daily transactions
```

## 📚 Documentation

- [API Documentation](./API.md) - Detailed API endpoint docs
- [Quick Start Guide](./QUICKSTART.md) - Step-by-step setup
- [Database Schema](./DATABASE.md) - Database structure details
- [Dashboard Redesign](./DASHBOARD_REDESIGN.md) - UI/UX design notes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenRouter](https://openrouter.ai/)
- Database by [Neon](https://neon.tech/)
- Charts by [Recharts](https://recharts.org/)
- Icons and UI inspiration from modern fintech apps

---

**Made with ❤️ using Next.js, React, and AI**
