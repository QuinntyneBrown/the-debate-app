import { randomUUID } from 'node:crypto';
import type { Db } from '../shared/db.js';
import { NamedEntityRepository, type NamedEntityDto } from '../shared/named-entity.js';
import type { CachedAsset } from './asset-cache.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class DigitalAssetRepository extends NamedEntityRepository {
  constructor(db: Db) {
    super(db, 'digital_assets', 'name', 'name');
  }

  /** CRUD insert: empty bytes, fresh unique id. */
  override insert(name: string | null): Promise<NamedEntityDto> {
    return this.store(name, null, Buffer.alloc(0));
  }

  async store(name: string | null, contentType: string | null, bytes: Buffer): Promise<NamedEntityDto> {
    const r = await this.db.query(
      `INSERT INTO digital_assets (unique_id, name, content_type, bytes) VALUES ($1, $2, $3, $4) RETURNING ${this.columns}`,
      [randomUUID(), name, contentType, bytes],
    );
    return r.rows[0];
  }

  async findByUniqueId(uniqueId: string): Promise<CachedAsset | null> {
    if (!UUID.test(uniqueId)) return null;
    return this.firstOrNull(
      'SELECT content_type, bytes FROM digital_assets WHERE unique_id = $1 AND is_deleted = false ORDER BY id LIMIT 1',
      [uniqueId.toLowerCase()],
    );
  }

  findFirstByName(name: string): Promise<CachedAsset | null> {
    return this.firstOrNull(
      'SELECT content_type, bytes FROM digital_assets WHERE name = $1 AND is_deleted = false ORDER BY id LIMIT 1',
      [name],
    );
  }

  private async firstOrNull(sql: string, params: unknown[]): Promise<CachedAsset | null> {
    const row = (await this.db.query(sql, params)).rows[0];
    return row ? { bytes: Buffer.from(row.bytes), contentType: row.content_type ?? null } : null;
  }
}
