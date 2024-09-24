import { neonConfig, Pool } from "@neondatabase/serverless";
import { config } from 'dotenv';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { afterAll, beforeAll, beforeEach } from 'vitest';
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

  // Initialize the database connection
});

afterAll(async () => {
  // Clean up the database after all tests
  // This could involve dropping all tables or specific cleanup logic
  // For example:
  // await db.delete(schema.users).execute();
  // await db.delete(schema.friendships).execute();

  // Close the database connection
  // await (db as any).close();
});

// Reset the database state before each test
beforeEach(async () => {
  // Clear all tables
  console.log("Resetting database");
  config({ path: '.test.vars' });
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  db = drizzle(pool, { schema });
  
  await db.delete(schema.friendships).execute();
  await db.delete(schema.users).execute();

  console.log("Database reset");
});