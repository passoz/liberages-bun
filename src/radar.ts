import { Hono } from "hono";

export const radarApp = new Hono();

radarApp.post("/api/checkin", (c) => {
  return c.json({ error: "Check-in disabled" }, 400);
});
