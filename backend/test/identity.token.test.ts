// Traces to: L2-013
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authConfig, createTestContext, NAME_CLAIM, ROLE_CLAIM } from './helpers.js';

const form = (username: string, password: string) =>
  `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

const token = (app: Parameters<typeof request>[0], username: string, password: string) =>
  request(app).post('/api/user/token').type('form').send(form(username, password));

describe('L2-013 token endpoint', () => {
  it('1: valid credentials (username case-insensitive) return a JWT', async () => {
    const { app } = await createTestContext();
    const res = await token(app, 'ADMIN', 'thegreatwpdebate').expect(200);
    expect(res.body.access_token.split('.')).toHaveLength(3);
    expect(res.body.token_type).toBe('bearer');
    expect(res.body.expires_in).toBe(7200);
  });

  it('2: unknown username is an OAuth error Invalid credentials', async () => {
    const { app } = await createTestContext();
    const res = await token(app, 'nobody', 'x').expect(400);
    expect(res.body).toEqual({ error: 'invalid_grant', error_description: 'Invalid credentials' });
  });

  it('3: wrong password is an OAuth error Invalid credentials', async () => {
    const { app } = await createTestContext();
    const res = await token(app, 'admin', 'wrong').expect(400);
    expect(res.body.error_description).toBe('Invalid credentials');
  });

  it('4: a validation failure reports the exception message', async () => {
    const { app } = await createTestContext({ failOn: 'FROM users' });
    const res = await token(app, 'admin', 'thegreatwpdebate').expect(400);
    expect(res.body.error_description).toBe('database exploded');
  });

  it('5: iss, aud, exp and HS256 signature with the base64-decoded key', async () => {
    const { app } = await createTestContext();
    const res = await token(app, 'admin', 'thegreatwpdebate');
    const decoded = jwt.verify(res.body.access_token, Buffer.from(authConfig.jwtKey, 'base64'), {
      algorithms: ['HS256'],
      complete: true,
    });
    const p = decoded.payload as jwt.JwtPayload;
    expect(p.iss).toBe('localhost');
    expect(p.aud).toBe('all');
    expect(p.exp! - p.iat!).toBe(120 * 60);
  });

  it('6: carries one name claim (submitted username) and one role claim per role', async () => {
    const { app } = await createTestContext();
    const res = await token(app, 'Admin', 'thegreatwpdebate');
    const p = jwt.decode(res.body.access_token) as Record<string, unknown>;
    expect(p[NAME_CLAIM]).toBe('Admin');
    expect(p[ROLE_CLAIM]).toEqual(['Admin']);
  });

  it('7: plain HTTP is not rejected', async () => {
    const { app } = await createTestContext();
    const res = await token(app, 'admin', 'thegreatwpdebate');
    expect(res.status).toBe(200);
  });

  it('8: second request for the same username is served from the cache', async () => {
    const { app, queries } = await createTestContext();
    await token(app, 'admin', 'thegreatwpdebate').expect(200);
    const before = queries.length;
    await token(app, 'admin', 'thegreatwpdebate').expect(200);
    expect(queries.length).toBe(before);
  });

  it('rejects unsupported grant types', async () => {
    const { app } = await createTestContext();
    const res = await request(app).post('/api/user/token').type('form').send('grant_type=client_credentials');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('unsupported_grant_type');
  });
});
