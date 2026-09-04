import { describe, expect, test } from "bun:test";
import { recordLike } from "../src/matching";

describe("Mutual Match & Friendship Categorization (FR-007)", () => {
  test("generates a categorized friendship ('real' or 'virtual') upon reciprocal likes", () => {
    // 1. UserA likes UserB
    const firstLike = recordLike("userA", "userB", "real");
    expect(firstLike.matched).toBe(false);

    // 2. UserB reciprocates like to UserA
    const reciprocalLike = recordLike("userB", "userA", "real");
    expect(reciprocalLike.matched).toBe(true);
    expect(reciprocalLike.friendship).toBeDefined();
    expect(reciprocalLike.friendship?.category).toBe("real");
  });
});
