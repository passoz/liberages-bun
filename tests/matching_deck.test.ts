import { describe, expect, test } from "bun:test";
import { sortDeck, type CandidateProfile } from "../src/matching";

describe("Swipe Deck Ranking (FR-006)", () => {
  test("orders deck by geographic distance first, then by fetish compatibility percentage", () => {
    const userFetishes = ["bdsm", "voyeur", "swing"];

    const candidates: CandidateProfile[] = [
      { id: "A", nickname: "UserA", distanceKm: 5, fetishes: ["bdsm"] }, // 5km, 33% match
      { id: "B", nickname: "UserB", distanceKm: 5, fetishes: ["bdsm", "voyeur", "swing"] }, // 5km, 100% match
      { id: "C", nickname: "UserC", distanceKm: 25, fetishes: ["bdsm", "voyeur", "swing"] }, // 25km, 100% match
    ];

    const sorted = sortDeck(candidates, userFetishes);

    // SPEC section 5.3:
    // 1. Localização primeiro (A e B a 5km vêm antes de C a 25km)
    // 2. Compatibilidade depois (B com 100% vem antes de A com 33%)
    expect(sorted.map((c) => c.id)).toEqual(["B", "A", "C"]);
    expect(sorted[0].id).toBe("B");
  });
});
