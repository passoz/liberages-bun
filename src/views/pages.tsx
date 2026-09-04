import { html } from "hono/html";

export function renderLayout(title: string, content: any, currentPath = "/") {
  return html`<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} — Liberages</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e94560" />
        <style>
          :root {
            --bg-primary: #0f111a;
            --bg-secondary: #1a1d2e;
            --bg-card: #16192b;
            --accent: #e94560;
            --accent-hover: #ff5e78;
            --text-main: #f0f0f5;
            --text-muted: #8c8fa3;
            --border: #2d314d;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          header {
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            padding: 0.75rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--accent);
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .panic-btn {
            background: #d63031;
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
          }
          nav {
            display: flex;
            gap: 0.5rem;
            background: var(--bg-secondary);
            padding: 0.5rem 1rem;
            border-bottom: 1px solid var(--border);
            overflow-x: auto;
          }
          nav a {
            color: var(--text-muted);
            text-decoration: none;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            font-size: 0.9rem;
            white-space: nowrap;
          }
          nav a.active, nav a:hover {
            color: var(--text-main);
            background: rgba(233, 69, 96, 0.15);
            font-weight: 600;
          }
          main {
            max-width: 900px;
            width: 100%;
            margin: 1.5rem auto;
            padding: 0 1rem;
            flex: 1;
          }
          .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .btn {
            background: var(--accent);
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-size: 0.95rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
          .btn:hover { background: var(--accent-hover); }
          .badge {
            background: rgba(233, 69, 96, 0.2);
            color: var(--accent);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
          }
        </style>
      </head>
      <body>
        <header>
          <a href="/" class="logo">Liberages</a>
          <a href="/disfarce/calculadora" class="panic-btn">Modo Pânico</a>
        </header>
        <nav>
          <a href="/feed" class="${currentPath === "/feed" ? "active" : ""}">Feed Social</a>
          <a href="/swipe" class="${currentPath === "/swipe" ? "active" : ""}">Encontros</a>
          <a href="/mapa" class="${currentPath === "/mapa" ? "active" : ""}">Mapa & Radar</a>
          <a href="/carteira" class="${currentPath === "/carteira" ? "active" : ""}">Minha Carteira</a>
          <a href="/spaces" class="${currentPath === "/spaces" ? "active" : ""}">Comunidades</a>
        </nav>
        <main>
          ${content}
        </main>
        <script>
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        </script>
      </body>
    </html>`;
}

// 1. Feed Social (Fotolog 24h)
export function renderFeedPage(posts: any[]) {
  return renderLayout(
    "Feed Social",
    html`
      <h1>Feed Social — Fotolog 24h</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Foto diária com decaimento estrito após 24h. Desfoque facial automático ativo por padrão.
      </p>

      <div class="card">
        <h3>Publicar no Fotolog</h3>
        <form method="POST" action="/api/social/fotolog" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <input type="text" name="imageUrl" placeholder="URL da foto do dia" style="padding: 0.5rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;" required />
          <label style="font-size: 0.85rem; color: var(--text-muted);">
            <input type="checkbox" name="faceShowEnabled" value="true" /> Desejo revelar meu rosto (desativar blur automático)
          </label>
          <button type="submit" class="btn" style="align-self: flex-start;">Postar Foto</button>
        </form>
      </div>

      <div class="card">
        <h3>Fotolog de Hoje</h3>
        ${posts.length === 0
          ? html`<p style="color: var(--text-muted); margin-top: 0.5rem;">Nenhuma foto ativa nas últimas 24 horas.</p>`
          : html`<div>${posts.map((p) => html`<div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border);"><p>Post #${p.id} — ${p.faceBlur ? "[Rosto com Blur]" : "[Rosto Revelado]"}</p></div>`)}</div>`}
      </div>
    `,
    "/feed"
  );
}

// 2. Swipe Deck (Encontros)
export function renderSwipePage() {
  return renderLayout(
    "Encontros & Swipe Deck",
    html`
      <h1>Encontros & Deck de Swipe</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Perfis ranqueados primeiro pela proximidade física e em seguida pela afinidade de fetiches.
      </p>

      <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
        <span class="badge">Deck de Swipe Ativo</span>
        <h2 style="margin: 1rem 0;">CasalExploradorSP</h2>
        <p style="color: var(--text-muted); margin-bottom: 1rem;">📍 3.2 km de distância • 85% de Afinidade (BDSM, Voyeur, Swing)</p>
        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;">
          <button class="btn" style="background: #34495e;">Pular</button>
          <button class="btn" style="background: #27ae60;">Curtir (Like)</button>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1.5rem;">Cota restante no plano Free: 29 likes hoje.</p>
      </div>
    `,
    "/swipe"
  );
}

