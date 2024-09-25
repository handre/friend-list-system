import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL || '');

const db = drizzle(sql, { schema });

export const seedDatabase = async () => {
	try {
		// Seed users
		const seededUsers = await db.insert(schema.users).values([
			{ name: 'Alice', email: 'alice@example.com' },
			{ name: 'Bob', email: 'bob@example.com' },
			{ name: 'Charlie', email: 'charlie@example.com' },
			{ name: 'Dave', email: 'dave@example.com' },
		]).returning();

		// Seed friendships
		await db.insert(schema.friendships).values([
			{ userId: seededUsers[0].id, friendId: seededUsers[1].id },
			{ userId: seededUsers[0].id, friendId: seededUsers[2].id },
			{ userId: seededUsers[1].id, friendId: seededUsers[3].id },
		]);
	} catch (error) {
		console.error(error);
		throw new Error("Failed to seed database");
	}
};

// Keep this for running the seed script directly
if (require.main === module) {
	seedDatabase();
}
