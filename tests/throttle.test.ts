import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createThrottleMiddleware } from "../src/throttle";

describe("Login Throttle Protection (EC-001)", () => {
  test("returns HTTP 429 on 6th consecutive failed attempt", async () => {
    const app = new Hono();
    const throttle = createThrottleMiddleware(5);

    app.post("/login", throttle, async (c) => {
      const body = await c.req.json();
      if (body.pin !== "1234") {
        return c.json({ error: "Invalid PIN" }, 401);
      }
      return c.json({ ok: true });
    });

    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const res = await app.request("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "0000" }),
      });
      expect(res.status).toBe(401);
    }

    // 6th attempt should be throttled
    const sixthRes = await app.request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "0000" }),
    });

    expect(sixthRes.status).toBe(429);
  });
});
