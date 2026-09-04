import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull(),
  accountType: text("account_type").notNull().default("single"),
  pin: text("pin"),
  gateStatus: text("gate_status").notNull().default("none"), // "none" | "soft" | "hard"
  verificationHash: text("verification_hash"),
  isVerified: integer("is_verified").notNull().default(0),
  isAngel: integer("is_angel").notNull().default(0),
  isPremium: integer("is_premium").notNull().default(0),
  xpLevel: integer("xp_level").notNull().default(1),
  city: text("city"),
  fetishes: text("fetishes").default("[]"), // JSON string array
  bio: text("bio"),
  createdAt: integer("created_at").notNull(),
});

export const spots = sqliteTable("spots", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "motel" | "club" | "bar"
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  isPartner: integer("is_partner").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const checkins = sqliteTable("checkins", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  spotId: text("spot_id").notNull(),
  ttlHours: integer("ttl_hours").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const fotologPosts = sqliteTable("fotolog_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  faceBlur: integer("face_blur").notNull().default(1), // 1 = blur on, 0 = opt-out
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const likes = sqliteTable("likes", {
  id: text("id").primaryKey(),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  category: text("category").notNull().default("virtual"),
  createdAt: integer("created_at").notNull(),
});

export const friendships = sqliteTable("friendships", {
  id: text("id").primaryKey(),
  user1Id: text("user1_id").notNull(),
  user2Id: text("user2_id").notNull(),
  category: text("category").notNull().default("virtual"), // "real" | "virtual"
  createdAt: integer("created_at").notNull(),
});

export const bucketListItems = sqliteTable("bucket_list_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  spotId: text("spot_id").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const wallets = sqliteTable("wallets", {
  userId: text("user_id").primaryKey(),
  balance: integer("balance").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});

export const walletTransactions = sqliteTable("wallet_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  text: text("text").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const spacePosts = sqliteTable("space_posts", {
  id: text("id").primaryKey(),
  spaceType: text("space_type").notNull(), // "forum" | "anonymous_community"
  authorDisplayed: text("author_displayed").notNull(),
  content: text("content").notNull(),
  realUserId: text("real_user_id").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const juryVotes = sqliteTable("jury_votes", {
  id: text("id").primaryKey(),
  disputeId: text("dispute_id").notNull(),
  userId: text("user_id").notNull(),
  vote: text("vote").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const stories = sqliteTable("stories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const claimedTreasures = sqliteTable("claimed_treasures", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  treasureId: text("treasure_id").notNull(),
  spotId: text("spot_id").notNull(),
  tokensAwarded: integer("tokens_awarded").notNull(),
  claimedAt: integer("claimed_at").notNull(),
});

export const ephemeralMedia = sqliteTable("ephemeral_media", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  consumed: integer("consumed").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});
