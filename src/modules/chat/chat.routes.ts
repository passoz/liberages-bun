import { Hono } from "hono";
import { chatRepository } from "./chat.repository";
import { matchingRepository } from "../social/matching.repository";

export const chatRoutes = new Hono();

// Send private DM (requires match)
chatRoutes.post("/messages", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { fromUserId, toUserId, text } = body;

  if (!fromUserId || !toUserId || !text) {
    return c.json({ error: "Campos obrigatórios ausentes" }, 400);
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

// Read conversation (only participants allowed)
chatRoutes.get("/messages/:userA/:userB", (c) => {
  const userA = c.req.param("userA");
  const userB = c.req.param("userB");
  const requester = c.req.header("x-user-id");

  if (!requester || (requester !== userA && requester !== userB)) {
    return c.json({ error: "Acesso não autorizado" }, 403);
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
