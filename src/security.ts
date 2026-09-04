import { Hono } from "hono";

export const securityApp = new Hono();

export function generateViewerWatermark(userId: string): string {
  return "";
}

securityApp.get("/api/image/:id", (c) => {
  return c.json({ image: "base-image.jpg" }, 200);
});
