import { describe, expect, test } from "bun:test";
import { processSwipe } from "../src/matching";

describe("Daily Swipe Limit (30 likes/day for Free Tier) (SC-001)", () => {
  test("allows up to 30 likes for free users and blocks the 31st like", () => {
    const freeUserId = "free-user-quota-test";

    // 30 swipes allowed
    for (let i = 1; i <= 30; i++) {
      const res = processSwipe(freeUserId, `candidate-${i}`, false);
      expect(res.allowed).toBe(true);
    }

    // 31st swipe must be blocked
    const thirtyFirst = processSwipe(freeUserId, "candidate-31", false);
    expect(thirtyFirst.allowed).toBe(false);
    expect(thirtyFirst.reason).toContain("30 likes/dia");

    // Premium user has unlimited likes
    const premiumRes = processSwipe("premium-user-1", "candidate-unlimited", true);
    expect(premiumRes.allowed).toBe(true);
  });
});
