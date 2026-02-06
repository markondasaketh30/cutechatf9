/**
 * Simple in-memory rate limiter for development
 * For production, consider using Redis-based rate limiting
 */

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

// Rate limit configurations for different endpoints
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  "auth:login": { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  "auth:register": { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  "auth:password-reset": { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  "chat:message": { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per minute
  default: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
};

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    const config = rateLimitConfigs.default;
    if (now - value.windowStart > config.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Check if a request is within rate limits
 * @param key - Unique identifier (IP address or userId)
 * @param endpoint - The endpoint being accessed
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(key: string, endpoint: string): RateLimitResult {
  const config = rateLimitConfigs[endpoint] || rateLimitConfigs.default;
  const now = Date.now();
  const storeKey = `${key}:${endpoint}`;

  const existing = rateLimitStore.get(storeKey);

  // Check if we're in a new window
  if (!existing || now - existing.windowStart > config.windowMs) {
    // Start a new window
    rateLimitStore.set(storeKey, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(now + config.windowMs),
    };
  }

  // Check if limit exceeded
  if (existing.count >= config.maxRequests) {
    const resetAt = new Date(existing.windowStart + config.windowMs);
    const retryAfter = Math.ceil((resetAt.getTime() - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter,
    };
  }

  // Increment count
  existing.count++;
  rateLimitStore.set(storeKey, existing);

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: new Date(existing.windowStart + config.windowMs),
  };
}

/**
 * Reset rate limit for a specific key/endpoint combination
 * Useful after successful authentication to prevent lockout issues
 */
export function resetRateLimit(key: string, endpoint: string): void {
  const storeKey = `${key}:${endpoint}`;
  rateLimitStore.delete(storeKey);
}

/**
 * Get the client IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
