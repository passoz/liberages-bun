export interface BucketListSuggestion {
  hasCommonSpot: boolean;
  spotId?: string;
  suggestionMessage?: string;
}

// SPEC section 5.4: Quebra-gelo: Bucket List
// Se dois usuários dão match e possuem o mesmo local em sua Bucket List,
// a plataforma sugere um date automático para aquele local.
export function matchBucketLists(user1Spots: string[], user2Spots: string[]): BucketListSuggestion {
  const common = user1Spots.find((spot) => user2Spots.includes(spot));

  if (common) {
    return {
      hasCommonSpot: true,
      spotId: common,
      suggestionMessage: `Que tal um date no local ${common}? Ambos têm na Bucket List!`,
    };
  }

  return { hasCommonSpot: false };
}
