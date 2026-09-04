import { Hono } from "hono";

export const governanceApp = new Hono();

export interface JuryVote {
  disputeId: string;
  userId: string;
  vote: string;
  timestamp: number;
}

export const juryVotesStore: JuryVote[] = [];

// SPEC section 9.3: Júri Popular
governanceApp.post("/api/jury/vote", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { disputeId, userId, isAngel, vote } = body;

  if (!isAngel) {
    return c.json({ error: "Acesso negado: o Júri Popular é restrito aos Anjos da Comunidade." }, 403);
  }

  const voteEntry: JuryVote = {
    disputeId,
    userId,
    vote,
    timestamp: Date.now(),
  };

  juryVotesStore.push(voteEntry);
  return c.json({ success: true, message: "Voto registrado com sucesso", vote: voteEntry }, 200);
});

// Baseline stub for Task 1.8: Web of Trust
export function checkWebOfTrustVerification(realFriendsCount: number): { isVerified: boolean; badgeColor?: string } {
  return { isVerified: false };
}
