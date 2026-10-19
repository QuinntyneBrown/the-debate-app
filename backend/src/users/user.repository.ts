import type { Db } from '../shared/db.js';
import { SoftDeletableRepository } from '../shared/soft-deletable-repository.js';

export interface UserRow {
  id: number;
  name: string | null;
}

export class UserRepository extends SoftDeletableRepository<UserRow> {
  constructor(db: Db) {
    super(db, 'users', 'id, name');
  }

  async insert(name: string | null): Promise<UserRow> {
    const r = await this.db.query('INSERT INTO users (name) VALUES ($1) RETURNING id, name', [name]);
    return r.rows[0];
  }

  async updateName(id: number, name: string | null): Promise<UserRow> {
    const r = await this.db.query('UPDATE users SET name = $2 WHERE id = $1 RETURNING id, name', [id, name]);
    return r.rows[0];
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const r = await this.db.query(
      'SELECT id, name FROM users WHERE username = $1 AND is_deleted = false',
      [username],
    );
    return r.rows[0] ?? null;
  }
}
