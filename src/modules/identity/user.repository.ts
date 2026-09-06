import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { users, user } from "../../../db/schema";
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

    // Sync with Better Auth user table via Drizzle ORM
    const cleanNick = data.nickname.toLowerCase().replace(/[^a-z0-9]/g, "");
    db.insert(user).values({
      id,
      name: data.nickname,
      email: `${cleanNick || "user"}_${id}@liberages.internal`,
      emailVerified: false,
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
      createdAt: new Date(now),
      updatedAt: new Date(now),
    }).run();

    return newUser;
  }

  updateGateStatus(id: string, gateStatus: "soft" | "hard", verificationHash?: string) {
    const updateData: any = { gateStatus };
    if (verificationHash) updateData.verificationHash = verificationHash;
    db.update(users).set(updateData).where(eq(users.id, id)).run();
    db.update(user).set({ ...updateData, updatedAt: new Date() }).where(eq(user.id, id)).run();
  }

  setPin(id: string, pin: string) {
    db.update(users).set({ pin }).where(eq(users.id, id)).run();
    db.update(user).set({ pin, updatedAt: new Date() }).where(eq(user.id, id)).run();
  }
}

export const userRepository = new UserRepository();
