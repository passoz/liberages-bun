import { describe, expect, test } from "bun:test";
import { governanceApp } from "../src/governance";

describe("Community Jury of Angels (FR-005)", () => {
  test("restricts jury voting exclusively to users with Community Angel badge", async () => {
    // 1. Angel votes -> 200
    const angelRes = await governanceApp.request("/api/jury/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disputeId: "disp-1", userId: "angel-user", isAngel: true, vote: "approve" }),
    });
    expect(angelRes.status).toBe(200);

    // 2. Regular user attempts to vote -> 403 (SPEC section 9.3: Júri Popular composto apenas pelos Anjos)
    const regularRes = await governanceApp.request("/api/jury/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disputeId: "disp-1", userId: "regular-user", isAngel: false, vote: "reject" }),
    });
    expect(regularRes.status).toBe(403);
  });
});
