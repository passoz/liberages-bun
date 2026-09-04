export interface BucketListSuggestion {
  hasCommonSpot: boolean;
  spotId?: string;
  suggestionMessage?: string;
}

export function matchBucketLists(user1Spots: string[], user2Spots: string[]): BucketListSuggestion {
  return { hasCommonSpot: false };
}
