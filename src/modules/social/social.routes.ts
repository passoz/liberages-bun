import { Hono } from "hono";
import { fotologRepository } from "./fotolog.repository";
import { socialService } from "./social.service";
import { processSwipe } from "../../matching";
import { getRequestBody } from "../../shared/request";

export const socialRoutes = new Hono();

// Fotolog feed & upload
socialRoutes.get("/fotolog/feed", (c) => {
  const posts = fotologRepository.findActive();
  return c.json({ posts });
});

socialRoutes.post("/fotolog", async (c) => {
  const body = await getRequestBody(c);
  const { userId, imageUrl, faceShowEnabled } = body;
  const isForm = !c.req.header("content-type")?.includes("application/json");

  if (!imageUrl) {
    if (isForm) return c.redirect("/feed?error=URL+da+foto+obrigat%C3%B3ria");
    return c.json({ error: "imageUrl obrigatório" }, 400);
  }

  const faceBlur = faceShowEnabled === true || faceShowEnabled === "true" || faceShowEnabled === "on" ? 0 : 1;
  const post = fotologRepository.create(userId || "anon", String(imageUrl), faceBlur);

  if (isForm) return c.redirect("/feed?success=Foto+publicada+por+24h");
  return c.json(post, 200);
});

// Swipe deck ranking & swipe processing
socialRoutes.post("/swipe/deck", async (c) => {
  const body = await getRequestBody(c);
  const { candidates, userFetishes } = body;
  const sorted = socialService.sortDeck(candidates || [], userFetishes || []);
  return c.json({ deck: sorted });
});

socialRoutes.post("/swipe", async (c) => {
  const body = await getRequestBody(c);
  const { fromUserId, toUserId, isPremium, category } = body;
  const isForm = !c.req.header("content-type")?.includes("application/json");

  const quotaCheck = processSwipe(fromUserId || "user-1", toUserId || "candidate-1", !!isPremium);
  if (!quotaCheck.allowed) {
    if (isForm) return c.redirect(`/swipe?error=${encodeURIComponent(quotaCheck.reason || "Cota excedida")}`);
    return c.json({ error: quotaCheck.reason }, 429);
  }

  const result = socialService.handleSwipe(fromUserId || "user-1", toUserId || "candidate-1", category || "virtual");
  if (isForm) {
    if (result.matched) {
      const msg = result.bucketListSuggestion ? result.bucketListSuggestion.message : "Vocês deram match mútuo!";
      return c.redirect(`/swipe?match=true&msg=${encodeURIComponent(msg)}`);
    }
    return c.redirect("/swipe?liked=true");
  }

  return c.json({ success: true, ...result });
});
