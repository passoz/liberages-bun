import { describe, expect, test } from "bun:test";
import { radarApp } from "../src/radar";

describe("Anonymous Radar Aggregation (FR-004)", () => {
  test("radar returns only aggregate headcount without exposing attendees or user identities", async () => {
    // Add two checkins
    await radarApp.request("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId: "club-anon-1", ttlHours: 2, userId: "secret-user-1" }),
    });

    await radarApp.request("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId: "club-anon-1", ttlHours: 3, userId: "secret-user-2" }),
    });

    const res = await radarApp.request("/api/radar/club-anon-1");
    expect(res.status).toBe(200);

    const data = await res.json();
    // Rule BR-003 & SPEC section 4.2: Jamais revela identidade; frontend só recebe "X pessoas estão no local Y"
    expect(data.attendees).toBeUndefined();
    expect(data.userIds).toBeUndefined();
    expect(data.activeCount).toBeGreaterThanOrEqual(2);
    expect(typeof data.activeCount).toBe("number");
  });
});
