import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const pool = new Pool({ connectionString: 'postgresql://doge_labs_friend_list_owner:3GcN0aWFjgkx@ep-holy-block-a56xh866.us-east-2.aws.neon.tech/doge_labs_friend_list?sslmode=require' });

export const db = drizzle(pool, { schema });
