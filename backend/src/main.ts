import pg from 'pg';
import { createApp } from './app.js';
import { loadAuthConfig } from './config/auth-config.js';
import { migrate } from './config/migrate.js';

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL must be set');
  const authConfig = loadAuthConfig();
  const pool = new pg.Pool({ connectionString });
  await migrate(pool);
  const port = Number(process.env.PORT ?? 3000);
  createApp(pool, authConfig).listen(port, () => {
    console.log(`TheDebateApp API listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
