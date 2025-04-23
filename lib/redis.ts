// lib/redis.ts
import { createClient, RedisClientType } from "redis";

let redis: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (redis) {
    if (redis.isReady) return redis;
    await redis.disconnect();
  }

  redis = createClient({
    url: process.env.REDIS_URL,
  });

  redis.on("error", (err) => {
    console.error("Redis error:", err);
    redis = null; // Reset on error to allow reconnection
  });

  redis.on("reconnecting", () => console.log("Redis reconnecting..."));
  redis.on("ready", () => console.log("Redis connected"));

  await redis.connect();
  return redis;
}