import { and, eq, or } from "drizzle-orm";
import { db } from "../../../db/index";
import { likes, friendships, bucketListItems } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export class MatchingRepository {
  recordLike(fromUserId: string, toUserId: string, category = "virtual") {
    const newLike = {
      id: generateId(),
      fromUserId,
      toUserId,
      category,
      createdAt: Date.now(),
    };
    db.insert(likes).values(newLike).run();
    return newLike;
  }

  hasLiked(fromUserId: string, toUserId: string): boolean {
    const found = db
      .select()
      .from(likes)
      .where(and(eq(likes.fromUserId, fromUserId), eq(likes.toUserId, toUserId)))
      .get();
    return !!found;
  }

  createFriendship(user1Id: string, user2Id: string, category = "virtual") {
    const newFriendship = {
      id: generateId(),
      user1Id,
      user2Id,
      category,
      createdAt: Date.now(),
    };
    db.insert(friendships).values(newFriendship).run();
    return newFriendship;
  }

  countRealFriendships(userId: string): number {
    const list = db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.category, "real"),
          or(eq(friendships.user1Id, userId), eq(friendships.user2Id, userId))
        )
      )
      .all();
    return list.length;
  }

  addBucketListItem(userId: string, spotId: string) {
    const item = {
      id: generateId(),
      userId,
      spotId,
      createdAt: Date.now(),
    };
    db.insert(bucketListItems).values(item).run();
    return item;
  }

  findBucketList(userId: string): string[] {
    const items = db.select().from(bucketListItems).where(eq(bucketListItems.userId, userId)).all();
    return items.map((i) => i.spotId);
  }
}

export const matchingRepository = new MatchingRepository();
