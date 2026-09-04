import { describe, expect, test } from "bun:test";
import { checkWebOfTrustVerification } from "../src/governance";

describe("Web of Trust Verification (FR-006)", () => {
  test("grants verified blue badge automatically when 4 real physical friends attest", () => {
    // 1. 3 friends -> not yet verified
    const threeFriends = checkWebOfTrustVerification(3);
    expect(threeFriends.isVerified).toBe(false);

    // 2. 4 friends -> verified! (SPEC section 9.3: O cobiçado selo azul exige que 4 usuários reais atestem)
    const fourFriends = checkWebOfTrustVerification(4);
    expect(fourFriends.isVerified).toBe(true);
    expect(fourFriends.badgeColor).toBe("blue");
  });
});
