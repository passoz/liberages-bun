import { Hono } from "hono";
import { searchService } from "./search.service";

export const searchRoutes = new Hono();

searchRoutes.get("/", (c) => {
  const q = c.req.query("q") || "";
  const results = searchService.search(q);
  return c.json({ query: q, results });
});
