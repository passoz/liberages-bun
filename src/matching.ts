export interface CandidateProfile {
  id: string;
  nickname: string;
  distanceKm: number;
  fetishes: string[];
}

export function calculateFetishMatch(userFetishes: string[], candidateFetishes: string[]): number {
  return 0;
}

export function sortDeck(candidates: CandidateProfile[], userFetishes: string[]): CandidateProfile[] {
  return [...candidates].reverse();
}
