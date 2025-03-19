import { Redis } from "@upstash/redis"

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Redis keys
export const REDIS_KEYS = {
  PROMOS: "lemonde:promos",
}

// Initialize Redis with default data if needed
export async function initializeRedis() {
  // Check if promos key exists
  const exists = await redis.exists(REDIS_KEYS.PROMOS)

  // If not, initialize with empty array
  if (!exists) {
    await redis.set(REDIS_KEYS.PROMOS, [])
    console.log("Redis initialized with default data")
  }
}

