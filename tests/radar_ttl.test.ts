import { describe, expect, test } from "bun:test";
import { radarApp } from "../src/radar";

describe("Radar TTL Auto-Expiration (EC-001)", () => {
  test("excludes expired check-in records from radar headcount", async () => {
    const spotId = "spot-ttl-test";
    const now = Date.now();

    // Active check-in (expires in 2 hours)
    await radarApp.request("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId, ttlHours: 2, userId: "active-user" }),
    });

    // Already-expired check-in
    await radarApp.request("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId, ttlHours: 1, userId: "expired-user", expiresAt: now - 5000 }),
    });

    const res = await radarApp.request(`/api/radar/${spotId}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    // Only 1 should be counted as active
    expect(data.activeCount).toBe(1);
  });
});
