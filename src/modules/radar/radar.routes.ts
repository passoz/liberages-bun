import { Hono } from "hono";
import { spotRepository } from "./spot.repository";
import { checkinRepository } from "./checkin.repository";
import { getRequestBody } from "../../shared/request";

export const radarRoutes = new Hono();

// Seed initial curated spots if none exist
function ensureCuratedSpots() {
  const existing = spotRepository.findAll();
  if (existing.length === 0) {
    spotRepository.create("Motel Oasis", "motel", "-23.5505", "-46.6333", 1);
    spotRepository.create("Clube Privé Noir", "club", "-23.5615", "-46.6559", 1);
    spotRepository.create("Bar Veludo Liberal", "bar", "-23.5687", "-46.6812", 0);
  }
}
ensureCuratedSpots();

// List curated spots
radarRoutes.get("/spots", (c) => {
  ensureCuratedSpots();
  const allSpots = spotRepository.findAll();
  return c.json({ spots: allSpots });
});

// Dynamic check-in with enforced TTL (1h to 4h)
radarRoutes.post("/checkin", async (c) => {
  const body = await getRequestBody(c);
  const spotId = body?.spotId;
  const ttlHours = Number(body?.ttlHours);
  const userId = body?.userId;
  const expiresAt = body?.expiresAt ? Number(body.expiresAt) : undefined;
  const isForm = !c.req.header("content-type")?.includes("application/json");

  if (!spotId || isNaN(ttlHours) || ttlHours < 1 || ttlHours > 4) {
    if (isForm) return c.redirect("/mapa?error=TTL+inv%C3%A1lido");
    return c.json({ error: "TTL obrigatório entre 1h e 4h" }, 400);
  }

  const checkin = checkinRepository.create(userId || "anon-user", spotId, ttlHours, expiresAt);
  if (isForm) return c.redirect(`/mapa?success=Check-in+confirmado+por+${ttlHours}h`);

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
