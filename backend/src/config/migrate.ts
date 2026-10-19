import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { Db } from '../shared/db.js';

const defaultDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../migrations');

async function appliedNames(db: Db): Promise<{ name: string }[]> {
  try {
    return (await db.query('SELECT name FROM schema_migrations')).rows;
  } catch {
    // first run: the bookkeeping table does not exist yet
    await db.query('CREATE TABLE schema_migrations (name TEXT PRIMARY KEY)');
    return [];
  }
}

/** Applies unapplied `*.sql` migrations in filename order, recording each once. */
export async function migrate(db: Db, dir: string = defaultDir): Promise<string[]> {
  const applied = new Set((await appliedNames(db)).map((r) => r.name as string));
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const ran: string[] = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    await db.query(await readFile(path.join(dir, file), 'utf8'));
    await db.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    ran.push(file);
  }
  return ran;
}
