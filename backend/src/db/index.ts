import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

//DB_HOST=localhost
// DB_PORT=5432b
// DB_USERNAME=root
// DB_PASSWORD=5s1waU7ZDUdxrt
// DB_DATABASE=doge_labs_friend_list
//database url with the above credentials including password and database name
const sql = neon('postgresql://doge_labs_friend_list_owner:3GcN0aWFjgkx@ep-holy-block-a56xh866.us-east-2.aws.neon.tech/doge_labs_friend_list?sslmode=require');
export const db = drizzle(sql, {
	schema,
});
