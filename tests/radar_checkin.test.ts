import { describe, expect, test } from "bun:test";
import { radarApp } from "../src/radar";

describe("Catalog Check-in with TTL (FR-003)", () => {
  test("creates check-in with enforced TTL between 1h and 4h and rejects out-of-range TTL", async () => {
    // 1. Valid TTL (2 hours)
    const validRes = await radarApp.request("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId: "motel-oasis", ttlHours: 2, userId: "user-1" }),
    });
    expect(validRes.status).toBe(200);
    const validBody = await validRes.json();
    expect(validBody.ttlHours).toBe(2);

    // 2. Invalid TTL (< 1h)
    const tooShortRes = await radarApp.request("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId: "motel-oasis", ttlHours: 0.5, userId: "user-1" }),
    });
    expect(tooShortRes.status).toBe(400);

    // 3. Invalid TTL (> 4h)
    const tooLongRes = await radarApp.request("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId: "motel-oasis", ttlHours: 5, userId: "user-1" }),
    });
    expect(tooLongRes.status).toBe(400);
  });
});
