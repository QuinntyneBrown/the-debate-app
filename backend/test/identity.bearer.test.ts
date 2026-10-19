// Traces to: L2-014
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { bearer, createTestContext, signToken } from './helpers.js';
import { loadAuthConfig } from '../src/config/auth-config.js';

const protectedCall = (app: Parameters<typeof request>[0], headers: Record<string, string> = {}) =>
  request(app).post('/api/user/add').set(headers).send({ name: 'x' });

describe('L2-014 bearer token validation', () => {
  it('1: a valid token authorizes the request', async () => {
    const { app } = await createTestContext();
    await protectedCall(app, bearer()).expect(200);
  });

  it('2: no Authorization header yields 401', async () => {
    const { app } = await createTestContext();
    await protectedCall(app).expect(401);
  });

  it('3: expired, wrong audience, wrong issuer, bad signature yield 401', async () => {
    const { app } = await createTestContext();
    const bad = [
      signToken({ expiresIn: -10 }),
      signToken({ aud: 'other' }),
      signToken({ iss: 'other' }),
      signToken({ key: Buffer.from('another-key-another-key-another').toString('base64') }),
      'not-a-token',
    ];
    for (const t of bad) await protectedCall(app, bearer(t)).expect(401);
  });

  it('4: missing auth configuration fails startup naming authConfiguration', () => {
    expect(() => loadAuthConfig({})).toThrow(/authConfiguration/);
    expect(loadAuthConfig({ JWT_KEY: 'a2V5' })).toMatchObject({
      jwtKey: 'a2V5',
      jwtIssuer: 'localhost',
      jwtAudience: 'all',
      expirationMinutes: 120,
    });
  });
});
