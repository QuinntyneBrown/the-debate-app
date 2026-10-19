import type { Db } from './db.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

/**
 * Base repository enforcing soft-delete semantics: reads and update matching
 * only ever see rows with is_deleted = false, and removal only sets the flag.
 * `table` is a trusted constant supplied by subclasses, never user input.
 */
export class SoftDeletableRepository<T extends Row = Row> {
  constructor(
    protected readonly db: Db,
    protected readonly table: string,
    protected readonly columns = '*',
  ) {}

  async getById(id: number): Promise<T | null> {
    if (!Number.isInteger(id)) return null;
    const r = await this.db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE id = $1 AND is_deleted = false`,
      [id],
    );
    return (r.rows[0] as T | undefined) ?? null;
  }

  async getAll(): Promise<T[]> {
    const r = await this.db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE is_deleted = false ORDER BY id`,
    );
    return r.rows as T[];
  }

  /** Matches only non-deleted rows, so a deleted id is never revived by an update. */
  findForUpdate(id: number | null | undefined): Promise<T | null> {
    return id == null ? Promise.resolve(null) : this.getById(Number(id));
  }

  /** Sets is_deleted = true; resolves false when no non-deleted row matched. */
  async softDelete(id: number): Promise<boolean> {
    if (!Number.isInteger(id)) return false;
    const r = await this.db.query(
      `UPDATE ${this.table} SET is_deleted = true WHERE id = $1 AND is_deleted = false RETURNING id`,
      [id],
    );
    return r.rows.length > 0;
  }
}

/** Parses a query-string id; non-numeric values yield NaN (treated as not found). */
export const parseId = (value: unknown): number => (typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN);
