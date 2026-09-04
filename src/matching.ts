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
