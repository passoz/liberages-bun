import { Hono } from "hono";
import { readFileSync, existsSync } from "node:fs";
import { getCookie } from "hono/cookie";
import {
  renderLoginPage,
  renderOnboardingPage,
  renderFeedPage,
  renderSwipePage,
  renderMapPage,
  renderWalletPage,
  renderChatPage,
  renderSpacesPage,
  renderDisguisePage,
} from "./pages";
import { fotologRepository } from "../modules/social/fotolog.repository";
import { spotRepository } from "../modules/radar/spot.repository";
import { checkinRepository } from "../modules/radar/checkin.repository";
import { economyService } from "../modules/economy/economy.service";
import { communityRepository } from "../modules/community/community.repository";
import { chatRepository } from "../modules/chat/chat.repository";
import { getRequestBody } from "../shared/request";

export const webViewsRoutes = new Hono();

// PWA Static Assets
webViewsRoutes.get("/manifest.json", (c) => {
  if (existsSync("public/manifest.json")) {
    const file = readFileSync("public/manifest.json", "utf8");
    return c.text(file, 200, { "Content-Type": "application/manifest+json" });
  }
  return c.text("{}", 404);
});

webViewsRoutes.get("/sw.js", (c) => {
  if (existsSync("public/sw.js")) {
    const file = readFileSync("public/sw.js", "utf8");
    return c.text(file, 200, { "Content-Type": "application/javascript" });
  }
  return c.text("// sw", 404);
});

// Login & Onboarding
webViewsRoutes.get("/login", (c) => {
  const error = c.req.query("error");
  const success = c.req.query("success");
  return c.html(renderLoginPage({ error, success }));
});

webViewsRoutes.get("/onboarding", (c) => {
  const gateStatus = getCookie(c, "gate") || "none";
  const error = c.req.query("error");
  const success = c.req.query("success");
  return c.html(renderOnboardingPage({ gateStatus, error, success }));
});

// SSR UI Pages
webViewsRoutes.get("/feed", (c) => {
  const posts = fotologRepository.findActive();
  const error = c.req.query("error");
  const success = c.req.query("success");
  return c.html(renderFeedPage(posts, { error, success }));
});

webViewsRoutes.get("/swipe", (c) => {
  const liked = c.req.query("liked") === "true";
  const match = c.req.query("match") === "true";
  const msg = c.req.query("msg");
  const error = c.req.query("error");
  return c.html(renderSwipePage({ liked, match, msg, error }));
});

webViewsRoutes.get("/mapa", (c) => {
  const spots = spotRepository.findAll();
  const error = c.req.query("error");
  const success = c.req.query("success");
  return c.html(
    renderMapPage(spots, (id) => checkinRepository.countActiveBySpot(id), { error, success })
  );
});

webViewsRoutes.get("/carteira", (c) => {
  const balance = economyService.getBalance("current-user");
  const success = c.req.query("success");
  return c.html(renderWalletPage(balance, { success }));
});

// Recharge simulation from UI form
webViewsRoutes.post("/carteira/recharge", async (c) => {
  const body = await getRequestBody(c);
  const tokens = Number(body?.tokens) || 100;
  economyService.creditFromPurchase("current-user", tokens, `web-checkout-${Date.now()}`);
  return c.redirect("/carteira?success=100+Tokens+Creditados+com+Sucesso");
});

// Chat UI Page
webViewsRoutes.get("/chat", (c) => {
  const messages = chatRepository.getConversation("current-user", "parceiro-match");
  const error = c.req.query("error");
  const success = c.req.query("success");
  return c.html(renderChatPage(messages, { error, success }));
});

webViewsRoutes.post("/chat/send", async (c) => {
  const body = await getRequestBody(c);
  const text = body?.text;
  if (!text) {
    return c.redirect("/chat?error=Mensagem+vazia");
  }
  chatRepository.saveMessage("current-user", "parceiro-match", String(text));
  return c.redirect("/chat");
});

// Spaces UI Page
webViewsRoutes.get("/spaces", (c) => {
  const posts = communityRepository.listSpacePosts();
  const error = c.req.query("error");
  const success = c.req.query("success");
  return c.html(renderSpacesPage(posts, { error, success }));
});

// Fake mode (panic screen)
webViewsRoutes.get("/disfarce/calculadora", (c) => {
  return c.html(renderDisguisePage());
});
