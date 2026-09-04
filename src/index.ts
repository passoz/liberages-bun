import { Hono } from "hono";

export const app = new Hono();

app.get("/", (c) => {
  return c.text("not found or unauthenticated", 404);
});
