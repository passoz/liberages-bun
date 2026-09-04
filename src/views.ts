import { Hono } from "hono";

export const viewsApp = new Hono();

viewsApp.get("/feed", (c) => c.text("Feed not implemented", 404));
viewsApp.get("/swipe", (c) => c.text("Swipe not implemented", 404));
viewsApp.get("/mapa", (c) => c.text("Mapa not implemented", 404));
viewsApp.get("/carteira", (c) => c.text("Carteira not implemented", 404));
