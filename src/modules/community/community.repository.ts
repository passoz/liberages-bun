import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { spacePosts, juryVotes, stories, claimedTreasures } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export class CommunityRepository {
  createSpacePost(spaceType: "forum" | "anonymous_community", authorDisplayed: string, content: string, realUserId: string) {
    const post = {
      id: generateId(),
      spaceType,
      authorDisplayed,
      content,
      realUserId,
      createdAt: Date.now(),
    };
    db.insert(spacePosts).values(post).run();
    return post;
  }

  createJuryVote(disputeId: string, userId: string, vote: string) {
    const v = {
      id: generateId(),
      disputeId,
      userId,
      vote,
      createdAt: Date.now(),
    };
    db.insert(juryVotes).values(v).run();
    return v;
  }

  createStory(title: string, text: string, authorId: string) {
    const story = {
      id: generateId(),
      title,
      text,
      authorId,
      createdAt: Date.now(),
    };
    db.insert(stories).values(story).run();
    return story;
  }

  listStories() {
    return db.select().from(stories).all();
  }

  claimTreasure(userId: string, treasureId: string, spotId: string, tokensAwarded: number) {
    const claim = {
      id: generateId(),
      userId,
      treasureId,
      spotId,
      tokensAwarded,
      claimedAt: Date.now(),
    };
    db.insert(claimedTreasures).values(claim).run();
    return claim;
  }

  hasClaimedTreasure(userId: string, treasureId: string): boolean {
    const item = db
      .select()
      .from(claimedTreasures)
      .where(eq(claimedTreasures.userId, userId))
      .all()
      .find((t) => t.treasureId === treasureId);
    return !!item;
  }
}

export const communityRepository = new CommunityRepository();
