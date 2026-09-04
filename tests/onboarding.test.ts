import { describe, expect, test } from "bun:test";
import { onboardingApp } from "../src/onboarding";

describe("Layered Onboarding (Soft vs Hard Gate) (FR-001)", () => {
  test("soft gate allows read but blocks write; hard gate unlocks write", async () => {
    // 1. Soft gate registration (18+ declaration)
    const softRes = await onboardingApp.request("/api/onboarding/soft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ over18: true }),
    });
    expect(softRes.status).toBe(200);
    const softCookie = softRes.headers.get("set-cookie") || "";

    // 2. Soft gate allows read
    const feedRes = await onboardingApp.request("/api/feed", {
      headers: { Cookie: softCookie },
    });
    expect(feedRes.status).toBe(200);

    // 3. Soft gate blocks write
    const writeAttempt = await onboardingApp.request("/api/posts", {
      method: "POST",
      headers: { Cookie: softCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello" }),
    });
    expect(writeAttempt.status).toBe(403);

    // 4. Hard gate upgrade (age verification document hash, discarding image)
    const hardRes = await onboardingApp.request("/api/onboarding/hard", {
      method: "POST",
      headers: { Cookie: softCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ docBase64: "dummy-raw-document-image" }),
    });
    expect(hardRes.status).toBe(200);
    const hardCookie = hardRes.headers.get("set-cookie") || "";

    // 5. Hard gate allows write
    const writeAllowed = await onboardingApp.request("/api/posts", {
      method: "POST",
      headers: { Cookie: hardCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello" }),
    });
    expect(writeAllowed.status).toBe(200);
  });
});
