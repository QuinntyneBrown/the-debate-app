// Traces to: L2-009
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { bearer, createTestContext, signToken } from './helpers.js';

describe('L2-009 current user endpoint', () => {
  it('1: no token or an invalid token returns 200 with an empty body', async () => {
    const { app } = await createTestContext();
    for (const headers of [{}, bearer('garbage')]) {
      const res = await request(app).get('/api/user/current').set(headers);
      expect(res.status).toBe(200);
      expect(res.text).toBe('');
    }
  });

  it('2: a token whose name matches a user returns that user', async () => {
    const { app, pool } = await createTestContext();
    const id = (await pool.query("SELECT id FROM users WHERE username = 'admin'")).rows[0].id;
    const res = await request(app).get('/api/user/current').set(bearer()).expect(200);
    expect(res.body).toEqual({ id, name: 'admin' });
  });

  it('4: a token whose name matches no user returns 200 with an empty body', async () => {
    const { app } = await createTestContext();
    const res = await request(app).get('/api/user/current').set(bearer(signToken({ name: 'ghost' })));
    expect(res.status).toBe(200);
    expect(res.text).toBe('');
  });

  it('4: a soft-deleted user is not matched', async () => {
    const { app, pool } = await createTestContext();
    await pool.query("UPDATE users SET is_deleted = true WHERE username = 'admin'");
    const res = await request(app).get('/api/user/current').set(bearer());
    expect(res.status).toBe(200);
    expect(res.text).toBe('');
  });
});
