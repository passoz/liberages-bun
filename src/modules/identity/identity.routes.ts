import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { identityService } from "./identity.service";
import { userRepository } from "./user.repository";
import { JWT_SECRET } from "../../auth";
import { getRequestBody } from "../../shared/request";
import { createThrottleMiddleware } from "../../throttle";

export const identityRoutes = new Hono();

const loginThrottle = createThrottleMiddleware(5, 60 * 1000);

// PIN-First Login (SEC-06 & EC-001 throttle protection)
identityRoutes.post("/login/pin", loginThrottle, async (c) => {
  const body = await getRequestBody(c);
  const { pin, userId } = body;
  const isForm = !c.req.header("content-type")?.includes("application/json");

  if (!pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    if (isForm) return c.redirect("/login?error=PIN+inv%C3%A1lido");
    return c.json({ error: "Formato de PIN inválido (4 dígitos requeridos)" }, 400);
  }

  const user = userId ? userRepository.findById(userId) : null;
  // If specific userId is requested, user must exist and have valid PIN (no default fallback)
  const isDefaultDeviceAllowed = !userId;
  const isValid = identityService.verifyPin(user?.pin, pin, isDefaultDeviceAllowed);

  if (!isValid) {
    if (isForm) return c.redirect("/login?error=PIN+incorreto");
    return c.json({ error: "PIN incorreto" }, 401);
  }

  const payload = {
    sub: user?.id || "user-session",
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

  if (isForm) return c.redirect("/");
  return c.json({ success: true, token, user });
});

// Soft gate: 18+ auto-declaration gives read-only access
identityRoutes.post("/onboarding/soft", async (c) => {
  const body = await getRequestBody(c);
  const isForm = !c.req.header("content-type")?.includes("application/json");
  const over18 = body?.over18 === true || body?.over18 === "true" || body?.over18 === "on";

  if (!over18) {
    if (isForm) return c.redirect("/onboarding?error=Aceite+obrigat%C3%B3rio");
    return c.json({ error: "Deve declarar maioridade (18+)" }, 400);
  }

  setCookie(c, "gate", "soft", { path: "/", httpOnly: true, sameSite: "Lax" });
  if (isForm) return c.redirect("/onboarding?success=Soft+Gate+Ativado");
  return c.json({ success: true, gate: "soft" }, 200);
});

// Hard gate: age verification doc -> saves hash, discards image
identityRoutes.post("/onboarding/hard", async (c) => {
  const gate = getCookie(c, "gate");
  const isForm = !c.req.header("content-type")?.includes("application/json");

  if (!gate) {
    if (isForm) return c.redirect("/onboarding?error=Soft+Gate+necess%C3%A1rio");
    return c.json({ error: "Requer soft gate prévio" }, 401);
  }

  const body = await getRequestBody(c);
  const docPayload = body?.docBase64 || body?.docFile || "mock-doc-upload";

  if (!docPayload) {
    if (isForm) return c.redirect("/onboarding?error=Envie+um+documento");
    return c.json({ error: "Documento obrigatório" }, 400);
  }

  const userId = body.userId || "anon-user";
  const result = identityService.processHardGate(userId, String(docPayload));

  setCookie(c, "gate", "hard", { path: "/", httpOnly: true, sameSite: "Lax" });
  if (isForm) return c.redirect("/onboarding?success=Verifica%C3%A7%C3%A3o+Conclu%C3%ADda");
  return c.json({ success: true, gate: "hard", verificationHash: result.verificationHash }, 200);
});
