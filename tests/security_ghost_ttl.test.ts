import { describe, expect, test } from "bun:test";
import { securityApp, isUserGhost } from "../src/security";

describe("Automatic Ghost Visibility Restoration (EC-001)", () => {
  test("restores normal visibility when the ghost timer expires", async () => {
    const userId = "ghost-ttl-user";
    const now = Date.now();

    // Expired ghost entry (expired 5 seconds ago)
    await securityApp.request("/api/ghost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, expiresAt: now - 5000 }),
    });

    // SPEC section 7.3: Temporizador opcional: o usuário pode programar a desativação automática
    // When timer expires, user returns to visible (isUserGhost returns false)
    const ghostStatus = isUserGhost(userId);
    expect(ghostStatus).toBe(false);
  });
});
