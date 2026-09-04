import { Hono } from "hono";

export const chatApp = new Hono();

chatApp.post("/api/chat/messages", (c) => {
  return c.json({ error: "Chat service unavailable" }, 503);
});
