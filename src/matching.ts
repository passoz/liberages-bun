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

interface UserSwipeRecord {
  date: string;
  count: number;
}

const dailySwipesStore = new Map<string, UserSwipeRecord>();

// SPEC section 5.3: Limites de Swipe (Monetização)
// Usuários Free possuem cota diária de likes (30/dia).
// Usuários Premium possuem likes ilimitados.
export function processSwipe(
  userId: string,
  targetId: string,
  isPremium: boolean
): { allowed: boolean; reason?: string } {
  if (isPremium) {
    return { allowed: true };
  }

  const today = new Date().toISOString().slice(0, 10);
  const record = dailySwipesStore.get(userId);

  if (!record || record.date !== today) {
    dailySwipesStore.set(userId, { date: today, count: 1 });
    return { allowed: true };
  }

  if (record.count >= 30) {
    return {
      allowed: false,
      reason: "Cota atingida: limite de 30 likes/dia no plano Free. Seja Premium para likes ilimitados.",
    };
  }

  record.count += 1;
  return { allowed: true };
}
