import { describe, expect, test } from "bun:test";
import { app } from "../src/auth";

describe("POST /api/login/pin", () => {
  test("authenticates valid 4-digit pin and returns 200 with jwt cookie", async () => {
    const res = await app.request("/api/login/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "1234" }),
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("auth_token=");
  });
});
