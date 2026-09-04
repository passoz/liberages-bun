import { Hono } from "hono";

export const governanceApp = new Hono();

governanceApp.post("/api/jury/vote", (c) => {
  return c.json({ success: true, message: "Vote accepted" }, 200);
});
