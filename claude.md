# Finance Demo - Claude Code Guide

## Overview
Next.js 16 (App Router) personal finance dashboard demo. Features:
- Demo users/accounts/transactions (PostgreSQL + Drizzle ORM)
- AI financial analysis & chat (OpenAI)
- Charts (Recharts), todos, anomalies
- No auth (demo only)

## Tech Stack
- **Framework**: Next.js 16, React 19, TypeScript
- **Styles**: Tailwind CSS 4
- **DB/ORM**: PostgreSQL, Drizzle ORM 0.36
- **AI**: OpenAI 4.x, Vercel AI SDK
- **Charts**: Recharts 2.15
- **Other**: Faker (seeding), Neon (serverless DB opt.)

## Quick Setup
```
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev  # http://localhost:3000
```

**DB**: PostgreSQL `finance_demo` DB, `DATABASE_URL=postgresql://...`
**AI**: `OPENAI_API_KEY=sk-...` (.env.local)

## Key Files/Dirs
- `app/api/*`: API routes (accounts, transactions, analyze, chat, todos)
- `app/page.tsx`: Dashboard (auto-loads first user's AI analysis)
- `app/layout.tsx`: Root layout (AppProvider, Sidebar)
- `db/schema.ts`: Drizzle schema (users, accounts, transactions, summaries, todos, messages)
- `db/{migrate,seed,daily-update}.ts`: DB scripts
- `drizzle.config.ts`: Drizzle Kit config
- `lib/api.ts`: API helpers (runAnalysis, etc.)

## Common Tasks
| Task | Command |
|------|---------|
| View DB | `pnpm db:studio` |
| Seed data | `pnpm db:seed` |
| Add daily txns | `pnpm db:daily-update` or POST `/api/simulate-daily-update` |
| Lint | `pnpm lint` |
| Build | `pnpm build` |

## API Usage
See [API.md](API.md). Base: `/api`
- GET `/api/demo-users` → users list
- GET `/api/accounts?user_id=uuid`
- GET `/api/transactions?account_id=uuid&page=1`
- POST `/api/analyze?user_id=uuid` → AI summary
- POST/GET `/api/chat` → AI chat w/ context

## Demo Flow
1. `/api/demo-users` → pick user (e.g. Sarah Johnson)
2. `/api/accounts?user_id=...` → accounts
3. Dashboard auto-analyzes first user
4. `/graph-analysis` → charts
5. `/chat` → ask \"top categories?\"

## Editing Tips
- Read `db/schema.ts` before DB changes
- Regenerate migrations: `pnpm db:generate`
- Use AppContext for global state
- Tailwind: `@import \"tailwindcss\";` in globals.css

## Troubleshooting
- DB errors: Check PostgreSQL running, `pnpm db:migrate/seed`
- No data: Run seed script
- AI fails: Set OPENAI_API_KEY
- Styles: Tailwind 4 (new syntax)

Generated: 2025-11-30
