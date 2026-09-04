import { and, gt } from "drizzle-orm";
import { db } from "../../../db/index";
import { fotologPosts } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export class FotologRepository {
  create(userId: string, imageUrl: string, faceBlur = 1) {
    const now = Date.now();
    const newPost = {
      id: generateId(),
      userId,
      imageUrl,
      faceBlur,
      createdAt: now,
      expiresAt: now + 24 * 3600 * 1000,
    };
    db.insert(fotologPosts).values(newPost).run();
    return newPost;
  }

  findActive() {
    const now = Date.now();
    return db.select().from(fotologPosts).where(gt(fotologPosts.expiresAt, now)).all();
  }
}

export const fotologRepository = new FotologRepository();
