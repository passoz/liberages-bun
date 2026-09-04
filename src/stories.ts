import { Hono } from "hono";

export const storiesApp = new Hono();

storiesApp.get("/api/stories", (c) => c.json({ stories: [] }, 200));

storiesApp.post("/api/stories", (c) => {
  return c.json({ success: true, published: true }, 200);
});
