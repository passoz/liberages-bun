import { describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import { app } from "../src/index";
import { JWT_SECRET } from "../src/auth";

describe("GET / (SSR Dashboard)", () => {
  test("renders the authenticated dashboard HTML with HTTP 200", async () => {
    const token = await sign(
      { sub: "user-1", role: "single", exp: Math.floor(Date.now() / 1000) + 3600 },
      JWT_SECRET
    );

    const res = await app.request("/", {
      headers: {
        Cookie: `auth_token=${token}`,
      },
    });

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Painel Liberages");
  });
});
