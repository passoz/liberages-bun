import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull(),
  accountType: text("account_type").notNull().default("single"),
  pin: text("pin"),
  createdAt: text("created_at").notNull(),
});

export const spots = sqliteTable("spots", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
});

export const checkins = sqliteTable("checkins", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  spotId: text("spot_id").notNull(),
  expiresAt: text("expires_at").notNull(),
});
