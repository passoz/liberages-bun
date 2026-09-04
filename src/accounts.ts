export interface Account {
  id: string;
  type: "single" | "couple" | "throuple";
  nickname: string;
  subProfiles?: undefined;
}

export function createAccount(data: { type: "single" | "couple"; nickname: string }): Account {
  // Golden Rule (SPEC section 3.1): 1 User (Conta) = 1 Profile.
  // There are NO sub-profiles. Couples have a single shared login and single unified public profile.
  return {
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: data.type,
    nickname: data.nickname,
    subProfiles: undefined,
  };
}

export function isUnifiedProfile(account: Account): boolean {
  return account.subProfiles === undefined;
}
