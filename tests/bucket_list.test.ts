import { describe, expect, test } from "bun:test";
import { matchBucketLists } from "../src/bucket_list";

describe("Bucket List Date Icebreaker (FR-008)", () => {
  test("suggests automatic date when mutual match shares common spot in bucket lists", () => {
    const user1Spots = ["motel-oasis", "bar-veludo"];
    const user2Spots = ["motel-oasis", "club-subterraneo"];

    const suggestion = matchBucketLists(user1Spots, user2Spots);

    // SPEC section 5.4: Se dois usuários dão match e possuem o mesmo local em sua Bucket List,
    // a plataforma sugere um date automático para aquele local
    expect(suggestion.hasCommonSpot).toBe(true);
    expect(suggestion.spotId).toBe("motel-oasis");
    expect(suggestion.suggestionMessage).toContain("motel-oasis");
  });
});
