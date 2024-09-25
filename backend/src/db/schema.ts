import { relations } from "drizzle-orm";
import { serial, text, timestamp, integer, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
	return {
		emailIdx: uniqueIndex("email_idx").on(table.email),
	};
});

export const friendships = pgTable("friendships", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").notNull().references(() => users.id),
	friendId: integer("friend_id").notNull().references(() => users.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
	return {
		uniqueFriendship: uniqueIndex("unique_friendship_idx").on(table.userId, table.friendId),
	};
});

export const usersRelations = relations(users, ({ many }) => ({
	friendships: many(friendships),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
	user: one(users, { fields: [friendships.userId], references: [users.id] }),
	friend: one(users, { fields: [friendships.friendId], references: [users.id] }),
}));
