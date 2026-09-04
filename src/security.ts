import { Hono } from "hono";
import { createHash } from "node:crypto";

export const securityApp = new Hono();

export const ghostUsersStore = new Map<string, number>();

// SPEC section 7.2: Dynamic Watermark
export function generateViewerWatermark(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

securityApp.get("/api/image/:id", (c) => {
  const viewerId = c.req.header("x-user-id") || "anonymous-viewer";
  const watermark = generateViewerWatermark(viewerId);

  c.header("x-viewer-watermark", watermark);
  return c.json({ image: "rendered-image-with-watermark.jpg", watermark }, 200);
});

// SPEC section 7.3: Modo Falso (Botão de Pânico)
securityApp.post("/api/panic", (c) => {
  return c.json({
    success: true,
    action: "redirect",
    disguiseUrl: "/disfarce/calculadora",
  }, 200);
});

// SPEC section 7.3: Modo Ghost com Temporizador
securityApp.post("/api/ghost", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { userId, durationMinutes, expiresAt: explicitExpiresAt } = body;

  if (!userId) {
    return c.json({ error: "userId obrigatório" }, 400);
  }

  const durationMs = (durationMinutes || 60) * 60 * 1000;
  const expiresAt = explicitExpiresAt ?? (Date.now() + durationMs);

  ghostUsersStore.set(userId, expiresAt);

  return c.json({
    success: true,
    isGhost: true,
    userId,
    expiresAt,
  }, 200);
});

// Automatic restoration when timer expires
export function isUserGhost(userId: string): boolean {
  const expiresAt = ghostUsersStore.get(userId);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    ghostUsersStore.delete(userId);
    return false;
  }
  return true;
}
