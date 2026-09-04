import { describe, expect, test } from "bun:test";
import { fotologApp } from "../src/fotolog";

describe("Fotolog 24h Expiration & Automatic Facial Blur (FR-005)", () => {
  test("enforces facial blur by default and sets strict 24h TTL expiration", async () => {
    const res = await fotologApp.request("/api/fotolog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-photo-1", imageUrl: "selfie-day.jpg" }),
    });

    expect(res.status).toBe(200);
    const post = await res.json();

    // SPEC section 7.2: Toda foto sobe com blur no rosto por padrão
    expect(post.faceBlur).toBe(true);

    // SPEC section 5.2: Expira estritamente após 24h
    const ttlMs = post.expiresAt - post.createdAt;
    expect(ttlMs).toBe(24 * 3600 * 1000);
  });
});
