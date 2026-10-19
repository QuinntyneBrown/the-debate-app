import type { Db } from '../shared/db.js';
import { transformPassword } from './password-transform.js';

export interface IdentityUser {
  id: number;
  name: string | null;
  username: string;
  password: string;
  roles: string[];
}

/** Validates credentials and loads claims; caches users under `User: {username}`. */
export class IdentityService {
  private readonly cache = new Map<string, IdentityUser>();

  constructor(private readonly db: Db) {}

  /** Resolves true when the credentials are valid. Throws when the lookup fails. */
  async validate(username: string, password: string): Promise<boolean> {
    const user = await this.load(username);
    return user !== null && user.password === transformPassword(password);
  }

  async load(username: string): Promise<IdentityUser | null> {
    const key = `User: ${username}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const users = await this.db.query(
      'SELECT id, name, username, password FROM users WHERE lower(username) = lower($1) AND is_deleted = false',
      [username],
    );
    const row = users.rows[0];
    if (!row) return null;
    const roles = await this.db.query(
      `SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND r.is_deleted = false ORDER BY r.name`,
      [row.id],
    );
    const user: IdentityUser = { ...row, roles: roles.rows.map((r) => r.name as string) };
    this.cache.set(key, user);
    return user;
  }
}
