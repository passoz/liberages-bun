import { createHash } from "node:crypto";
import { userRepository, type CreateUserData } from "./user.repository";

export function hashPin(pin: string, salt = "liberages-pin-salt-v1"): string {
  return createHash("sha256").update(`${salt}:${pin}`).digest("hex");
}

export class IdentityService {
  register(data: CreateUserData) {
    // SPEC section 3.1: Couple has single unified login and profile
    const pinToStore = data.pin ? hashPin(data.pin) : undefined;
    return userRepository.create({ ...data, pin: pinToStore });
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

  verifyPin(storedPin: string | null | undefined, inputPin: string, isDefaultDeviceAllowed = false): boolean {
    if (storedPin) {
      const hashed = hashPin(inputPin);
      return storedPin === hashed || storedPin === inputPin;
    }

    // SEC-06: Never allow default PIN bypass if authenticating for a specific registered user
    if (!isDefaultDeviceAllowed) {
      return false;
    }

    // Default mock PIN for unauthenticated device sessions
    return inputPin === "1234";
  }
}

export const identityService = new IdentityService();
