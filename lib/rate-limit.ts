import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash-backed rate limit. Optional — when env vars are missing, returns a
 * no-op limiter so local dev works without Redis.
 */
type Limiter = {
  limit: (id: string) => Promise<{
    success: boolean;
    remaining: number;
    limit: number;
    reset: number;
  }>;
};

const noopLimiter: Limiter = {
  async limit() {
    return { success: true, remaining: 999, limit: 999, reset: 0 };
  },
};

function makeLimiter(
  key: string,
  window: Parameters<typeof Ratelimit.slidingWindow>[0],
  interval: Parameters<typeof Ratelimit.slidingWindow>[1],
): Limiter {
  const hasRedis =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!hasRedis) return noopLimiter;
  const redis = Redis.fromEnv();
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(window, interval),
    analytics: true,
    prefix: `tag-bi:${key}`,
  });
}

export const brandApiLimiter = makeLimiter("brand-api", 60, "1 m");
export const chatLimiter = makeLimiter("chat", 20, "1 h");

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "anonymous"
  );
}
