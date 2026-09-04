import { Hono } from "hono";

export const app = new Hono();

app.post("/api/login/pin", async (c) => {
  return c.text("incorrect implementation", 400);
});
