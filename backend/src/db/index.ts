import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// const connectionString = process.env.DATABASE_URL;

export function getDb(connectionString: string) {
  console.log(connectionString);
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}
