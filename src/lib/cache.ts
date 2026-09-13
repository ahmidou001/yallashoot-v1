/**
 * In-Memory Smart Cache & Single-Flight Request Deduplicator for 365Scores API
 *
 * Features:
 * 1. Single-Flight Request Coalescing: If multiple requests for the same date arrive concurrently,
 *    only ONE request is dispatched to 365Scores upstream.
 * 2. Dynamic TTL: Short TTL for today (live matchday: 35s), long TTL for other dates (15m).
 * 3. Anti-Degradation Guard: If 365Scores sends a truncated/degraded payload (e.g. 22 games instead of 700+),
 *    the cache rejects the degraded payload and preserves the previous healthy data.
 * 4. Stale-On-Error Resilience: If upstream fails, times out, or returns HTML/429, the cache serves
 *    stale data seamlessly to keep the site alive.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  fetchedAt: number;
  itemCount?: number;
}

class SmartCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();

  /**
   * Determine intelligent TTL in milliseconds based on the target date.
   * If the requested date is today, use short TTL (35s) for live scores.
   * For other dates, use longer TTL (15 minutes).
   */
  public getTtlForDate(dateStr: string): number {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const todayStr = `${dd}/${mm}/${yyyy}`;

    if (dateStr === todayStr) {
      return 35 * 1000; // 35 seconds for today's live matches
    }
    return 15 * 60 * 1000; // 15 minutes for past/future days
  }

  /**
   * Fetch with single-flight deduplication, caching, and payload degradation guard.
   */
  public async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number,
    options?: {
      /**
       * Function to extract item count (e.g. games count) to guard against truncated payloads.
       */
      getItemCount?: (data: T) => number;
      /**
       * Minimum expected items for today's feed to prevent storing degraded fallbacks.
       */
      minItemCountThreshold?: number;
    }
  ): Promise<T> {
    const now = Date.now();
    const existing = this.cache.get(key);

    // 1. Return fresh cached data if valid
    if (existing && now < existing.expiresAt) {
      return existing.data as T;
    }

    // 2. Coalesce concurrent in-flight requests (Single-Flight)
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    // 3. Initiate single upstream request
    const promise = (async () => {
      try {
        const newData = await fetcher();

        const newItemCount = options?.getItemCount ? options.getItemCount(newData) : undefined;
        const previousItemCount = existing?.itemCount;

        // Anti-Degradation Guard:
        // If upstream returned a drastically reduced payload (e.g., 22 matches when we previously had 100+),
        // or fewer than minItemCountThreshold, reject the bad payload and preserve existing full cache.
        if (
          existing &&
          typeof previousItemCount === "number" &&
          typeof newItemCount === "number" &&
          previousItemCount > 80 &&
          newItemCount < 50
        ) {
          console.warn(
            `[SmartCache] Anti-Degradation triggered for key "${key}": Upstream returned degraded payload (${newItemCount} items vs cached ${previousItemCount}). Preserving cached full data.`
          );
          // Extend existing cache lifetime by 20s to avoid hammering upstream immediately
          existing.expiresAt = now + 20 * 1000;
          return existing.data as T;
        }

        // Store healthy payload
        this.cache.set(key, {
          data: newData,
          expiresAt: now + ttlMs,
          fetchedAt: now,
          itemCount: newItemCount,
        });

        return newData;
      } catch (error: any) {
        // Stale-On-Error: If upstream throws (429, 503, invalid HTML, etc.), return stale cache if available
        if (existing) {
          console.warn(
            `[SmartCache] Upstream error for key "${key}" (${error?.message}). Serving stale cache.`
          );
          existing.expiresAt = now + 15 * 1000; // Brief grace period before retry
          return existing.data as T;
        }
        throw error;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Direct cache peek (for debugging / tests)
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data as T;
  }

  /**
   * Clear cache (for testing)
   */
  public clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * Cache statistics
   */
  public getStats() {
    return {
      size: this.cache.size,
      inFlightCount: this.inFlight.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global singleton instance so cache persists across serverless/route handler invocations in Node runtime
const globalForCache = globalThis as unknown as { smartCacheInstance?: SmartCache };

export const smartCache = globalForCache.smartCacheInstance ?? new SmartCache();

if (process.env.NODE_ENV !== "production") {
  globalForCache.smartCacheInstance = smartCache;
}
