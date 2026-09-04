import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { wallets, walletTransactions } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export class WalletRepository {
  getBalance(userId: string): number {
    const w = db.select().from(wallets).where(eq(wallets.userId, userId)).get();
    return w ? w.balance : 0;
  }

  credit(userId: string, amount: number, type: string, description: string): number {
    const current = this.getBalance(userId);
    const newBalance = current + amount;
    const now = Date.now();

    const existing = db.select().from(wallets).where(eq(wallets.userId, userId)).get();
    if (existing) {
      db.update(wallets).set({ balance: newBalance, updatedAt: now }).where(eq(wallets.userId, userId)).run();
    } else {
      db.insert(wallets).values({ userId, balance: newBalance, updatedAt: now }).run();
    }

    db.insert(walletTransactions)
      .values({
        id: generateId(),
        userId,
        type,
        amount,
        description,
        createdAt: now,
      })
      .run();

    return newBalance;
  }

  debit(userId: string, amount: number, type: string, description: string): boolean {
    const current = this.getBalance(userId);
    if (current < amount) return false;

    const newBalance = current - amount;
    const now = Date.now();

    db.update(wallets).set({ balance: newBalance, updatedAt: now }).where(eq(wallets.userId, userId)).run();
    db.insert(walletTransactions)
      .values({
        id: generateId(),
        userId,
        type,
        amount: -amount,
        description,
        createdAt: now,
      })
      .run();

    return true;
  }
}

export const walletRepository = new WalletRepository();
