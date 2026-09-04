import { Hono } from "hono";
import { html } from "hono/html";

export const viewsApp = new Hono();

function renderLayout(title: string, content: any) {
  return html`<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} — Liberages</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f111a; color: #f0f0f5; margin: 0; padding: 0; }
          nav { display: flex; gap: 1rem; background: #1a1d2e; padding: 1rem; border-bottom: 1px solid #2d314d; }
          nav a { color: #e94560; text-decoration: none; font-weight: bold; }
          main { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
          .card { background: #16192b; border: 1px solid #2d314d; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/feed">Feed Social</a>
          <a href="/swipe">Encontros</a>
          <a href="/mapa">Mapa & Radar</a>
          <a href="/carteira">Minha Carteira</a>
        </nav>
        <main>
          ${content}
        </main>
      </body>
    </html>`;
}

// 1. Feed Social (Fotolog)
viewsApp.get("/feed", (c) => {
  return c.html(
    renderLayout(
      "Feed Social",
      html`
        <h1>Feed Social — Fotolog 24h</h1>
        <p>Fotos expiram estritamente em 24 horas. Desfoque facial ativado por padrão.</p>
        <div class="card">
          <h3>Fotolog do Dia</h3>
          <p>Nenhuma foto postada nas últimas 24 horas.</p>
        </div>
      `
    ),
    200
  );
});

// 2. Deck de Swipe (Encontros)
viewsApp.get("/swipe", (c) => {
  return c.html(
    renderLayout(
      "Encontros",
      html`
        <h1>Encontros & Swipe Deck</h1>
        <p>Perfis ordenados por distância física e compatibilidade de fetiches.</p>
        <div class="card">
          <h3>Deck de Perfis</h3>
          <p>Cota diária: 30 likes no plano Free. Likes ilimitados no Premium.</p>
        </div>
      `
    ),
    200
  );
});

// 3. Mapa & Radar
viewsApp.get("/mapa", (c) => {
  return c.html(
    renderLayout(
      "Mapa & Radar",
      html`
        <h1>Mapa & Radar de Estabelecimentos</h1>
        <p>Radar anônimo com check-in dinâmico por TTL (1h a 4h).</p>
        <div class="card">
          <h3>Locais Curados</h3>
          <p>Motéis, bares liberais e clubes de swing parceiros.</p>
        </div>
      `
    ),
    200
  );
});

// 4. Carteira Virtual (Token Wallet Closed-Loop)
viewsApp.get("/carteira", (c) => {
  return c.html(
    renderLayout(
      "Minha Carteira",
      html`
        <h1>Minha Carteira — Tokens Liberages</h1>
        <p>Moeda fechada para Match Boost e presentes. Zero Cash-out e Zero P2P.</p>
        <div class="card">
          <h3>Saldo Disponível: 0 Tokens</h3>
          <button style="background: #e94560; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px;">Recarregar com Mercado Pago</button>
        </div>
      `
    ),
    200
  );
});
