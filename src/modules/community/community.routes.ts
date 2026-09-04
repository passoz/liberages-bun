import { Hono } from "hono";
import { communityRepository } from "./community.repository";
import { economyService } from "../economy/economy.service";
import { matchingRepository } from "../social/matching.repository";

export const communityRoutes = new Hono();

// Spaces: Forums & Anonymous Communities
communityRoutes.post("/spaces/post", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { spaceType, realUserId, userNickname, communityPseudonym, content } = body;

  if (!spaceType || !content) {
    return c.json({ error: "spaceType e content são obrigatórios" }, 400);
  }

  const authorDisplayed =
    spaceType === "anonymous_community"
      ? communityPseudonym || "Pseudônimo Anônimo"
      : userNickname || "Perfil Público";

  const post = communityRepository.createSpacePost(spaceType, authorDisplayed, content, realUserId || "anon");
  return c.json(post, 200);
});

// Jury Voting (Angels only)
communityRoutes.post("/jury/vote", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { disputeId, userId, isAngel, vote } = body;

  if (!isAngel) {
    return c.json({ error: "Acesso negado: o Júri Popular é restrito aos Anjos da Comunidade." }, 403);
  }

  const voteEntry = communityRepository.createJuryVote(disputeId, userId, vote);
  return c.json({ success: true, vote: voteEntry }, 200);
});

// Web of Trust (4 real friends for verified blue badge)
communityRoutes.get("/wot/verify/:userId", (c) => {
  const userId = c.req.param("userId");
  const count = matchingRepository.countRealFriendships(userId);

  if (count >= 4) {
    return c.json({ isVerified: true, badgeColor: "blue", realFriendsCount: count });
  }
  return c.json({ isVerified: false, realFriendsCount: count });
});

// B2B Treasure Hunt Claim
communityRoutes.post("/treasure/claim", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { treasureId, spotId, userId, tokenReward } = body;

  if (!treasureId || !userId || !tokenReward) {
    return c.json({ error: "Parâmetros inválidos" }, 400);
  }

  if (communityRepository.hasClaimedTreasure(userId, treasureId)) {
    return c.json({ error: "Tesouro já resgatado" }, 409);
  }

  communityRepository.claimTreasure(userId, treasureId, spotId, tokenReward);
  const newBalance = economyService.creditReward(userId, tokenReward, `Tesouro #${treasureId}`);

  return c.json({ claimed: true, treasureId, tokensAwarded: tokenReward, newBalance });
});

// Erotic stories (public reading, publishing for Premium/high-XP)
communityRoutes.get("/stories", (c) => {
  const list = communityRepository.listStories();
  return c.json({ stories: list });
});

communityRoutes.post("/stories", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { title, text, authorId, isPremium, xpLevel } = body;

  const canPublish = isPremium === true || (typeof xpLevel === "number" && xpLevel >= 10);
  if (!canPublish) {
    return c.json({ error: "Apenas Premium ou nível 10+ podem publicar contos." }, 403);
  }

  const story = communityRepository.createStory(title || "Sem título", text || "", authorId || "anon");
  return c.json({ success: true, story }, 200);
});
