import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from './schema';

// Load environment variables
// config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Please set it in .env.local');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });