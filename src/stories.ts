import { Hono } from "hono";

export interface Story {
  id: string;
  title: string;
  text: string;
  authorId: string;
  createdAt: number;
}

export const storiesStore: Story[] = [];

export const storiesApp = new Hono();

// SPEC section 6: Contos Eróticos
// Usuários Free: Permissão apenas para ler.
storiesApp.get("/api/stories", (c) => {
  return c.json({ stories: storiesStore }, 200);
});

// Publicação de contos exige ser Premium OU desbloquear um nível/Badge alto de XP.
storiesApp.post("/api/stories", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { title, text, authorId, isPremium, xpLevel } = body;

  const canPublish = isPremium === true || (typeof xpLevel === "number" && xpLevel >= 10);

  if (!canPublish) {
    return c.json({
      error: "Acesso negado: a publicação de contos exige ser Premium ou atingir nível 10 de XP.",
    }, 403);
  }

  const story: Story = {
    id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || "Sem título",
    text: text || "",
    authorId: authorId || "author-anon",
    createdAt: Date.now(),
  };

  storiesStore.push(story);
  return c.json({ success: true, story }, 200);
});