// 3. Mapa & Radar
export function renderMapPage(spotsList: any[]) {
  return renderLayout(
    "Mapa & Radar de Estabelecimentos",
    html`
      <h1>Mapa & Radar de Estabelecimentos</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Consulte a lotação anônima dos locais curados (Motéis, Clubes de Swing e Bares liberais).
      </p>

      <div class="card">
        <h3>Fazer Check-in no Local</h3>
        <form method="POST" action="/api/radar/checkin" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <select name="spotId" style="padding: 0.5rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;">
            <option value="motel-oasis">Motel Oasis (Curado)</option>
            <option value="clube-noir">Clube Privé Noir</option>
            <option value="bar-veludo">Bar Veludo Liberal</option>
          </select>
          <label style="font-size: 0.85rem; color: var(--text-muted);">
            Tempo de permanência (TTL):
            <select name="ttlHours" style="padding: 0.3rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px; margin-left: 0.5rem;">
              <option value="1">1 hora</option>
              <option value="2" selected>2 horas</option>
              <option value="3">3 horas</option>
              <option value="4">4 horas (Máximo)</option>
            </select>
          </label>
          <button type="submit" class="btn" style="align-self: flex-start;">Confirmar Check-in Anônimo</button>
        </form>
      </div>

      <div class="card">
        <h3>Locais Próximos & Lotação no Radar</h3>
        <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="padding: 0.75rem; background: #0f111a; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Motel Oasis</strong>
              <p style="font-size: 0.8rem; color: var(--text-muted);">Motel • Zona Sul</p>
            </div>
            <span class="badge" style="background: rgba(39, 174, 96, 0.2); color: #2ecc71;">8 pessoas no radar</span>
          </div>
          <div style="padding: 0.75rem; background: #0f111a; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Clube Privé Noir</strong>
              <p style="font-size: 0.8rem; color: var(--text-muted);">Casa de Swing • Centro</p>
            </div>
            <span class="badge" style="background: rgba(39, 174, 96, 0.2); color: #2ecc71;">14 pessoas no radar</span>
          </div>
        </div>
      </div>
    `,
    "/mapa"
  );
}

// 4. Carteira Virtual
export function renderWalletPage(balance: number) {
  return renderLayout(
    "Minha Carteira",
    html`
      <h1>Minha Carteira (Tokens Liberages)</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Economia em circuito fechado (Closed-Loop). Zero Cash-out e Zero P2P.
      </p>

      <div class="card">
        <span class="badge">Saldo Atual</span>
        <h2 style="font-size: 2.5rem; margin: 0.5rem 0; color: var(--accent);">${balance} Tokens</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Use seus tokens para Match Boost, compra de presentes virtuais e cupons em estabelecimentos parceiros.
        </p>

        <form method="POST" action="/api/economy/wallet/webhook/mercadopago">
          <input type="hidden" name="tokenUnits" value="100" />
          <input type="hidden" name="status" value="approved" />
          <button type="button" class="btn" onclick="alert('Conexão ao Mercado Pago iniciada.')">Recarregar 100 Tokens (R$ 19,90)</button>
        </form>
      </div>
    `,
    "/carteira"
  );
}

// 5. Spaces & Comunidades
export function renderSpacesPage() {
  return renderLayout(
    "Spaces & Comunidades",
    html`
      <h1>Spaces & Comunidades</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Participe de fóruns gerais sob seu perfil ou desabafe em sub-comunidades anônimas sob pseudônimo exclusivo.
      </p>

      <div class="card">
        <h3>Fórum Geral (Aberto)</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Compartilhe dicas, locais e relatos com a comunidade aberta.</p>
      </div>

      <div class="card">
        <h3>Comunidade Anônima: Confissões</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Totalmente anônimo com pseudônimo exclusivo. Nem mesmo outros membros vêem seu perfil real.</p>
      </div>
    `,
    "/spaces"
  );
}

// 6. Modo Falso (Disfarce - Calculadora)
export function renderDisguisePage() {
  return html`<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Calculadora</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #000; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .calc { width: 320px; background: #000; border-radius: 20px; padding: 20px; }
          .screen { font-size: 3rem; text-align: right; padding: 20px 0; color: #fff; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          button { background: #333; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 1.5rem; color: #fff; cursor: pointer; }
          .op { background: #f39c12; }
          .top { background: #a5a5a5; color: #000; }
        </style>
      </head>
      <body>
        <div class="calc">
          <div class="screen" id="disp">0</div>
          <div class="grid">
            <button class="top" onclick="document.getElementById('disp').innerText='0'">C</button>
            <button class="top">±</button>
            <button class="top">%</button>
            <button class="op">÷</button>
            <button onclick="document.getElementById('disp').innerText+='7'">7</button>
            <button onclick="document.getElementById('disp').innerText+='8'">8</button>
            <button onclick="document.getElementById('disp').innerText+='9'">9</button>
            <button class="op">×</button>
            <button onclick="document.getElementById('disp').innerText+='4'">4</button>
            <button onclick="document.getElementById('disp').innerText+='5'">5</button>
            <button onclick="document.getElementById('disp').innerText+='6'">6</button>
            <button class="op">-</button>
            <button onclick="document.getElementById('disp').innerText+='1'">1</button>
            <button onclick="document.getElementById('disp').innerText+='2'">2</button>
            <button onclick="document.getElementById('disp').innerText+='3'">3</button>
            <button class="op">+</button>
            <button style="grid-column: span 2; width: 130px; border-radius: 30px; text-align: left; padding-left: 20px;" onclick="document.getElementById('disp').innerText+='0'">0</button>
            <button>.</button>
            <button class="op" onclick="location.href='/'">=</button>
          </div>
        </div>
      </body>
    </html>`;
}
