const toCamel = (key: string): string => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/** Maps snake_case column names (e.g. `is_deleted`) to camelCase (`isDeleted`). */
export function toCamelCase<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]));
}
