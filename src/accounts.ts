export interface Account {
  id: string;
  type: "single" | "couple" | "throuple";
  nickname: string;
  subProfiles?: string[];
}

export function createAccount(data: { type: "single" | "couple"; nickname: string }): Account {
  return {
    id: "stub-id",
    type: data.type,
    nickname: data.nickname,
    subProfiles: data.type === "couple" ? ["partner1", "partner2"] : undefined,
  };
}

export function isUnifiedProfile(account: Account): boolean {
  return false;
}
