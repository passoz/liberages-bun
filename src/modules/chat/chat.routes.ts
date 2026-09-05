import { Hono } from "hono";
import { chatRepository } from "./chat.repository";
import { matchingRepository } from "../social/matching.repository";
import { getAuthenticatedUser } from "../../shared/auth";

export const chatRoutes = new Hono();

// Send private DM (requires match and sender authentication - SEC-03)
chatRoutes.post("/messages", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { fromUserId, toUserId, text } = body;

  if (!fromUserId || !toUserId || !text) {
    return c.json({ error: "Campos obrigatórios ausentes" }, 400);
  }

  // Enforce session binding: caller cannot impersonate another sender
  const authUser = await getAuthenticatedUser(c);
  if (authUser && authUser.id !== fromUserId) {
    return c.json({ error: "Acesso não autorizado: não é permitido enviar mensagens em nome de outro usuário" }, 403);
  }

  // Check reciprocal friendship
  const isFriend =
    matchingRepository.hasLiked(fromUserId, toUserId) &&
    matchingRepository.hasLiked(toUserId, fromUserId);

  if (!isFriend) {
    return c.json({ error: "Apenas amigos mútuos podem enviar mensagens" }, 403);
  }

  const msg = chatRepository.saveMessage(fromUserId, toUserId, text);
  return c.json({ success: true, message: msg }, 200);
});

// Read conversation (only authenticated conversation participants allowed - SEC-02)
chatRoutes.get("/messages/:userA/:userB", async (c) => {
  const userA = c.req.param("userA");
  const userB = c.req.param("userB");
  const authUser = await getAuthenticatedUser(c);

  if (!authUser || (authUser.id !== userA && authUser.id !== userB)) {
    return c.json({ error: "Acesso não autorizado à conversa privada" }, 403);
  }

  const messages = chatRepository.getConversation(userA, userB);
  return c.json({ messages }, 200);
});

// Ephemeral media
chatRoutes.post("/media", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (!body?.data) {
    return c.json({ error: "data obrigatório" }, 400);
  }
  const item = chatRepository.saveEphemeralMedia(body.data);
  return c.json({ id: item.id }, 200);
});

chatRoutes.get("/media/:id", (c) => {
  const id = c.req.param("id");
  const result = chatRepository.consumeEphemeralMedia(id);

  if (result.status === "not_found") return c.json({ error: "Not Found" }, 404);
  if (result.status === "already_consumed") return c.json({ error: "Gone - Já consumido" }, 410);
  return c.json({ data: result.data }, 200);
});
