import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { JWT_SECRET } from "../auth";

export interface AuthenticatedUser {
  id: string;
  role: string;
}

export async function getAuthenticatedUser(c: any): Promise<AuthenticatedUser | null> {
  const token =
    getCookie(c, "auth_token") ||
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "");

  if (token) {
    try {
      const payload: any = await verify(token, JWT_SECRET, "HS256");
      if (payload?.sub) {
        return {
          id: String(payload.sub),
          role: String(payload.role || "single"),
        };
      }
    } catch {
      return null;
    }
  }

  // Fallback for non-production tests if explicitly supplied via header
  if (process.env.NODE_ENV !== "production") {
    const devUserId = c.req.header("x-authenticated-user") || c.req.header("x-user-id");
    if (devUserId) {
      return { id: devUserId, role: "single" };
    }
  }

  return null;
}
