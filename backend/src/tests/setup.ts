import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';
import ws from 'ws';
import { runMigrations } from '../db/migrate';
import * as schema from '../db/schema';

let db: NeonDatabase<typeof schema>;

// Set the WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Set up a test database connection
beforeAll(async () => {
  // Apply migrations
  try {
    await runMigrations();
    console.log("Migrations applied successfully");
  } catch (error) {
    console.error("Error applying migrations:", error);
    throw error;
  }
});

afterAll(async () => {
  // Clean up logic here
});

// Reset the database state before each test
beforeEach(async () => {
  console.log("Resetting database");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  db = drizzle(pool, { schema });
  
  await Promise.all([
    db.delete(schema.friendships).execute(),
    db.delete(schema.users).execute(),
  ]);

  console.log("Database reset");
});

// Export a function to get the database connection
export function getTestDb() {
  return db;
}

// Mock Cloudflare Worker environment
vi.mock('cloudflare:test', () => ({
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
}));