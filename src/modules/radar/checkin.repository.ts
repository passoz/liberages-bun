import { and, eq, gt } from "drizzle-orm";
import { db } from "../../../db/index";
import { checkins } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export class CheckinRepository {
  create(userId: string, spotId: string, ttlHours: number, customExpiresAt?: number) {
    const now = Date.now();
    const expiresAt = customExpiresAt ?? (now + ttlHours * 3600 * 1000);
    const newCheckin = {
      id: generateId(),
      userId,
      spotId,
      ttlHours,
      expiresAt,
      createdAt: now,
    };
    db.insert(checkins).values(newCheckin).run();
    return newCheckin;
  }

  countActiveBySpot(spotId: string): number {
    const now = Date.now();
    const active = db
      .select()
      .from(checkins)
      .where(and(eq(checkins.spotId, spotId), gt(checkins.expiresAt, now)))
      .all();
    return active.length;
  }
}

export const checkinRepository = new CheckinRepository();
