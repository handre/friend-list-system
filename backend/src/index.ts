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
import { getDb } from "./db";
import { users, friendships } from "./db/schema";
import { eq, and, sql, or, like } from 'drizzle-orm';

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
app.post('/users', async (c) => {
  const { name, email } = await c.req.json()
  const db = getDb();
  try {
    const newUser = await db.insert(users).values({ name, email }).returning();
    return c.json(newUser[0], 201)
  } catch (error) {
    return c.json({ error: 'Error creating user' }, 500)
  }
})

// Get all users
app.get('/users', async (c) => {
  const db = getDb();
  try {
    const allUsers = await db.select().from(users);
    return c.json(allUsers)
  } catch (error) {
    return c.json({ error: 'Error fetching users' }, 500)
  }
})

// Add a friend
app.post('/users/:id/friends', async (c) => {
  const userId = parseInt(c.req.param('id'))
  const { friendId } = await c.req.json()
  const db = getDb();
  try {
    const newFriendship = await db.insert(friendships).values({ userId, friendId }).returning();
    return c.json(newFriendship[0], 201)
  } catch (error) {
    return c.json({ error: 'Error adding friend' }, 500)
  }
})

// Remove a friend
app.delete('/users/:id/friends/:friendId', async (c) => {
  const userId = parseInt(c.req.param('id'))
  const friendId = parseInt(c.req.param('friendId'))
  const db = getDb();
  try {
    await db.delete(friendships)
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.friendId, friendId)
      ));
    return c.json({ message: 'Friend removed successfully' }, 200)
  } catch (error) {
    return c.json({ error: 'Error removing friend' }, 500)
  }
})

// Get user's friends
app.get('/users/:id/friends', async (c) => {
  const userId = parseInt(c.req.param('id'))
  const db = getDb();
  try {
    const friends = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    })
    .from(friendships)
    .innerJoin(users, eq(friendships.friendId, users.id))
    .where(eq(friendships.userId, userId));
    return c.json(friends)
  } catch (error) {
    return c.json({ error: 'Error fetching friends' }, 500)
  }
})

// Get stats
app.get('/stats', async (c) => {
  const db = getDb();
  try {
    const totalUsers = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(users);
    const avgFriends = await db.select({ 
      avg: sql<number>`friend_count` 
    })
    .from(
      db.select({
        userId: friendships.userId,
        friend_count: sql<number>`cast(count(*) as int)`
      })
      .from(friendships)
      .groupBy(friendships.userId)
      .as('friend_count')
    );

    return c.json({ 
      totalUsers: totalUsers[0]?.count ?? 0, 
      averageFriends: avgFriends[0]?.avg ?? 0 
    })
  } catch (error) {
    return c.json({ error: 'Error calculating stats' }, 500)
  }
})

// Search users
app.get('/users/search', async (c) => {
  const query = c.req.query('q')
  const db = getDb();
  try {
    const searchResults = await db.select()
      .from(users)
      .where(or(
        like(users.name, `%${query}%`),
        like(users.email, `%${query}%`)
      ))
      .limit(10);
    return c.json(searchResults)
  } catch (error) {
    return c.json({ error: 'Error searching users' }, 500)
  }
})

// Delete user and associated friendships
app.delete('/users/:id', async (c) => {
  const userId = parseInt(c.req.param('id'))
  const db = getDb();
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
app.get('/users/:id', async (c) => {
  const userId = parseInt(c.req.param('id'))
  const db = getDb();
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json(user[0])
  } catch (error) {
    return c.json({ error: 'Error fetching user' }, 500)
  }
})


export default app