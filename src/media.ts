import { Hono } from "hono";

interface EphemeralItem {
  data: string;
  consumed: boolean;
}

const ephemeralStorage = new Map<string, EphemeralItem>();

export function registerEphemeralMedia(id: string, media: { data: string }): void {
  ephemeralStorage.set(id, {
    data: media.data,
    consumed: false,
  });
}

export const mediaApp = new Hono();

mediaApp.get("/api/media/:id", async (c) => {
  const id = c.req.param("id");
  const item = ephemeralStorage.get(id);

  if (!item) {
    return c.json({ error: "Not Found" }, 404);
  }

  if (item.consumed) {
    return c.json({ error: "Gone - Media already consumed" }, 410);
  }

  await new Promise((r) => setTimeout(r, 10));
  item.consumed = true;
  return c.json({ data: item.data }, 200);
});
