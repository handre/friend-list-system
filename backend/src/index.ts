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
import { db } from "./db";
import { users, friendships } from "./db/schema";
import { eq, and, sql } from 'drizzle-orm';

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

// JWT middleware
app.use('/api/*', async (c, next) => {
//   const auth = jwt({
//     secret: c.env.JWT_SECRET,
//   })
//   return auth(c, next)
})

// Database connection
app.use('*', async (c, next) => {
  await next()
})

app.get('/', (c) => c.text('Friends List API'))

// Create a new user
app.post('/users', async (c) => {
  const { name, email } = await c.req.json()
  try {
    const newUser = await db.insert(users).values({ name, email }).returning();
    return c.json(newUser[0], 201)
  } catch (error) {
    return c.json({ error: 'Error creating user' }, 500)
  }
})

// Get all users
app.get('/users', async (c) => {
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

export default app