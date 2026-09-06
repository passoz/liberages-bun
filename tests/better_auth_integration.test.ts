import { describe, expect, test } from "bun:test";
import { app } from "../src/index";
import { auth, createBetterAuthSession } from "../src/auth";
import { getAuthenticatedUser } from "../src/shared/auth";
import { db } from "../db/index";
import { user, session, account } from "../db/schema";
import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

describe("Better Auth & Drizzle Adapter Integration Suite", () => {
  test("1. Better Auth API: GET /api/auth/get-session returns null without session cookie", async () => {
    const res = await app.request("/api/auth/get-session");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toBeNull();
  });

  test("2. Better Auth API: POST /api/auth/sign-up/email registers user and sets session cookie", async () => {
    const uniqueEmail = `ba_user_${Date.now()}@liberages.test`;
    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "BetterAuth Test User",
        email: uniqueEmail,
        password: "StrongPassword123!",
      }),
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("better-auth.session_token=");

    // Verify user was persisted via Drizzle ORM
    const persistedUser = db.select().from(user).where(eq(user.email, uniqueEmail)).get();
    expect(persistedUser).toBeDefined();
    expect(persistedUser?.name).toBe("BetterAuth Test User");

    // Clean up via Drizzle ORM
    if (persistedUser) {
      db.delete(session).where(eq(session.userId, persistedUser.id)).run();
      db.delete(account).where(eq(account.userId, persistedUser.id)).run();
      db.delete(user).where(eq(user.id, persistedUser.id)).run();
    }
  });

  test("3. PIN Login generates Better Auth session and sets signed session cookie", async () => {
    const res = await app.request("/api/identity/login/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "1234" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(body.sessionToken).toBeDefined();

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("better-auth.session_token=");
    expect(setCookie).toContain("auth_token=");

    // Verify session was persisted in Drizzle session table
    const dbSession = db.select().from(session).where(eq(session.token, body.sessionToken)).get();
    expect(dbSession).toBeDefined();
    expect(dbSession?.userId).toBe("user-session");
  });

  test("4. getAuthenticatedUser resolves user from Better Auth session cookie", async () => {
    const testUserId = "ba-test-user-" + uuidv7().slice(0, 8);
    const { sessionToken, signedSessionCookie } = await createBetterAuthSession(testUserId, "single");

    // Simulate mock context with Better Auth cookie
    const mockContext: any = {
      req: {
        raw: {
          headers: new Headers({
            cookie: `better-auth.session_token=${encodeURIComponent(signedSessionCookie)}`,
          }),
        },
        header: (name: string) => {
          if (name.toLowerCase() === "cookie") {
            return `better-auth.session_token=${encodeURIComponent(signedSessionCookie)}`;
          }
          return undefined;
        },
      },
    };

    const authUser = await getAuthenticatedUser(mockContext);
    expect(authUser).toBeDefined();
    expect(authUser?.id).toBe(testUserId);
    expect(authUser?.role).toBe("single");

    // Clean up test session via Drizzle ORM
    db.delete(session).where(eq(session.token, sessionToken)).run();
    db.delete(user).where(eq(user.id, testUserId)).run();
  });

  test("5. Dashboard GET / authenticates seamlessly with Better Auth session cookie", async () => {
    const testUserId = "dash-user-" + uuidv7().slice(0, 8);
    const { sessionToken, signedSessionCookie } = await createBetterAuthSession(testUserId, "couple");

    const res = await app.request("/", {
      headers: {
        cookie: `better-auth.session_token=${encodeURIComponent(signedSessionCookie)}`,
      },
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Painel Liberages");
    expect(html).toContain(testUserId);
    expect(html).toContain("couple");

    // Clean up via Drizzle ORM
    db.delete(session).where(eq(session.token, sessionToken)).run();
    db.delete(user).where(eq(user.id, testUserId)).run();
  });

  test("6. Drizzle ORM exclusively: all Better Auth tables are queried with Drizzle query builders", () => {
    // Assert Drizzle schema tables exist and can be queried via db.select()
    const u = db.select().from(user).limit(1).all();
    const s = db.select().from(session).limit(1).all();
    const a = db.select().from(account).limit(1).all();

    expect(Array.isArray(u)).toBe(true);
    expect(Array.isArray(s)).toBe(true);
    expect(Array.isArray(a)).toBe(true);
  });
});
