import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, deleteCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { db, sqlite } from "../db/index";
import { users } from "../db/schema";
import { registerShutdownHook, gracefulShutdown } from "./server";
import { auth, JWT_SECRET, app as legacyAuthApp } from "./auth";
import { getAuthenticatedUser } from "./shared/auth";

// Modular Monolith Domain Routes
import { identityRoutes } from "./modules/identity/identity.routes";
import { radarRoutes } from "./modules/radar/radar.routes";
import { socialRoutes } from "./modules/social/social.routes";
import { searchRoutes } from "./modules/search/search.routes";
import { economyRoutes } from "./modules/economy/economy.routes";
import { chatRoutes } from "./modules/chat/chat.routes";
import { communityRoutes } from "./modules/community/community.routes";
import { securityRoutes } from "./modules/security/security.routes";
import { webViewsRoutes } from "./views/views.routes";
import { renderLayout } from "./views/pages";
import { html } from "hono/html";

export const app = new Hono();

// Global Middlewares (SPEC section 2: Strict order)
// 1. Request ID & Logger
app.use("*", async (c, next) => {
  const reqId = c.req.header("x-request-id") || crypto.randomUUID();
  c.header("x-request-id", reqId);
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.header("x-response-time", `${ms}ms`);
});

// 2. CORS
app.use("*", cors());

// Health Checks (SPEC section 2: Health Checks isolados)
app.get("/healthz", (c) => c.text("ok", 200));

app.get("/readyz", (c) => {
  try {
    // Ping SQLite to ensure database readiness via Drizzle ORM
    db.select().from(users).limit(1).all();
    return c.json({ status: "ready", database: "connected" }, 200);
  } catch (err: any) {
    return c.json({ status: "not_ready", error: err.message }, 503);
  }
});

// Mount Better Auth endpoints
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Mount Legacy compatibility routes
app.route("/", legacyAuthApp);

// Mount Modular Monolith API Routes
app.route("/api/identity", identityRoutes);
app.route("/api/radar", radarRoutes);
app.route("/api/social", socialRoutes);
app.route("/api/search", searchRoutes);
app.route("/api/economy", economyRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/community", communityRoutes);
app.route("/api/security", securityRoutes);

// Mount SSR UI Routes & PWA Assets
app.route("/", webViewsRoutes);

// Home Dashboard
app.get("/", async (c) => {
  const authUser = await getAuthenticatedUser(c);

  if (!authUser || !authUser.id) {
    // Clear invalid, malformed, or expired cookies to prevent redirect loop
    deleteCookie(c, "auth_token", { path: "/" });
    deleteCookie(c, "better-auth.session_token", { path: "/" });

    // Unauthenticated landing page (HTTP 200)
    return c.html(
      renderLayout(
        "Bem-vindo",
        html`
          <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
            <h1 style="color: var(--accent-crimson); margin-bottom: 1rem;">Bem-vindo ao Liberages</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
              A rede social e mapa interativo prioritário para a comunidade liberal com privacidade total.
            </p>
            <div style="display: flex; justify-content: center; gap: 1rem;">
              <a href="/login" class="btn">Entrar com PIN</a>
              <a href="/feed" class="btn btn-secondary">Explorar Feed</a>
              <a href="/mapa" class="btn btn-secondary">Ver Mapa</a>
            </div>
          </div>
        `
      ),
      200
    );
  }

  return c.html(
    renderLayout(
      "Painel Liberages",
      html`
        <div class="card">
          <h1>Painel Liberages</h1>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">
            Conectado como ID: <strong>${authUser.id}</strong> (${authUser.role})
          </p>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <a href="/feed" class="btn">Feed do Fotolog</a>
            <a href="/swipe" class="btn" style="background: #27ae60;">Deck de Swipe</a>
            <a href="/carteira" class="btn" style="background: #8e44ad;">Minha Carteira</a>
          </div>
        </div>
      `
    ),
    200
  );
});

// Register SQLite cleanup on graceful shutdown
registerShutdownHook(() => {
  if (process.env.NODE_ENV === "production") {
    console.log("Closing SQLite database connection...");
    sqlite.close();
  }
});

const port = Number(process.env.PORT) || 3333;

export default {
  port,
  fetch: app.fetch,
};
