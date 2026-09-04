import { Hono } from "hono";

export interface SpacePost {
  id: string;
  spaceType: "forum" | "anonymous_community";
  authorDisplayed: string;
  content: string;
  timestamp: number;
}

export const spacePostsStore: SpacePost[] = [];

export const spacesApp = new Hono();

// SPEC section 9.3: Fóruns e Comunidades (Estrutura Unificada Spaces)
// Fórum: Espaço aberto (autor usa seu perfil principal/apelido público)
// Comunidade Anônima: Sub-fóruns onde o autor atua sob um Pseudônimo exclusivo
spacesApp.post("/api/spaces/post", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { spaceType, realUserId, userNickname, communityPseudonym, content } = body;

  if (!spaceType || !content) {
    return c.json({ error: "spaceType e content são obrigatórios" }, 400);
  }

  let authorDisplayed: string;
  if (spaceType === "anonymous_community") {
    authorDisplayed = communityPseudonym || "Pseudônimo Anônimo";
  } else {
    authorDisplayed = userNickname || "Perfil Público";
  }

  const post: SpacePost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    spaceType,
    authorDisplayed,
    content,
    timestamp: Date.now(),
  };

  spacePostsStore.push(post);
  return c.json(post, 200);
});
