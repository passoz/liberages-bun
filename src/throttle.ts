import type { MiddlewareHandler } from "hono";

interface AttemptRecord {
  count: number;
  resetAt: number;
}

export function createThrottleMiddleware(maxAttempts = 5, windowMs = 60 * 1000): MiddlewareHandler {
  const attempts = new Map<string, AttemptRecord>();

  return async (c, next) => {
    const key = c.req.header("x-forwarded-for") || "local-client";
    const now = Date.now();

    const record = attempts.get(key);
    if (record) {
      if (now > record.resetAt) {
        attempts.delete(key);
      } else if (record.count >= maxAttempts) {
        return c.json({ error: "Too Many Requests" }, 429);
      }
    }

    await next();

    if (c.res.status === 401) {
      const current = attempts.get(key);
      if (current && now <= current.resetAt) {
        current.count += 1;
      } else {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
      }
    }
  };
}
