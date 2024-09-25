import { describe, it, expect } from 'vitest';
import app from '../index'; // Import your Hono app
import { env } from 'cloudflare:test';
import { users, friendships } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { getTestDb } from './setup';

describe('API Endpoints', () => {
  // Test the root endpoint
  describe('GET /', () => {
    it('should return "Friends List API"', async () => {
      const req = new Request('http://localhost/');
      const res = await app.request(req, env);
      
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Friends List API');
    });
  });

  // Test the CREATE USER endpoint
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
        }),
      }, env);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Test User');
      expect(body.email).toBe('test@example.com');
    });

    it('should return 400 for invalid data', async () => {
      const invalidUser = { name: 'T', email: 'invalid-email' };
      const req = new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUser),
      });
      const res = await app.request(req, env);
      
      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty('error');
    });

    it('should return 400 when creating a user with an existing email', async () => {
      // First, create a user
      await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Existing User',
          email: 'existing@example.com',
        }),
      }, env);

      // Try to create another user with the same email
      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Duplicate User',
          email: 'existing@example.com',
        }),
      }, env);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('already exists');
    });
  });

  // Test the GET /users endpoint
  describe('GET /users', () => {
    it('should retrieve all users with pagination', async () => {
      // Seed users
      await getTestDb().insert(users).values([
        { name: 'Alice', email: 'alice2@example.com' },
        { name: 'Bob', email: 'bob2@example.com' },
        // Add more users as needed
      ]);

      const res = await app.request('/users?page=1', {
        method: 'GET',
      }, env);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('users');
      expect(body.users.length).toBeGreaterThan(0);
      expect(body).toHaveProperty('totalPages');
      expect(body).toHaveProperty('currentPage', 1);
    });
  });

  // Test the POST /users/:id/friends endpoint
  describe('POST /users/:id/friends', () => {
    it('should add a friend to a user', async () => {
      // Seed users
      const [user1, user2] = await getTestDb().insert(users).values([
        { name: 'Charlie', email: 'charlie2@example.com' },
        { name: 'Dave', email: 'dave2@example.com' },
      ]).returning();

      const res = await app.request(`/users/${user1.id}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: user2.id }),
      }, env);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body.userId).toBe(user1.id);
      expect(body.friendId).toBe(user2.id);
    });

    it('should return 400 when creating a friendship that already exists', async () => {
      // First, create two users
      const [user1, user2] = await getTestDb().insert(users).values([
        { name: 'User One', email: 'user1@example.com' },
        { name: 'User Two', email: 'user2@example.com' },
      ]).returning();

      // Create the initial friendship
      await app.request(`/users/${user1.id}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: user2.id }),
      }, env);

      // Try to create the same friendship again
      const res = await app.request(`/users/${user1.id}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: user2.id }),
      }, env);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('already exists');
    });
  });

  // Test the DELETE /users/:id/friends/:friendId endpoint
  describe('DELETE /users/:id/friends/:friendId', () => {
    it('should remove a friend from a user', async () => {
      // Seed users and friendship
      const [user1, user2] = await getTestDb().insert(users).values([
        { name: 'Eve', email: 'eve@example.com' },
        { name: 'Frank', email: 'frank@example.com' },
      ]).returning();

      const friendship = await getTestDb().insert(friendships).values({
        userId: user1.id,
        friendId: user2.id,
      }).returning();

      const res = await app.request(`/users/${user1.id}/friends/${user2.id}`, {
        method: 'DELETE',
      }, env);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'Friend removed successfully');

      // Verify deletion
      const deleted = await getTestDb().select().from(friendships).where(eq(friendships.id, friendship[0].id));
      expect(deleted.length).toBe(0);
    });
  });

  // Test the GET /users/:id/friends endpoint
  describe('GET /users/:id/friends', () => {
    it('should retrieve a user\'s friends with pagination', async () => {
      // Seed users and friendships
      const [user, friend1, friend2] = await getTestDb().insert(users).values([
        { name: 'Grace', email: 'grace@example.com' },
        { name: 'Heidi', email: 'heidi@example.com' },
        { name: 'Ivan', email: 'ivan@example.com' },
      ]).returning();

      await getTestDb().insert(friendships).values([
        { userId: user.id, friendId: friend1.id },
        { userId: user.id, friendId: friend2.id },
      ]);

      const res = await app.request(`/users/${user.id}/friends?page=1`, {
        method: 'GET',
      }, env);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('friends');
      expect(body.friends.length).toBe(2);
      expect(body).toHaveProperty('totalPages');
      expect(body).toHaveProperty('currentPage', 1);
    });
  });

  // Test the GET /stats endpoint
  describe('GET /stats', () => {
    it('should retrieve user and friendship statistics', async () => {
      // Seed users and friendships
      await getTestDb().insert(users).values([
        { name: 'Judy', email: 'judy@example.com' },
        { name: 'Karl', email: 'karl@example.com' },
      ]);

      const res = await app.request('/stats', {
        method: 'GET',
      }, env);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('totalUsers');
      expect(body).toHaveProperty('averageFriends');
    });
  });

  // Test the GET /users/search endpoint
  describe('GET /users/search', () => {
    it('should search users by query with pagination', async () => {
      // Seed users
      await getTestDb().insert(users).values([
        { name: 'Laura', email: 'laura@example.com' },
        { name: 'Mallory', email: 'mallory@example.com' },
        { name: 'Niaj', email: 'niaj@example.com' },
      ]);

      const res = await app.request('/users/search?q=la&page=1', {
        method: 'GET',
      }, env);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('users');
      expect(body.users.length).toBeGreaterThan(0);
      expect(body).toHaveProperty('totalPages');
      expect(body).toHaveProperty('currentPage', 1);
    });
  });

  // Test the DELETE /users/:id endpoint
  describe('DELETE /users/:id', () => {
    it('should delete a user and associated friendships', async () => {
      // Seed users and friendships
      const [user, friend] = await getTestDb().insert(users).values([
        { name: 'Olivia', email: 'olivia@example.com' },
        { name: 'Peggy', email: 'peggy@example.com' },
      ]).returning();

      await getTestDb().insert(friendships).values({
        userId: user.id,
        friendId: friend.id,
      });

      const res = await app.request(`/users/${user.id}`, {
        method: 'DELETE',
      }, env);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'User and associated friendships deleted successfully');

      // Verify user deletion
      const deletedUser = await getTestDb().select().from(users).where(eq(users.id, user.id));
      expect(deletedUser.length).toBe(0);

      // Verify friendships deletion
      const deletedFriendships = await getTestDb().select().from(friendships).where(or(
        eq(friendships.userId, user.id),
        eq(friendships.friendId, user.id)
      ));
      expect(deletedFriendships.length).toBe(0);
    });
  });

  // Test the GET /users/:id endpoint
  describe('GET /users/:id', () => {
    it('should retrieve a single user by ID', async () => {
      // Seed a user
      const [user] = await getTestDb().insert(users).values([
        { name: 'Trent', email: 'trent@example.com' },
      ]).returning();

      const res = await app.request(`/users/${user.id}`, {
        method: 'GET',
      }, env);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('id', user.id);
      expect(body).toHaveProperty('name', 'Trent');
      expect(body).toHaveProperty('email', 'trent@example.com');
    });

    it('should return 404 for a non-existent user', async () => {
      const res = await app.request('/users/9999', {
        method: 'GET',
      }, env);

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('error', 'User not found');
    });
  });
});