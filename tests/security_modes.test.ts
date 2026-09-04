import { describe, expect, test } from "bun:test";
import { securityApp } from "../src/security";

describe("Disguise Mode and Ghost Mode with Timer (FR-003)", () => {
  test("triggers panic button disguise redirect and activates ghost mode with timer", async () => {
    // 1. Panic button / Fake mode (SPEC section 7.3)
    const panicRes = await securityApp.request("/api/panic", { method: "POST" });
    expect(panicRes.status).toBe(200);
    const panicData = await panicRes.json();
    expect(panicData.disguiseUrl).toContain("calculadora");

    // 2. Ghost Mode activation with timer (SPEC section 7.3)
    const ghostRes = await securityApp.request("/api/ghost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "ghost-user-1", durationMinutes: 120 }),
    });
    expect(ghostRes.status).toBe(200);
    const ghostData = await ghostRes.json();
    expect(ghostData.isGhost).toBe(true);
    expect(ghostData.expiresAt).toBeGreaterThan(Date.now());
  });
});
