#!/usr/bin/env node
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

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

  // Create postgres client for migrations
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  await migrate(db, { migrationsFolder: './drizzle' });

  await migrationClient.end();

  console.log('✅ Migrations completed!');
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
