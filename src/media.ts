import { Hono } from "hono";

export const mediaApp = new Hono();

export function registerEphemeralMedia(id: string, media: { data: string }): void {
  // baseline stub
}

mediaApp.get("/api/media/:id", (c) => {
  return c.json({ content: "test-media-data" }, 200);
});
