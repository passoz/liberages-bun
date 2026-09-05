import { and, eq, or } from "drizzle-orm";
import { db, sqlite } from "../../../db/index";
import { chatMessages, ephemeralMedia } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export class ChatRepository {
  saveMessage(fromUserId: string, toUserId: string, text: string) {
    const msg = {
      id: generateId(),
      fromUserId,
      toUserId,
      text,
      createdAt: Date.now(),
    };
    db.insert(chatMessages).values(msg).run();
    return msg;
  }

  getConversation(userA: string, userB: string) {
    return db
      .select()
      .from(chatMessages)
      .where(
        or(
          and(eq(chatMessages.fromUserId, userA), eq(chatMessages.toUserId, userB)),
          and(eq(chatMessages.fromUserId, userB), eq(chatMessages.toUserId, userA))
        )
      )
      .all();
  }

  saveEphemeralMedia(data: string) {
    const item = {
      id: generateId(),
      data,
      consumed: 0,
      createdAt: Date.now(),
    };
    db.insert(ephemeralMedia).values(item).run();
    return item;
  }

  consumeEphemeralMedia(id: string): { status: "found" | "already_consumed" | "not_found"; data?: string } {
    const item = db.select().from(ephemeralMedia).where(eq(ephemeralMedia.id, id)).get();
    if (!item) return { status: "not_found" };
    if (item.consumed === 1) return { status: "already_consumed" };

    // Atomic test-and-set query that wipes data payload on disk upon consumption (SEC-08)
    const updateResult = sqlite.run(
      "UPDATE ephemeral_media SET consumed = 1, data = '[DESTRUCTED]' WHERE id = ? AND consumed = 0",
      [id]
    );

    if (updateResult.changes === 0) {
      return { status: "already_consumed" };
    }

    return { status: "found", data: item.data };
  }
}

export const chatRepository = new ChatRepository();
