#!/usr/bin/env node
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';

// Load .env.local file
config({ path: '.env.local' });

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not defined');
    console.error('Make sure you have a .env.local file with DATABASE_URL set');
    process.exit(1);
  }

  console.log('⏳ Running migrations...');
  console.log('📍 Database:', process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'hidden');

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('✅ Migrations completed!');
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
