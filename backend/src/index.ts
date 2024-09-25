/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getTestDb } from './tests/setup';
import { users, friendships } from "./db/schema";
import { eq, and, sql, or, like } from 'drizzle-orm';
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { getDb } from './db';

// Define the environment interface
interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>()

// Add CORS middleware
app.use('*', cors({
  origin: 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

app.get('/', (c) => c.text('Friends List API'))

// Create a new user
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

app.post('/users', zValidator('json', createUserSchema), async (c) => {
  const { name, email } = c.req.valid('json')
  const db = getDb(c.env.DATABASE_URL);
  try {
    const newUser = await db.insert(users).values({ name, email }).returning();
    return c.json(newUser[0], 201)
  } catch (error: any) {
    if (error.message?.includes('duplicate key value violates unique constraint "email_idx"')) {
      return c.json({ error: 'User with this email already exists' }, 400)
    }
    console.error('Error creating user:', error);
    return c.json({ error: 'Error creating user' }, 500)
  }
})

// Get all users
const getUsersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1')
})

app.get('/users', zValidator('query', getUsersQuerySchema), async (c) => {
  const { page } = c.req.valid('query')
  const db = getDb(c.env.DATABASE_URL);
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const [allUsers, totalCount] = await Promise.all([
      db
        .select({
          // Select individual user fields instead of spreading the table
          id: users.id,
          name: users.name,
          email: users.email,
          friendCount: sql<number>`COUNT(friendships.id)`.as('friendCount')
        })
        .from(users)
        .leftJoin(friendships, eq(users.id, friendships.userId))
        .groupBy(users.id)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`CAST(COUNT(*) AS INT)` }).from(users)
    ]);

    return c.json({
      users: allUsers,
      totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Error fetching users' }, 500);
  }
})

// Add a friend
const addFriendSchema = z.object({
  friendId: z.number().int().positive()
})

app.post('/users/:id/friends', zValidator('json', addFriendSchema), async (c) => {
  const userId = parseInt(c.req.param('id'))
  const { friendId } = c.req.valid('json')
  const db = getDb(c.env.DATABASE_URL);
  try {
    const newFriendship = await db.insert(friendships).values({ userId, friendId }).returning();
    return c.json(newFriendship[0], 201)
  } catch (error: any) {
    if (error.message?.includes('duplicate key value violates unique constraint "unique_friendship_idx"')) {
      return c.json({ error: 'User with this email already exists' }, 400)
    }
    console.error('Error adding friend:', error);
    return c.json({ error: 'Error adding friend' }, 500)
  }
})

// Remove a friend
const removeFriendParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
  friendId: z.string().regex(/^\d+$/).transform(Number)
})

app.delete('/users/:id/friends/:friendId', zValidator('param', removeFriendParamsSchema), async (c) => {
  const { id: userId, friendId } = c.req.valid('param')
  const db = getDb(c.env.DATABASE_URL);
  try {
    await db.delete(friendships)
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.friendId, friendId)
      ));
    return c.json({ message: 'Friend removed successfully' }, 200)
  } catch (error) {
    console.error('Error removing friend:', error);
    return c.json({ error: 'Error removing friend' }, 500)
  }
})

// Get user's friends
const getUserFriendsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
  page: z.string().regex(/^\d+$/).transform(Number).default('1')
})

app.get('/users/:id/friends', zValidator('param', getUserFriendsSchema.pick({ id: true })), zValidator('query', getUserFriendsSchema.pick({ page: true })), async (c) => {
  const { id: userId } = c.req.valid('param')
  const { page } = c.req.valid('query')
  const limit = 5;
  const offset = (page - 1) * limit;
  const db = getDb(c.env.DATABASE_URL);

  try {
    const [friends, totalCount] = await Promise.all([
      db.select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(eq(friendships.userId, userId))
      .limit(limit)
      .offset(offset),
      db.select({ count: sql<number>`cast(count(*) as int)` })
        .from(friendships)
        .where(eq(friendships.userId, userId))
    ]);

    return c.json({
      friends,
      totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return c.json({ error: 'Error fetching friends' }, 500);
  }
})

// Get stats
app.get('/stats', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  try {
    const stats = await db.select({
      totalUsers: sql<number>`cast(count(distinct ${users.id}) as int)`,
      totalFriendships: sql<number>`cast(count(${friendships.id}) as int)`,
    }).from(users)
    .leftJoin(friendships, eq(users.id, friendships.userId));

    const averageFriends = (stats[0]?.totalFriendships ?? 0) / (stats[0]?.totalUsers ?? 1);

    return c.json({ 
      totalUsers: stats[0]?.totalUsers || 0,
      averageFriends: parseFloat(averageFriends.toFixed(2)) || 0
    })
  } catch (error) {
    console.error('Error calculating stats:', error);
    return c.json({ error: 'Error calculating stats' }, 500)
  }
})

// Search users
const searchUsersSchema = z.object({
  q: z.string().min(1),
  page: z.string().regex(/^\d+$/).transform(Number).default('1')
})

app.get('/users/search', zValidator('query', searchUsersSchema), async (c) => {
  const { q: query, page } = c.req.valid('query')
  const limit = 5;
  const offset = (page - 1) * limit;
  const db = getDb(c.env.DATABASE_URL);

  try {
    const [searchResults, totalCount] = await Promise.all([
      db.select()
        .from(users)
        .where(or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`)
        ))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`cast(count(*) as int)` })
        .from(users)
        .where(or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`)
        ))
    ]);

    return c.json({
      users: searchResults,
      totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return c.json({ error: 'Error searching users' }, 500);
  }
})

// Delete user and associated friendships
const deleteUserSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
})

app.delete('/users/:id', zValidator('param', deleteUserSchema), async (c) => {
  const { id: userId } = c.req.valid('param')
  const db = getDb(c.env.DATABASE_URL);
  try {
    await db.transaction(async (tx) => {
      // Delete all friendships where the user is either the user or the friend
      await tx.delete(friendships).where(
        or(
          eq(friendships.userId, userId),
          eq(friendships.friendId, userId)
        )
      );
      // Delete the user
      const deletedUser = await tx.delete(users).where(eq(users.id, userId)).returning();
      
      if (deletedUser.length === 0) {
        throw new Error('User not found');
      }
    });
    return c.json({ message: 'User and associated friendships deleted successfully' }, 200)
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return c.json({ error: 'User not found' }, 404)
    }
    console.error('Error deleting user:', error);
    return c.json({ error: 'Error deleting user' }, 500)
  }
})

// Get a single user
app.get('/users/:id', zValidator('param', deleteUserSchema), async (c) => {
  const { id: userId } = c.req.valid('param')
  const db = getDb(c.env.DATABASE_URL);
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json(user[0])
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Error fetching user' }, 500)
  }
})


export default app