// Traces to: L2-018
import { describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';
import { readFileSync } from 'node:fs';
import { migrate } from '../src/config/migrate.js';
import { transformPassword } from '../src/auth/password-transform.js';
import type { Db } from '../src/shared/db.js';

async function freshDb() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool() as unknown as Db;
  await migrate(pool);
  return pool;
}

describe('L2-018 seed data', () => {
  it('1: admin user exists with the transformed password', async () => {
    const pool = await freshDb();
    const r = await pool.query("SELECT password FROM users WHERE username = 'admin'");
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].password).toBe(transformPassword('thegreatwpdebate'));
  });

  it('2: Introduction meeting exists with agenda Introduction', async () => {
    const pool = await freshDb();
    const r = await pool.query("SELECT agenda FROM meetings WHERE name = 'Introduction'");
    expect(r.rows).toEqual([{ agenda: 'Introduction' }]);
  });

  it('3: running the seed again updates rather than duplicates', async () => {
    const pool = await freshDb();
    await pool.query("UPDATE meetings SET agenda = 'changed' WHERE name = 'Introduction'");
    await pool.query(readFileSync(new URL('../migrations/002_seed.sql', import.meta.url), 'utf8'));
    expect((await pool.query("SELECT 1 FROM users WHERE username = 'admin'")).rows).toHaveLength(1);
    const m = await pool.query("SELECT agenda FROM meetings WHERE name = 'Introduction'");
    expect(m.rows).toEqual([{ agenda: 'Introduction' }]);
  });

  it('4: schema is migrated automatically and migrations are applied once', async () => {
    const pool = await freshDb();
    await migrate(pool);
    const r = await pool.query('SELECT name FROM schema_migrations');
    expect(r.rows.map((x) => x.name).sort()).toEqual(['001_schema.sql', '002_seed.sql', '003_content_and_assets.sql']);
  });
});
