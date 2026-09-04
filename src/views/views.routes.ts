import { Hono } from "hono";
import { readFileSync, existsSync } from "node:fs";
import {
  renderFeedPage,
  renderSwipePage,
  renderMapPage,
  renderWalletPage,
  renderSpacesPage,
  renderDisguisePage,
} from "./pages";
import { fotologRepository } from "../modules/social/fotolog.repository";
import { spotRepository } from "../modules/radar/spot.repository";
import { economyService } from "../modules/economy/economy.service";

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

// SSR UI Pages
webViewsRoutes.get("/feed", (c) => {
  const posts = fotologRepository.findActive();
  return c.html(renderFeedPage(posts));
});

webViewsRoutes.get("/swipe", (c) => {
  return c.html(renderSwipePage());
});

webViewsRoutes.get("/mapa", (c) => {
  const spots = spotRepository.findAll();
  return c.html(renderMapPage(spots));
});

webViewsRoutes.get("/carteira", (c) => {
  const balance = economyService.getBalance("current-user");
  return c.html(renderWalletPage(balance));
});

webViewsRoutes.get("/spaces", (c) => {
  return c.html(renderSpacesPage());
});

webViewsRoutes.get("/disfarce/calculadora", (c) => {
  return c.html(renderDisguisePage());
});
