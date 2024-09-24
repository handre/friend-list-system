import { describe, it, expect } from 'vitest';
import app from '../index'; // Import your Hono app
import { env } from 'cloudflare:test';

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
      const res = await app.request(req);
      
      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty('error');
    });
  });

  // Additional tests for other endpoints...
});