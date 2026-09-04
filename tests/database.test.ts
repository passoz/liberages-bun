import { describe, expect, test } from "bun:test";
import { db, sqlite } from "../db/index";
import { users, spots, checkins } from "../db/schema";
import { uuidv7 } from "uuidv7";

describe("Database & SQLite Persistence Layer", () => {
  test("persists users, spots and runs FTS5 queries", () => {
    const userId = uuidv7();
    db.insert(users).values({
      id: userId,
      nickname: "TestUserDB",
      accountType: "single",
      createdAt: Date.now(),
    }).run();

    const user = db.select().from(users).all().find((u) => u.id === userId);
    expect(user).toBeDefined();
    expect(user?.nickname).toBe("TestUserDB");

    // Test FTS5 insertion and match
    sqlite.run("INSERT INTO profiles_fts VALUES (?, ?, ?, ?, ?)", [
      userId,
      "TestUserDB",
      "Rio de Janeiro",
      "bondage exhibition",
      "Perfil bio de teste",
    ]);

    const ftsResults = sqlite.query(
      "SELECT * FROM profiles_fts WHERE profiles_fts MATCH ?"
    ).all("bondage");

    expect(ftsResults.length).toBeGreaterThan(0);
  });
});
