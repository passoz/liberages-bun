import { Hono } from "hono";
import { createHash } from "node:crypto";

export const securityApp = new Hono();

// SPEC section 7.2: Dynamic Watermark (Deterrent principal)
// Toda imagem renderizada via frontend embute o ID (hash) do usuário que a está visualizando
export function generateViewerWatermark(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

securityApp.get("/api/image/:id", (c) => {
  const viewerId = c.req.header("x-user-id") || "anonymous-viewer";
  const watermark = generateViewerWatermark(viewerId);

  c.header("x-viewer-watermark", watermark);
  return c.json({ image: "rendered-image-with-watermark.jpg", watermark }, 200);
});
