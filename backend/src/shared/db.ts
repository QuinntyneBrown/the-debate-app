/** Minimal query surface shared by `pg.Pool` and the pg-mem pool used in tests. */
export interface Db {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query(text: string, params?: unknown[]): Promise<{ rows: any[] }>;
}
