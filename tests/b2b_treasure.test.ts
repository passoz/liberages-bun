import { describe, expect, test } from "bun:test";
import { b2bApp } from "../src/b2b";
import { getWalletBalance } from "../src/wallet";

describe("B2B Geolocated Treasure Hunt (FR-007)", () => {
  test("claims hidden treasure at partner venue and credits tokens to user wallet", async () => {
    const userId = "treasure-hunter-1";
    const initialBalance = getWalletBalance(userId);

    // SPEC section 9.2: Caça ao Tesouro (Parceiro oculta tesouro geolocalizado, usuário ganha Moedas Virtuais)
    const res = await b2bApp.request("/api/b2b/treasure/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        treasureId: "trs-motel-1",
        spotId: "motel-oasis",
        userId,
        tokenReward: 150,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.claimed).toBe(true);
    expect(data.tokensAwarded).toBe(150);

    const newBalance = getWalletBalance(userId);
    expect(newBalance).toBe(initialBalance + 150);
  });
});
