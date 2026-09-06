import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_URL || "liberages.sqlite";
export const sqlite = new Database(dbPath);

// Enable SQLite WAL mode and busy timeout for high performance
sqlite.run("PRAGMA journal_mode = WAL;");
sqlite.run("PRAGMA busy_timeout = 5000;");
sqlite.run("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });

// Auto-initialize SQLite schema & FTS5 virtual table
export function initDb() {
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      nickname TEXT,
      account_type TEXT DEFAULT 'single',
      pin TEXT,
      gate_status TEXT DEFAULT 'none',
      verification_hash TEXT,
      is_verified INTEGER DEFAULT 0,
      is_angel INTEGER DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      xp_level INTEGER DEFAULT 1,
      city TEXT,
      fetishes TEXT DEFAULT '[]',
      bio TEXT
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES user(id)
    );

    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id),
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at INTEGER,
      refresh_token_expires_at INTEGER,
      scope TEXT,
      password TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL,
      account_type TEXT NOT NULL DEFAULT 'single',
      pin TEXT,
      gate_status TEXT NOT NULL DEFAULT 'none',
      verification_hash TEXT,
      is_verified INTEGER NOT NULL DEFAULT 0,
      is_angel INTEGER NOT NULL DEFAULT 0,
      is_premium INTEGER NOT NULL DEFAULT 0,
      xp_level INTEGER NOT NULL DEFAULT 1,
      city TEXT,
      fetishes TEXT DEFAULT '[]',
      bio TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS spots (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      latitude TEXT NOT NULL,
      longitude TEXT NOT NULL,
      is_partner INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      spot_id TEXT NOT NULL,
      ttl_hours INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fotolog_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      face_blur INTEGER NOT NULL DEFAULT 1,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'virtual',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL,
      user2_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'virtual',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bucket_list_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      spot_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallets (
      user_id TEXT PRIMARY KEY,
      balance INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS space_posts (
      id TEXT PRIMARY KEY,
      space_type TEXT NOT NULL,
      author_displayed TEXT NOT NULL,
      content TEXT NOT NULL,
      real_user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jury_votes (
      id TEXT PRIMARY KEY,
      dispute_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      vote TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      author_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS claimed_treasures (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      treasure_id TEXT NOT NULL,
      spot_id TEXT NOT NULL,
      tokens_awarded INTEGER NOT NULL,
      claimed_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ephemeral_media (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      consumed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    -- SPEC section 5.1: SQLite FTS5 (Full-Text Search) ativado
    CREATE VIRTUAL TABLE IF NOT EXISTS profiles_fts USING fts5(
      id UNINDEXED,
      nickname,
      city,
      fetishes,
      bio
    );
  `);
}

// Automatically initialize on import
initDb();
