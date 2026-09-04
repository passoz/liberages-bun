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

// SPEC section 5.2 (Fotolog 24h) & 7.2 (Blur Facial Automático por padrão)
fotologApp.post("/api/fotolog", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { userId, imageUrl, faceShowEnabled } = body;

  if (!imageUrl) {
    return c.json({ error: "Imagem obrigatória" }, 400);
  }

  const now = Date.now();
  const post: FotologPost = {
    id: `foto-${now}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || "anonymous",
    imageUrl,
    // Opt-in explícito post a post necessário para revelar o rosto
    faceBlur: faceShowEnabled === true ? false : true,
    // Expira estritamente após 24h
    createdAt: now,
    expiresAt: now + 24 * 3600 * 1000,
  };

  fotologPosts.push(post);
  return c.json(post, 200);
});

fotologApp.get("/api/fotolog/feed", (c) => {
  const now = Date.now();
  const activePosts = fotologPosts.filter((p) => p.expiresAt > now);
  return c.json({ posts: activePosts }, 200);
});
