import { Hono } from "hono";
import { spotRepository } from "./spot.repository";
import { checkinRepository } from "./checkin.repository";

export const radarRoutes = new Hono();

// List curated spots
radarRoutes.get("/spots", (c) => {
  const allSpots = spotRepository.findAll();
  return c.json({ spots: allSpots });
});

// Dynamic check-in with enforced TTL (1h to 4h)
radarRoutes.post("/checkin", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { spotId, ttlHours, userId, expiresAt } = body;

  if (!spotId || typeof ttlHours !== "number" || ttlHours < 1 || ttlHours > 4) {
    return c.json({ error: "TTL obrigatório entre 1h e 4h" }, 400);
  }

  const checkin = checkinRepository.create(userId || "anon-user", spotId, ttlHours, expiresAt);
  return c.json({
    success: true,
    checkinId: checkin.id,
    spotId: checkin.spotId,
    ttlHours: checkin.ttlHours,
    expiresAt: checkin.expiresAt,
  });
});

// Anonymous Radar Headcount: returns headcount only, no user identities
radarRoutes.get("/radar/:spotId", (c) => {
  const spotId = c.req.param("spotId");
  const count = checkinRepository.countActiveBySpot(spotId);

  return c.json({
    spotId,
    activeCount: count,
    label: `${count} pessoas no local`,
  });
});
