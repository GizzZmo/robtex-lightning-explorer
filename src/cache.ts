/**
 * Simple in-memory TTL cache for Robtex API responses.
 * Reduces free-tier rate-limit pressure for repeated lookups.
 */

export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

export class TtlCache {
  private store = new Map<string, CacheEntry>();
  private readonly defaultTtlMs: number;
  private readonly maxEntries: number;

  constructor(options?: { ttlMs?: number; maxEntries?: number }) {
    this.defaultTtlMs = options?.ttlMs ?? Number(process.env.CACHE_TTL_MS) || 60_000;
    this.maxEntries = options?.maxEntries ?? 500;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest expired, or first key if none expired
      const now = Date.now();
      for (const [k, e] of this.store) {
        if (e.expiresAt <= now) this.store.delete(k);
      }
      if (this.store.size >= this.maxEntries) {
        const first = this.store.keys().next().value;
        if (first !== undefined) this.store.delete(first);
      }
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  get stats() {
    return {
      size: this.store.size,
      maxEntries: this.maxEntries,
      ttlMs: this.defaultTtlMs,
    };
  }
}

/** Shared process-wide cache instance. */
export const responseCache = new TtlCache();
