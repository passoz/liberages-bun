import { Hono } from "hono";

export interface SpacePost {
  id: string;
  spaceType: "forum" | "anonymous_community";
  authorDisplayed: string;
  content: string;
}

export const spacesApp = new Hono();

spacesApp.post("/api/spaces/post", (c) => {
  return c.json({ authorDisplayed: "REAL_NAME_LEAKED" }, 200);
});
