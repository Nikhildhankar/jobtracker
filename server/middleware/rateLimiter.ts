import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory sliding window rate limiter factory.
 * @param windowMs Duration of the rate limit window in milliseconds.
 * @param maxRequests Maximum allowed requests per window per IP.
 * @param message Error message returned on exceeding rate limit.
 */
export function createRateLimiter(
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
  message = 'Too many requests, please try again later.'
) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup interval to avoid memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetTime <= now) {
        store.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    let record = store.get(ip);
    if (!record || record.resetTime <= now) {
      record = { count: 1, resetTime: now + windowMs };
      store.set(ip, record);
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: 'TooManyRequests',
        message,
        retryAfterSeconds,
      });
    }

    record.count += 1;
    next();
  };
}

// Pre-configured rate limiters for auth endpoints
export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 30, 'Too many authentication attempts. Please try again in 15 minutes.');
export const signupRateLimiter = createRateLimiter(60 * 60 * 1000, 10, 'Too many accounts created from this IP. Please try again later.');
