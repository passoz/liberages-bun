import { Hono } from "hono";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { makeSignature } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import * as schema from "../db/schema";

export const JWT_SECRET = process.env.JWT_SECRET || "liberages-dev-secret-key-32chars!";
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || JWT_SECRET;
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3333";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
  user: {
    additionalFields: {
      nickname: { type: "string" },
      accountType: { type: "string", defaultValue: "single" },
      pin: { type: "string" },
      gateStatus: { type: "string", defaultValue: "none" },
      verificationHash: { type: "string" },
      isVerified: { type: "number", defaultValue: 0 },
      isAngel: { type: "number", defaultValue: 0 },
      isPremium: { type: "number", defaultValue: 0 },
      xpLevel: { type: "number", defaultValue: 1 },
      city: { type: "string" },
      fetishes: { type: "string", defaultValue: "[]" },
      bio: { type: "string" },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
});

/**
 * Creates or synchronizes a Better Auth session using Drizzle ORM
 * and generates both Better Auth session cookie and backward-compatible JWT token.
 */
export async function createBetterAuthSession(userId: string, accountType = "single") {
  const ctx = await auth.$context;
  const now = new Date();

  // Ensure user exists in Better Auth 'user' table via Drizzle ORM
  const existingUser = db.select().from(schema.user).where(eq(schema.user.id, userId)).get();
  if (!existingUser) {
    db.insert(schema.user).values({
      id: userId,
      name: userId,
      email: `${userId.toLowerCase().replace(/[^a-z0-9]/g, "")}@liberages.internal`,
      emailVerified: false,
      accountType,
      createdAt: now,
      updatedAt: now,
    }).run();
  }

  // Create session record in Better Auth via internalAdapter (Drizzle ORM)
  const newSession = await ctx.internalAdapter.createSession(userId, false);
  const signature = await makeSignature(newSession.token, ctx.secret);
  const signedSessionCookie = `${newSession.token}.${signature}`;

  // Compatibility JWT token
  const payload = {
    sub: userId,
    role: accountType,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const token = await sign(payload, JWT_SECRET);

  return {
    session: newSession,
    sessionToken: newSession.token,
    signedSessionCookie,
    token,
  };
}

export const app = new Hono();

// Mount standard Better Auth handlers under /api/auth/*
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Legacy /api/login/pin compatibility route
app.post("/api/login/pin", async (c) => {
  try {
    const body = await c.req.json();
    const pin = body?.pin;

    if (!pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return c.json({ error: "Invalid PIN format" }, 400);
    }

    // In MVP phase 1, mock/valid PIN verification
    if (pin !== "1234") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = "user-uuid-v7-default";
    const role = "single";
    const { token, sessionToken, signedSessionCookie } = await createBetterAuthSession(userId, role);

    // Set legacy cookie for compatibility
    setCookie(c, "auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24,
    });

    // Set Better Auth session cookie
    setCookie(c, "better-auth.session_token", encodeURIComponent(signedSessionCookie), {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return c.json({ success: true, token, sessionToken });
  } catch {
    return c.json({ error: "Bad Request" }, 400);
  }
});
