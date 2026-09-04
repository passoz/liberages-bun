export interface Wallet {
  userId: string;
  balance: number;
}

const walletsStore = new Map<string, number>();

export function getWalletBalance(userId: string): number {
  return walletsStore.get(userId) || 0;
}

export function creditTokens(userId: string, amount: number): { success: boolean; balance: number } {
  const current = walletsStore.get(userId) || 0;
  const newBalance = current + amount;
  walletsStore.set(userId, newBalance);
  return { success: true, balance: newBalance };
}

// SPEC section 8.1 & Rule BR-005:
// Zero Cash-out: Usuários e criadores não podem sacar o dinheiro para Reais.
export function requestCashOut(userId: string, amount: number): { allowed: boolean; reason: string } {
  return {
    allowed: false,
    reason: "Zero Cash-out: a plataforma opera em circuito fechado (Closed-Loop); moedas virtuais não podem ser convertidas em moeda fiduciária.",
  };
}

// SPEC section 8.1 & Rule BR-005:
// Zero P2P: Usuários não transferem moedas diretamente entre si. Só podem enviar presentes comprados com moedas.
export function transferP2P(fromUser: string, toUser: string, amount: number): { allowed: boolean; reason: string } {
  return {
    allowed: false,
    reason: "Zero P2P: transferências financeiras diretas entre usuários são estritamente proibidas para conformidade regulatória.",
  };
}
