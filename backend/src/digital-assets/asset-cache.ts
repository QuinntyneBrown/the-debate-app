export interface CachedAsset {
  bytes: Buffer;
  contentType: string | null;
}

/** In-process cache keyed by lookup value (uniqueId string or name); entries expire after ttlMs. */
export class AssetCache {
  private readonly entries = new Map<string, { asset: CachedAsset; expires: number }>();

  constructor(
    private readonly ttlMs = 1000 * 1000,
    private readonly maxEntries = 500,
  ) {}

  get(key: string): CachedAsset | undefined {
    const hit = this.entries.get(key);
    if (!hit) return undefined;
    if (hit.expires <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return hit.asset;
  }

  set(key: string, asset: CachedAsset): void {
    if (!this.entries.has(key) && this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { asset, expires: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.entries.clear();
  }
}
