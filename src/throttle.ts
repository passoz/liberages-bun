import type { MiddlewareHandler } from "hono";

export function createThrottleMiddleware(maxAttempts = 5): MiddlewareHandler {
  return async (c, next) => {
    await next();
  };
}
