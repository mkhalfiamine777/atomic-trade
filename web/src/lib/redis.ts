import { Redis } from "@upstash/redis";

// Ensure that these environment variables are set in your .env file
// UPSTASH_REDIS_REST_URL=your_url
// UPSTASH_REDIS_REST_TOKEN=your_token

let redisClient: Redis | null = null;

try {
    redisClient = Redis.fromEnv();
    console.log("🟢 Upstash Redis client initialized successfully.");
} catch (error) {
    console.warn("⚠️ Upstash Redis credentials not found. Redis features (like Rate Limiting) will be bypassed.");
}

export const redis = redisClient;
