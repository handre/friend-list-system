import { Hono } from 'hono';
import { getDb } from '../db';
import app from '../index'; // Ensure your app is exported from index.ts

// Set up a test database connection
beforeAll(async () => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://...'; // Your test DB URL
  // Initialize or migrate your test database if necessary
});

afterAll(async () => {
  // Clean up test data or close database connections
});