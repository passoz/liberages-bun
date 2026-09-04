import { Hono } from "hono";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";

export const JWT_SECRET = process.env.JWT_SECRET || "liberages-dev-secret-key-32chars!";

export const app = new Hono();

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

    const payload = {
      sub: "user-uuid-v7-default",
      role: "single",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };

    const token = await sign(payload, JWT_SECRET);

    setCookie(c, "auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24,
    });

    return c.json({ success: true, token });
  } catch {
    return c.json({ error: "Bad Request" }, 400);
  }
});
