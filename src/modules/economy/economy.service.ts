import { walletRepository } from "./wallet.repository";

export class EconomyService {
  getBalance(userId: string): number {
    return walletRepository.getBalance(userId);
  }

  creditFromPurchase(userId: string, amount: number, paymentId: string) {
    return walletRepository.credit(
      userId,
      amount,
      "credit_mercadopago",
      `Recarga Mercado Pago #${paymentId}`
    );
  }

  creditReward(userId: string, amount: number, source: string) {
    return walletRepository.credit(userId, amount, "reward_treasure", `Recompensa: ${source}`);
  }

  // SPEC section 8.1: Zero Cash-out
  attemptCashOut(): { allowed: false; reason: string } {
    return {
      allowed: false,
      reason: "Zero Cash-out: circuito fechado, tokens não são resgatáveis em moeda fiat.",
    };
  }

  // SPEC section 8.1: Zero P2P
  attemptP2PTransfer(): { allowed: false; reason: string } {
    return {
      allowed: false,
      reason: "Zero P2P: transferências diretas entre usuários são proibidas.",
    };
  }
}

export const economyService = new EconomyService();
