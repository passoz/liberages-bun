export interface CandidateProfile {
  id: string;
  nickname: string;
  distanceKm: number;
  fetishes: string[];
}

export function calculateFetishMatch(userFetishes: string[], candidateFetishes: string[]): number {
  if (!userFetishes.length) return 0;
  const common = candidateFetishes.filter((f) => userFetishes.includes(f));
  return (common.length / userFetishes.length) * 100;
}

export function sortDeck(candidates: CandidateProfile[], userFetishes: string[]): CandidateProfile[] {
  return [...candidates].sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    const matchA = calculateFetishMatch(userFetishes, a.fetishes);
    const matchB = calculateFetishMatch(userFetishes, b.fetishes);
    return matchB - matchA;
  });
}

export interface Friendship {
  user1: string;
  user2: string;
  category: "real" | "virtual";
}

export const friendshipsStore: Friendship[] = [];
export const likesStore = new Set<string>();

export function recordLike(from: string, to: string, category: "real" | "virtual" = "virtual"): { matched: boolean; friendship?: Friendship } {
  likesStore.add(`${from}:${to}`);
  return { matched: false };
}
