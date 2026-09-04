import { Hono } from "hono";
import { friendshipsStore } from "./matching";

export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
}

export const messagesStore: ChatMessage[] = [];

export const chatApp = new Hono();

// SPEC section 7.1: Chat DMs between matched friends
chatApp.post("/api/chat/messages", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { from, to, text } = body;

  if (!from || !to || !text) {
    return c.json({ error: "Campos obrigatórios ausentes" }, 400);
  }

  // Validate mutual match / friendship
  const areFriends = friendshipsStore.some(
    (f) =>
      (f.user1 === from && f.user2 === to) ||
      (f.user1 === to && f.user2 === from)
  );

  if (!areFriends) {
    return c.json({ error: "Apenas amigos com match mútuo podem trocar mensagens privadas" }, 403);
  }

  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    from,
    to,
    text,
    timestamp: Date.now(),
  };

  messagesStore.push(msg);
  return c.json({ success: true, message: msg }, 200);
});

// SPEC section 7.1: Message isolation - only conversation participants can read
chatApp.get("/api/chat/messages/:userA/:userB", (c) => {
  const userA = c.req.param("userA");
  const userB = c.req.param("userB");
  const requester = c.req.header("x-user-id");

  if (!requester || (requester !== userA && requester !== userB)) {
    return c.json({ error: "Acesso não autorizado à conversa privada" }, 403);
  }

  const conversation = messagesStore.filter(
    (m) =>
      (m.from === userA && m.to === userB) ||
      (m.from === userB && m.to === userA)
  );

  return c.json({ messages: conversation }, 200);
});
