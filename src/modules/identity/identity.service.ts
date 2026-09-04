import { createHash } from "node:crypto";
import { userRepository, type CreateUserData } from "./user.repository";

export class IdentityService {
  register(data: CreateUserData) {
    // SPEC section 3.1: Couple has single unified login and profile
    return userRepository.create(data);
  }

  processSoftGate(userId: string) {
    userRepository.updateGateStatus(userId, "soft");
    return { gate: "soft", canRead: true, canWrite: false };
  }

  processHardGate(userId: string, docBase64: string) {
    // Hash doc and discard immediately for privacy compliance
    const hash = createHash("sha256").update(docBase64).digest("hex");
    userRepository.updateGateStatus(userId, "hard", hash);
    return { gate: "hard", canRead: true, canWrite: true, verificationHash: hash };
  }

  verifyPin(storedPin: string | null | undefined, inputPin: string): boolean {
    if (!storedPin) return inputPin === "1234"; // Default dev mock PIN
    return storedPin === inputPin;
  }
}

export const identityService = new IdentityService();
