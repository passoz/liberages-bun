import { Hono } from "hono";

export interface FotologPost {
  id: string;
  userId: string;
  imageUrl: string;
  faceBlur: boolean;
  expiresAt: number;
  createdAt: number;
}

export const fotologPosts: FotologPost[] = [];

export const fotologApp = new Hono();

fotologApp.post("/api/fotolog", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const post: FotologPost = {
    id: "stub-fotolog",
    userId: body.userId || "user",
    imageUrl: body.imageUrl || "img.jpg",
    faceBlur: false,
    expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
    createdAt: Date.now(),
  };
  fotologPosts.push(post);
  return c.json(post, 200);
});
