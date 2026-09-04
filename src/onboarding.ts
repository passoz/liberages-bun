import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createHash } from "node:crypto";

export const onboardingApp = new Hono();

// Soft gate: 18+ auto-declaration gives read-only access
onboardingApp.post("/api/onboarding/soft", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (!body?.over18) {
    return c.json({ error: "Debe declarar maioridade (18+)" }, 400);
  }

  setCookie(c, "gate", "soft", {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });
  return c.json({ success: true, gate: "soft" }, 200);
});

// Hard gate: document verification -> stores hash only, discards raw document
onboardingApp.post("/api/onboarding/hard", async (c) => {
  const gate = getCookie(c, "gate");
  if (!gate) {
    return c.json({ error: "Requer soft gate prévio" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  if (!body?.docBase64) {
    return c.json({ error: "Documento obrigatório" }, 400);
  }

  // Hash the document and immediately discard the raw payload
  const docHash = createHash("sha256").update(body.docBase64).digest("hex");

  setCookie(c, "gate", "hard", {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });
  return c.json({ success: true, gate: "hard", verificationHash: docHash }, 200);
});

// Protected read route: requires at least soft gate
onboardingApp.get("/api/feed", (c) => {
  const gate = getCookie(c, "gate");
  if (gate !== "soft" && gate !== "hard") {
    return c.json({ error: "Acesso negado. Complete o soft gate (18+)." }, 403);
  }
  return c.json({ posts: [] }, 200);
});

// Protected write route: requires hard gate
onboardingApp.post("/api/posts", (c) => {
  const gate = getCookie(c, "gate");
  if (gate !== "hard") {
    return c.json({ error: "Acesso negado. Requer verificação de idade (hard gate)." }, 403);
  }
  return c.json({ success: true, message: "Post criado" }, 200);
});
