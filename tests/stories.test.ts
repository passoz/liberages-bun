import { describe, expect, test } from "bun:test";
import { storiesApp } from "../src/stories";

describe("Erotic Stories & Content Publishing Permissions (FR-008)", () => {
  test("allows public reading but restricts story publishing to Premium or High-XP users", async () => {
    // 1. Reading is allowed for all (SPEC section 6: Usuários Free: Permissão apenas para ler)
    const readRes = await storiesApp.request("/api/stories");
    expect(readRes.status).toBe(200);

    // 2. Free user without high XP tries to publish -> 403 Forbidden
    const freePublish = await storiesApp.request("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Noite Secreta",
        text: "Era uma vez...",
        isPremium: false,
        xpLevel: 2,
      }),
    });
    expect(freePublish.status).toBe(403);

    // 3. Premium user publishes -> 200 OK
    const premiumPublish = await storiesApp.request("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Noite Secreta",
        text: "Era uma vez...",
        isPremium: true,
        xpLevel: 2,
      }),
    });
    expect(premiumPublish.status).toBe(200);
  });
});
