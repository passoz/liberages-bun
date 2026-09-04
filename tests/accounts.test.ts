import { describe, expect, test } from "bun:test";
import { createAccount, isUnifiedProfile } from "../src/accounts";

describe("Unified Couple Accounts (FR-002)", () => {
  test("couple account functions as a single indivisible profile entity without subprofiles", () => {
    const couple = createAccount({
      type: "couple",
      nickname: "CasalLiberalSP",
    });

    expect(couple.type).toBe("couple");
    expect(couple.subProfiles).toBeUndefined();
    expect(isUnifiedProfile(couple)).toBe(true);
  });
});
