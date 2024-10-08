import { PrismaClient } from "@olivr-nxt/database";
import Redis from 'ioredis';
import { env } from '~/env';

export const db = new PrismaClient();
export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
});
export const rKey = (...keys: (string | number | boolean)[]) => `olivr:${keys.join(':')}`;

export async function fetchOrSet<T>(key: string, fetch: () => Promise<T>, ttl = 180): Promise<T> {
  const data = await redis.get(key);
  if (data) {
    const result = JSON.parse(data);
    if (result !== null) return result;
  }

  const result = await fetch();
  await redis.set(key, JSON.stringify(result), 'EX', ttl);
  return result;
}

export async function set<T>(key: string, value: T, ttl = 180): Promise<boolean> {
  return await redis.set(key, JSON.stringify(value), 'EX', ttl).then(() => true).catch(() => false);
}

export async function del(key: string): Promise<boolean> {
  return await redis.del(key).then(() => true).catch(() => false);
}

export async function get<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function getOrSet<T>(key: string, defaultValue: T, ttl = 180): Promise<T> {
  const data = await redis.get(key);
  if (data) {
    const result = JSON.parse(data);
    if (result !== null) return result;
  }

  await redis.set(key, JSON.stringify(defaultValue), 'EX', ttl);
  return defaultValue;
}