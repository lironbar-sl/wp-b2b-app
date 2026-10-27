import { Redis } from '@upstash/redis';

// Shared key-value store. Uses Upstash Redis (Vercel Marketplace) when configured,
// otherwise falls back to process memory — fine for local dev, but on Vercel each
// function instance has its own memory, so production needs Redis.

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

export const isPersistentKv = redis !== null;

declare global {
  var __kvMemory: Map<string, unknown> | undefined;
}
if (!global.__kvMemory) global.__kvMemory = new Map();
const memory = global.__kvMemory;

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function kvGet<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(key)) ?? null;
  return (memory.get(key) as T | undefined) ?? null;
}

export async function kvSet<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  memory.set(key, value);
}

/** Sets the key only if it doesn't exist. Returns true if this call set it. */
export async function kvSetIfAbsent<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<boolean> {
  if (redis) return (await redis.set(key, value, { nx: true, ex: ttlSeconds })) === 'OK';
  if (memory.has(key)) return false;
  memory.set(key, value);
  return true;
}
