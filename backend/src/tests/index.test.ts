import { describe, it, expect } from 'vitest';
import app from '../index'; // Import your Hono app

describe('API Endpoints', () => {
  
  // Test the root endpoint
  describe('GET /', () => {
    it('should return "Friends List API"', async () => {
      const req = new Request('http://localhost/');
      const res = await app.request(req);
      
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Friends List API');
    });
  });

  // Test the CREATE USER endpoint
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'Test User', email: 'test.user@example.com' };
      const req = new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const res = await app.request(req);
      
      expect(res.status).toBe(201);
      const responseBody = await res.json() as { id: string; name: string; email: string };
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.name).toBe(newUser.name);
      expect(responseBody.email).toBe(newUser.email);
    });

    it('should return 400 for invalid data', async () => {
      const invalidUser = { name: 'T', email: 'invalid-email' };
      const req = new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUser),
      });
      const res = await app.request(req);
      
      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty('error');
    });
  });

  // Additional tests for other endpoints...
});