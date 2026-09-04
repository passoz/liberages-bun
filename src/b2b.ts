import { Hono } from "hono";

export const b2bApp = new Hono();

b2bApp.post("/api/b2b/treasure/claim", (c) => {
  return c.json({ error: "Treasure claim disabled" }, 400);
});
