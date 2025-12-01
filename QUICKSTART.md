# Quick Start Guide

## Prerequisites
- PostgreSQL installed and running
- Database created: `finance_demo`

## Setup Commands

```bash
# 1. Install dependencies (already done)
pnpm install

# 2. Generate migrations (already done)
pnpm db:generate

# 3. Run migrations
pnpm db:migrate

# 4. Seed database
pnpm db:seed

# 5. Open Drizzle Studio to view data
pnpm db:studio
```

## Environment Setup

Create `.env.local` (or use default connection):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_demo
```

## Demo Users

1. **Sarah Johnson** - sarah.johnson@demo.com
2. **Michael Chen** - michael.chen@demo.com
3. **Emily Rodriguez** - emily.rodriguez@demo.com

Each user has 2-3 accounts with 6 months of transaction history.

## Available Scripts

- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Apply migrations
- `pnpm db:seed` - Seed demo data
- `pnpm db:daily-update` - Add daily transactions
- `pnpm db:studio` - Open database GUI

## Next Steps

1. Install PostgreSQL if needed
2. Create the `finance_demo` database
3. Run migrations: `pnpm db:migrate`
4. Seed data: `pnpm db:seed`
5. Start building your app!

See [DATABASE.md](file:///home/divinne/Desktop/Coding/finance_demo/DATABASE.md) for detailed documentation.
