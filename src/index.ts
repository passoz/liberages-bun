import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { html } from "hono/html";
import { JWT_SECRET, app as authApp } from "./auth";

export const app = new Hono();

app.route("/", authApp);

app.get("/healthz", (c) => c.text("ok", 200));

app.get("/", async (c) => {
  const token = getCookie(c, "auth_token");
  if (!token) {
    return c.text("Não autorizado", 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    if (!payload || !payload.sub) {
      return c.text("Não autorizado", 401);
    }

    return c.html(
      html`<!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8" />
            <title>Painel Liberages</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body>
            <main>
              <h1>Painel Liberages</h1>
              <p>Bem-vindo ao Liberages.</p>
            </main>
          </body>
        </html>`,
      200
    );
  } catch {
    return c.text("Não autorizado", 401);
  }
});
