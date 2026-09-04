import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { identityService } from "./identity.service";
import { userRepository } from "./user.repository";
import { JWT_SECRET } from "../../auth";

export const identityRoutes = new Hono();

// PIN-First Login
identityRoutes.post("/login/pin", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { pin, userId } = body;

  if (!pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    return c.json({ error: "Formato de PIN inválido (4 dígitos requeridos)" }, 400);
  }

  const user = userId ? userRepository.findById(userId) : null;
  const isValid = identityService.verifyPin(user?.pin, pin);

  if (!isValid) {
    return c.json({ error: "PIN incorreto" }, 401);
  }

  const payload = {
    sub: user?.id || "default-user",
    role: user?.accountType || "single",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const token = await sign(payload, JWT_SECRET);
  setCookie(c, "auth_token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24,
  });

  return c.json({ success: true, token, user });
});

// Soft gate: 18+ auto-declaration gives read-only access
identityRoutes.post("/onboarding/soft", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (!body?.over18) {
    return c.json({ error: "Deve declarar maioridade (18+)" }, 400);
  }

  setCookie(c, "gate", "soft", { path: "/", httpOnly: true, sameSite: "Lax" });
  return c.json({ success: true, gate: "soft" }, 200);
});

// Hard gate: age verification doc -> saves hash, discards image
identityRoutes.post("/onboarding/hard", async (c) => {
  const gate = getCookie(c, "gate");
  if (!gate) {
    return c.json({ error: "Requer soft gate prévio" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  if (!body?.docBase64) {
    return c.json({ error: "Documento obrigatório" }, 400);
  }

  const userId = body.userId || "anon-user";
  const result = identityService.processHardGate(userId, body.docBase64);

  setCookie(c, "gate", "hard", { path: "/", httpOnly: true, sameSite: "Lax" });
  return c.json({ success: true, gate: "hard", verificationHash: result.verificationHash }, 200);
});
