import { sqlite } from "../../../db/index";
import { isUserGhost } from "../security/security.service";

export interface SearchResult {
  id: string;
  nickname: string;
  city: string;
  fetishes: string;
  bio: string;
}

export class SearchService {
  indexProfile(id: string, nickname: string, city = "", fetishes = "", bio = "") {
    // Delete existing entry if any
    sqlite.run("DELETE FROM profiles_fts WHERE id = ?", [id]);
    sqlite.run("INSERT INTO profiles_fts(id, nickname, city, fetishes, bio) VALUES (?, ?, ?, ?, ?)", [
      id,
      nickname,
      city,
      fetishes,
      bio,
    ]);
  }

  // SPEC section 5.1: SQLite FTS5. Perfis no "Modo Fantasma" são omitidos da busca.
  search(query: string): SearchResult[] {
    if (!query || !query.trim()) return [];

    try {
      // FTS5 MATCH query with wildcard
      const cleanTerm = query.trim().replace(/['"*]/g, "");
      const rows = sqlite
        .query("SELECT id, nickname, city, fetishes, bio FROM profiles_fts WHERE profiles_fts MATCH ?")
        .all(`${cleanTerm}*`) as SearchResult[];

      // Omit users in Ghost Mode
      return rows.filter((profile) => !isUserGhost(profile.id));
    } catch {
      return [];
    }
  }
}

export const searchService = new SearchService();
