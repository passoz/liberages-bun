import { Hono } from "hono";
import { fotologRepository } from "./fotolog.repository";
import { socialService, type DeckCandidate } from "./social.service";
import { processSwipe } from "../../matching";

export const socialRoutes = new Hono();

// Fotolog feed & upload
socialRoutes.get("/fotolog/feed", (c) => {
  const posts = fotologRepository.findActive();
  return c.json({ posts });
});

socialRoutes.post("/fotolog", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { userId, imageUrl, faceShowEnabled } = body;

  if (!imageUrl) {
    return c.json({ error: "imageUrl obrigatório" }, 400);
  }

  const faceBlur = faceShowEnabled === true ? 0 : 1;
  const post = fotologRepository.create(userId || "anon", imageUrl, faceBlur);
  return c.json(post, 200);
});

// Swipe deck ranking & swipe processing
socialRoutes.post("/swipe/deck", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { candidates, userFetishes } = body;
  const sorted = socialService.sortDeck(candidates || [], userFetishes || []);
  return c.json({ deck: sorted });
});

socialRoutes.post("/swipe", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { fromUserId, toUserId, isPremium, category } = body;

  // Enforce daily quota
  const quotaCheck = processSwipe(fromUserId, toUserId, !!isPremium);
  if (!quotaCheck.allowed) {
    return c.json({ error: quotaCheck.reason }, 429);
  }

  const result = socialService.handleSwipe(fromUserId, toUserId, category || "virtual");
  return c.json({ success: true, ...result });
});
