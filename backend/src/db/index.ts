import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const connectionString = 'postgresql://doge_labs_friend_list_owner:3GcN0aWFjgkx@ep-holy-block-a56xh866.us-east-2.aws.neon.tech/doge_labs_friend_list?sslmode=require';

export function getDb() {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}
