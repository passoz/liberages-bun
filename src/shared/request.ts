import type { Context } from "hono";

export async function getRequestBody(c: Context): Promise<Record<string, any>> {
  const contentType = c.req.header("content-type") || "";
  if (contentType.includes("application/json")) {
    return c.req.json().catch(() => ({}));
  }
  return c.req.parseBody().catch(() => ({}));
}
