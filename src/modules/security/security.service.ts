import { createHash } from "node:crypto";

const ghostUsersStore = new Map<string, number>();

export class SecurityService {
  generateWatermark(userId: string): string {
    return createHash("sha256").update(userId).digest("hex").slice(0, 16);
  }

  setGhostMode(userId: string, durationMinutes = 60, customExpiresAt?: number) {
    const expiresAt = customExpiresAt ?? (Date.now() + durationMinutes * 60 * 1000);
    ghostUsersStore.set(userId, expiresAt);
    return { isGhost: true, expiresAt };
  }

  isGhost(userId: string): boolean {
    const expiresAt = ghostUsersStore.get(userId);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
      ghostUsersStore.delete(userId);
      return false;
    }
    return true;
  }
}

export const securityService = new SecurityService();
export const isUserGhost = (userId: string) => securityService.isGhost(userId);
