import { Hono } from "hono";

export interface Checkin {
  id: string;
  userId: string;
  spotId: string;
  ttlHours: number;
  expiresAt: number;
  createdAt: number;
}

export const checkinsStore: Checkin[] = [];

export const radarApp = new Hono();

// SPEC section 4.2: Dynamic check-in with TTL (min 1h, max 4h)
radarApp.post("/api/checkin", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { spotId, ttlHours, userId } = body;

  if (!spotId || typeof ttlHours !== "number" || ttlHours < 1 || ttlHours > 4) {
    return c.json({ error: "TTL obrigatório entre 1h e 4h" }, 400);
  }

  const now = Date.now();
  const checkin: Checkin = {
    id: `chk-${now}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || "anonymous-user",
    spotId,
    ttlHours,
    expiresAt: now + ttlHours * 3600 * 1000,
    createdAt: now,
  };

  checkinsStore.push(checkin);

  return c.json({
    success: true,
    checkinId: checkin.id,
    spotId: checkin.spotId,
    ttlHours: checkin.ttlHours,
    expiresAt: checkin.expiresAt,
  }, 200);
});

// SPEC section 4.2 & BR-003: Radar is strictly anonymous ("X pessoas no local Y")
// Never reveals attendee identities or coordinates.
radarApp.get("/api/radar/:spotId", (c) => {
  const spotId = c.req.param("spotId");
  const now = Date.now();

  const active = checkinsStore.filter(
    (chk) => chk.spotId === spotId && chk.expiresAt > now
  );

  return c.json({
    spotId,
    activeCount: active.length,
    label: `${active.length} pessoas no local`,
  }, 200);
});
