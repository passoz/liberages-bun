import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { users } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export interface CreateUserData {
  nickname: string;
  accountType?: "single" | "couple" | "throuple";
  pin?: string;
  gateStatus?: "none" | "soft" | "hard";
  verificationHash?: string;
  city?: string;
  fetishes?: string[];
  bio?: string;
}

export class UserRepository {
  findById(id: string) {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  findByNickname(nickname: string) {
    return db.select().from(users).where(eq(users.nickname, nickname)).get();
  }

  create(data: CreateUserData) {
    const id = generateId();
    const now = Date.now();
    const newUser = {
      id,
      nickname: data.nickname,
      accountType: data.accountType || "single",
      pin: data.pin || null,
      gateStatus: data.gateStatus || "none",
      verificationHash: data.verificationHash || null,
      isVerified: 0,
      isAngel: 0,
      isPremium: 0,
      xpLevel: 1,
      city: data.city || null,
      fetishes: JSON.stringify(data.fetishes || []),
      bio: data.bio || null,
      createdAt: now,
    };

    db.insert(users).values(newUser).run();
    return newUser;
  }

  updateGateStatus(id: string, gateStatus: "soft" | "hard", verificationHash?: string) {
    const updateData: any = { gateStatus };
    if (verificationHash) updateData.verificationHash = verificationHash;
    db.update(users).set(updateData).where(eq(users.id, id)).run();
  }

  setPin(id: string, pin: string) {
    db.update(users).set({ pin }).where(eq(users.id, id)).run();
  }
}

export const userRepository = new UserRepository();
