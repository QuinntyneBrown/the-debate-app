import { newDb } from 'pg-mem';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import { createApp } from '../src/app.js';
import { migrate } from '../src/config/migrate.js';
import type { AuthConfig } from '../src/config/auth-config.js';
import type { Db } from '../src/shared/db.js';

export const authConfig: AuthConfig = {
  jwtKey: Buffer.from('test-signing-key-test-signing-key').toString('base64'),
  jwtIssuer: 'localhost',
  jwtAudience: 'all',
  expirationMinutes: 120,
};

export const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
export const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export interface TestContext {
  app: Express;
  pool: Db;
  queries: string[];
}

export async function createTestContext(opts: { failOn?: string } = {}): Promise<TestContext> {
  const mem = newDb();
  const { Pool } = mem.adapters.createPg();
  const real = new Pool() as unknown as Db;
  const queries: string[] = [];
  const pool: Db = {
    query: (text: string, params?: unknown[]) => {
      queries.push(text);
      if (opts.failOn && text.includes(opts.failOn)) {
        return Promise.reject(new Error('database exploded'));
      }
      return real.query(text, params);
    },
  };
  await migrate(real);
  return { app: createApp(pool, authConfig), pool, queries };
}

export function signToken(
  o: { name?: string; roles?: string[]; key?: string; iss?: string; aud?: string; expiresIn?: number } = {},
): string {
  const payload: Record<string, unknown> = { [NAME_CLAIM]: o.name ?? 'admin' };
  if (o.roles) payload[ROLE_CLAIM] = o.roles;
  return jwt.sign(payload, Buffer.from(o.key ?? authConfig.jwtKey, 'base64'), {
    algorithm: 'HS256',
    issuer: o.iss ?? authConfig.jwtIssuer,
    audience: o.aud ?? authConfig.jwtAudience,
    expiresIn: o.expiresIn ?? 3600,
  });
}

export const bearer = (token = signToken()) => ({ Authorization: `Bearer ${token}` });
