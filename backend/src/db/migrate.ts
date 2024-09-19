import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";

const sql = neon('postgresql://doge_labs_friend_list_owner:3GcN0aWFjgkx@ep-holy-block-a56xh866.us-east-2.aws.neon.tech/doge_labs_friend_list?sslmode=require');

const db = drizzle(sql);

const main = async () => {
	try {
		await migrate(db, {
			migrationsFolder: "src/db/migrations",
		});

		console.log("Migration successful");
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

main();
