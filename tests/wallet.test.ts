import { describe, expect, test } from "bun:test";
import { creditTokens, requestCashOut, transferP2P } from "../src/wallet";

describe("Closed-Loop Token Wallet (FR-009)", () => {
  test("credits token balance and strictly prohibits cash-out and direct P2P transfers", () => {
    // 1. Credit tokens
    const credit = creditTokens("user-wallet-1", 500);
    expect(credit.success).toBe(true);
    expect(credit.balance).toBe(500);

    // 2. Zero Cash-out Rule (SPEC section 8.1 & BR-005)
    const cashOut = requestCashOut("user-wallet-1", 100);
    expect(cashOut.allowed).toBe(false);
    expect(cashOut.reason).toContain("Zero Cash-out");

    // 3. Zero P2P Rule (SPEC section 8.1 & BR-005)
    const p2p = transferP2P("user-wallet-1", "user-wallet-2", 50);
    expect(p2p.allowed).toBe(false);
    expect(p2p.reason).toContain("Zero P2P");
  });
});
