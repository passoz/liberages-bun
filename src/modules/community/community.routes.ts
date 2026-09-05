import { Hono } from "hono";
import { communityRepository } from "./community.repository";
import { economyService } from "../economy/economy.service";
import { matchingRepository } from "../social/matching.repository";
import { getRequestBody } from "../../shared/request";
import { getAuthenticatedUser } from "../../shared/auth";
import { userRepository } from "../identity/user.repository";

export const communityRoutes = new Hono();

// List Spaces posts
communityRoutes.get("/spaces/posts", (c) => {
  const posts = communityRepository.listSpacePosts();
  return c.json({ posts });
});

// Spaces: Forums & Anonymous Communities
communityRoutes.post("/spaces/post", async (c) => {
  const body = await getRequestBody(c);
  const authUser = await getAuthenticatedUser(c);
  const { spaceType, userNickname, communityPseudonym, content } = body;
  const realUserId = authUser?.id || body?.realUserId || "anon";
  const isForm = !c.req.header("content-type")?.includes("application/json");

  if (!spaceType || !content) {
    if (isForm) return c.redirect("/spaces?error=Conte%C3%BAdo+obrigat%C3%B3rio");
    return c.json({ error: "spaceType e content são obrigatórios" }, 400);
  }

  const authorDisplayed =
    spaceType === "anonymous_community"
      ? communityPseudonym || "Pseudônimo Anônimo"
      : userNickname || "Perfil Público";

  const post = communityRepository.createSpacePost(spaceType, authorDisplayed, String(content), realUserId);
  if (isForm) return c.redirect("/spaces?success=Relato+publicado");
  return c.json(post, 200);
});

// Jury Voting (Angels only - SEC-04)
communityRoutes.post("/jury/vote", async (c) => {
  const body = await getRequestBody(c);
  const authUser = await getAuthenticatedUser(c);
  const { disputeId, vote } = body;
  const userId = authUser?.id || body?.userId;

  if (!disputeId || !userId || !vote) {
    return c.json({ error: "Campos obrigatórios ausentes" }, 400);
  }

  // Resolve angel role from database (SEC-04)
  const user = userRepository.findById(userId);
  const isAngel = user ? user.isAngel === 1 : (process.env.NODE_ENV !== "production" && body.isAngel === true);

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

// B2B Treasure Hunt Claim (SEC-05)
communityRoutes.post("/treasure/claim", async (c) => {
  const body = await getRequestBody(c);
  const authUser = await getAuthenticatedUser(c);
  const { treasureId, spotId, tokenReward } = body;
  const userId = authUser?.id || body?.userId;

  if (!treasureId || !userId || tokenReward === undefined) {
    return c.json({ error: "Parâmetros inválidos" }, 400);
  }

  const reward = Number(tokenReward);
  // Enforce server-side reward boundary: max 200 tokens per treasure
  if (isNaN(reward) || reward <= 0 || reward > 200) {
    return c.json({ error: "Recompensa inválida ou excede o limite máximo permitido de 200 tokens por tesouro" }, 400);
  }

  if (communityRepository.hasClaimedTreasure(userId, treasureId)) {
    return c.json({ error: "Tesouro já resgatado" }, 409);
  }

  communityRepository.claimTreasure(userId, treasureId, spotId, reward);
  const newBalance = economyService.creditReward(userId, reward, `Tesouro #${treasureId}`);

  return c.json({ claimed: true, treasureId, tokensAwarded: reward, newBalance });
});

// Erotic stories (public reading, publishing for Premium/high-XP - SEC-04)
communityRoutes.get("/stories", (c) => {
  const list = communityRepository.listStories();
  return c.json({ stories: list });
});

communityRoutes.post("/stories", async (c) => {
  const body = await getRequestBody(c);
  const authUser = await getAuthenticatedUser(c);
  const { title, text } = body;
  const authorId = authUser?.id || body?.authorId || "anon";

  // Check permissions in DB (SEC-04)
  const user = userRepository.findById(authorId);
  const canPublish = user
    ? (user.isPremium === 1 || user.xpLevel >= 10)
    : (process.env.NODE_ENV !== "production" && (body.isPremium === true || (typeof body.xpLevel === "number" && body.xpLevel >= 10)));

  if (!canPublish) {
    return c.json({ error: "Apenas Premium ou nível 10+ podem publicar contos." }, 403);
  }

  const story = communityRepository.createStory(title || "Sem título", text || "", authorId);
  return c.json({ success: true, story }, 200);
});
