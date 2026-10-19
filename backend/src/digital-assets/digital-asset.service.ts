import { NamedEntityService, type NamedEntityDto } from '../shared/named-entity.js';
import type { AssetCache, CachedAsset } from './asset-cache.js';
import type { DigitalAssetRepository } from './digital-asset.repository.js';

/** Strips surrounding quotes, removes the directory portion, then replaces & with "and". */
export function sanitiseFileName(raw: string): string {
  const unquoted = raw.trim().replace(/^["']+|["']+$/g, '');
  const base = unquoted.split(/[\\/]/).pop() ?? '';
  return base.replace(/&/g, 'and');
}

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export class DigitalAssetService extends NamedEntityService {
  constructor(
    private readonly assets: DigitalAssetRepository,
    private readonly cache: AssetCache,
  ) {
    super(assets, 'name', 'Digital asset');
  }

  async store(files: UploadedFile[]): Promise<NamedEntityDto[]> {
    const stored: NamedEntityDto[] = [];
    for (const f of files) {
      stored.push(await this.assets.store(sanitiseFileName(f.originalname), f.mimetype, f.buffer));
    }
    return stored;
  }

  /** Cache key is the uniqueId string, or the name when no uniqueId is supplied. */
  async serve(uniqueId?: string, name?: string): Promise<CachedAsset | null> {
    const key = uniqueId ? `id:${uniqueId}` : name ? `name:${name}` : null;
    if (!key) return null;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const asset = uniqueId ? await this.assets.findByUniqueId(uniqueId) : await this.assets.findFirstByName(name!);
    if (asset) this.cache.set(key, asset);
    return asset;
  }

  override async addOrUpdate(dto: Record<string, unknown>) {
    const result = await super.addOrUpdate(dto);
    this.cache.clear();
    return result;
  }

  override async remove(id: number): Promise<number> {
    const result = await super.remove(id);
    this.cache.clear();
    return result;
  }
}
