import { fotologRepository } from "./fotolog.repository";
import { matchingRepository } from "./matching.repository";

export interface DeckCandidate {
  id: string;
  nickname: string;
  distanceKm: number;
  fetishes: string[];
}

export class SocialService {
  calculateFetishMatch(userFetishes: string[], candidateFetishes: string[]): number {
    if (!userFetishes.length) return 0;
    const common = candidateFetishes.filter((f) => userFetishes.includes(f));
    return (common.length / userFetishes.length) * 100;
  }

  // SPEC section 5.3:
  // 1. Localização primeiro
  // 2. Compatibilidade depois (% de match)
  sortDeck(candidates: DeckCandidate[], userFetishes: string[]): DeckCandidate[] {
    return [...candidates].sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      const matchA = this.calculateFetishMatch(userFetishes, a.fetishes);
      const matchB = this.calculateFetishMatch(userFetishes, b.fetishes);
      return matchB - matchA;
    });
  }

  handleSwipe(fromUserId: string, toUserId: string, category: "real" | "virtual" = "virtual") {
    matchingRepository.recordLike(fromUserId, toUserId, category);
    const reciprocal = matchingRepository.hasLiked(toUserId, fromUserId);

    if (reciprocal) {
      const friendship = matchingRepository.createFriendship(fromUserId, toUserId, category);

      // Check Bucket List date icebreaker
      const list1 = matchingRepository.findBucketList(fromUserId);
      const list2 = matchingRepository.findBucketList(toUserId);
      const commonSpot = list1.find((s) => list2.includes(s));

      return {
        matched: true,
        friendship,
        bucketListSuggestion: commonSpot
          ? { spotId: commonSpot, message: `Que tal um date no local ${commonSpot}?` }
          : null,
      };
    }

    return { matched: false };
  }
}

export const socialService = new SocialService();
