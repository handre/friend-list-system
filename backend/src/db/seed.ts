import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL || '');

const db = drizzle(sql, {
	schema,
});

const main = async () => {
	try {
		console.log("Seeding database");
		// Add your seeding logic here
	} catch (error) {
		console.error(error);
		throw new Error("Failed to seed database");
	}
};

main();
