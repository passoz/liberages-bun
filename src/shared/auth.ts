import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { JWT_SECRET, auth } from "../auth";

export interface AuthenticatedUser {
  id: string;
  role: string;
}

export async function getAuthenticatedUser(c: any): Promise<AuthenticatedUser | null> {
  // 1. Better Auth session inspection via cookies or Authorization header
  try {
    const rawHeaders = c.req?.raw?.headers;
    if (rawHeaders) {
      const sessionData = await auth.api.getSession({ headers: rawHeaders });
      if (sessionData?.user) {
        return {
          id: String(sessionData.user.id),
          role: String((sessionData.user as any).accountType || "single"),
        };
      }
    }
  } catch {
    // Continue to fallback check
  }

  // 2. Backward compatibility: verify JWT auth_token cookie or Bearer token
  const token =
    getCookie(c, "auth_token") ||
    c.req?.header?.("authorization")?.replace(/^Bearer\s+/i, "");

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
      // Invalid JWT
    }
  }

  // Fallback for non-production tests if explicitly supplied via header
  if (process.env.NODE_ENV !== "production") {
    const devUserId = c.req?.header?.("x-authenticated-user") || c.req?.header?.("x-user-id");
    if (devUserId) {
      return { id: devUserId, role: "single" };
    }
  }

  return null;
}
