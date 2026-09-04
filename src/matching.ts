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

// SPEC section 5.3:
// 1. Localização primeiro (perfis mais próximos geograficamente aparecem antes)
// 2. Compatibilidade depois (dentro do raio/distância, ordena por % de match)
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

// SPEC section 5.3: Match recíproco sugere/cria uma Friendship categorizada ('real' ou 'virtual')
export function recordLike(
  from: string,
  to: string,
  category: "real" | "virtual" = "virtual"
): { matched: boolean; friendship?: Friendship } {
  likesStore.add(`${from}:${to}`);

  const reciprocalKey = `${to}:${from}`;
  if (likesStore.has(reciprocalKey)) {
    const friendship: Friendship = {
      user1: from,
      user2: to,
      category,
    };
    friendshipsStore.push(friendship);
    return { matched: true, friendship };
  }

  return { matched: false };
}

// Baseline stub for Task 1.9: does not enforce daily swipe quota
export function processSwipe(userId: string, targetId: string, isPremium: boolean): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
