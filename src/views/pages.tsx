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
          .alert {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
          }
          .alert-success { background: rgba(39, 174, 96, 0.2); color: #2ecc71; border: 1px solid #27ae60; }
          .alert-error { background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid #c0392b; }
        </style>
      </head>
      <body>
        <header>
          <a href="/" class="logo">Liberages</a>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <a href="/onboarding" style="color: var(--text-muted); font-size: 0.85rem; text-decoration: none;">Verificação</a>
            <a href="/login" style="color: var(--text-muted); font-size: 0.85rem; text-decoration: none;">Login (PIN)</a>
            <a href="/disfarce/calculadora" class="panic-btn">Modo Pânico</a>
          </div>
        </header>
        <nav>
          <a href="/feed" class="${currentPath === "/feed" ? "active" : ""}">Feed Social</a>
          <a href="/swipe" class="${currentPath === "/swipe" ? "active" : ""}">Encontros</a>
          <a href="/mapa" class="${currentPath === "/mapa" ? "active" : ""}">Mapa & Radar</a>
          <a href="/carteira" class="${currentPath === "/carteira" ? "active" : ""}">Minha Carteira</a>
          <a href="/chat" class="${currentPath === "/chat" ? "active" : ""}">Mensagens</a>
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

// Login Page (PIN-First)
export function renderLoginPage(params: { error?: string; success?: string }) {
  return renderLayout(
    "Entrar com PIN",
    html`
      <div class="card" style="max-width: 400px; margin: 2rem auto; text-align: center;">
        <h2>Acesso Rápido por PIN</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
          Digite seu PIN de 4 dígitos (padrão: 1234)
        </p>

        ${params.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
        ${params.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

        <form method="POST" action="/api/identity/login/pin">
          <input
            type="password"
            name="pin"
            id="pin-input"
            maxlength="4"
            pattern="[0-9]{4}"
            style="font-size: 2rem; letter-spacing: 0.5rem; text-align: center; width: 180px; padding: 0.5rem; background: #0f111a; border: 2px solid var(--border); border-radius: 8px; color: white; margin-bottom: 1.5rem;"
            placeholder="••••"
            required
            autofocus
          />
          <br />
          <button type="submit" class="btn" style="width: 100%; padding: 0.75rem;">Entrar</button>
        </form>
      </div>
    `,
    "/login"
  );
}

// Onboarding Page (Soft & Hard Gate)
export function renderOnboardingPage(params: { gateStatus: string; error?: string; success?: string }) {
  return renderLayout(
    "Onboarding & Verificação de Idade",
    html`
      <h1>Onboarding em Camadas</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Status atual: <span class="badge" style="font-size: 0.9rem;">${params.gateStatus.toUpperCase()} GATE</span>
      </p>

      ${params.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <h3>1. Soft Gate (Acesso de Leitura)</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">
          Auto-declaração de maioridade (18+). Permite navegar no feed, buscar perfis e visualizar o mapa.
        </p>
        <form method="POST" action="/api/identity/onboarding/soft" style="margin-top: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 1rem;">
            <input type="checkbox" name="over18" value="true" required ${params.gateStatus !== "none" ? "checked disabled" : ""} />
            Declaro ter 18 anos de idade ou mais
          </label>
          <button type="submit" class="btn" ${params.gateStatus !== "none" ? "disabled style='opacity: 0.5'" : ""}>
            ${params.gateStatus !== "none" ? "✓ Soft Gate Confirmado" : "Confirmar Maioridade"}
          </button>
        </form>
      </div>

      <div class="card">
        <h3>2. Hard Gate (Acesso Total e Escrita)</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">
          Envio de documento para atestar idade. <strong>Privacidade absoluta:</strong> Apenas o hash criptográfico é salvo no banco; a imagem e o nome real são descartados imediatamente.
        </p>
        <form method="POST" action="/api/identity/onboarding/hard" style="margin-top: 1rem;">
          <input type="hidden" name="docBase64" value="simulated-secure-identity-doc-hash-2026" />
          <button type="submit" class="btn" style="background: #27ae60;" ${params.gateStatus === "hard" ? "disabled style='opacity: 0.5'" : ""}>
            ${params.gateStatus === "hard" ? "✓ Hard Gate Verificado (Acesso Total)" : "Enviar Verificação de Idade"}
          </button>
        </form>
      </div>
    `,
    "/onboarding"
  );
}

// 1. Feed Social (Fotolog 24h)
export function renderFeedPage(posts: any[], params?: { error?: string; success?: string }) {
  return renderLayout(
    "Feed Social",
    html`
      <h1>Feed Social — Fotolog 24h</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Foto diária com decaimento estrito após 24h. Desfoque facial automático ativo por padrão.
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <h3>Publicar no Fotolog</h3>
        <form method="POST" action="/api/social/fotolog" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <input type="text" name="imageUrl" placeholder="URL da foto do dia (ex: https://exemplo.com/foto.jpg)" style="padding: 0.6rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;" required />
          <label style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" name="faceShowEnabled" value="true" /> Desejo revelar meu rosto (desativar blur automático)
          </label>
          <button type="submit" class="btn" style="align-self: flex-start;">Postar Foto de Hoje</button>
        </form>
      </div>

      <div class="card">
        <h3>Fotolog de Hoje (${posts.length} ${posts.length === 1 ? "foto ativa" : "fotos ativas"})</h3>
        ${posts.length === 0
          ? html`<p style="color: var(--text-muted); margin-top: 0.5rem;">Nenhuma foto postada nas últimas 24 horas. Seja o primeiro a postar!</p>`
          : html`<div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
              ${posts.map(
                (p) => html`
                  <div style="padding: 1rem; background: #0f111a; border-radius: 6px; border: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                      <strong>@${p.userId}</strong>
                      <span class="badge">${p.faceBlur === 1 ? "🔒 Rosto com Blur" : "🔓 Rosto Revelado"}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Foto: ${p.imageUrl}</p>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">Expira em 24h a partir da postagem</p>
                  </div>
                `
              )}
            </div>`}
      </div>
    `,
    "/feed"
  );
}

// 2. Swipe Deck (Encontros)
export function renderSwipePage(params?: { liked?: boolean; match?: boolean; msg?: string; error?: string }) {
  return renderLayout(
    "Encontros & Swipe Deck",
    html`
      <h1>Encontros & Deck de Swipe</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Perfis ranqueados primeiro pela proximidade física e em seguida pela afinidade de fetiches.
      </p>

      ${params?.match ? html`<div class="alert alert-success"><strong>🎉 MATCH MÚTUO!</strong> ${params.msg || "Vocês se curtiram!"}</div>` : ""}
      ${params?.liked ? html`<div class="alert alert-success">Like registrado com sucesso!</div>` : ""}
      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}

      <div class="card" style="text-align: center; padding: 2.5rem 1.5rem; max-width: 500px; margin: 0 auto 1.5rem;">
        <span class="badge">🔥 Perfil em Destaque</span>
        <h2 style="margin: 1rem 0;">CasalExploradorSP</h2>
        <p style="color: var(--text-muted); margin-bottom: 0.5rem;">📍 3.2 km de distância • <strong>85% de Afinidade</strong></p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Fetiches: BDSM, Voyeur, Swing • Bucket List: Motel Oasis</p>

        <form method="POST" action="/api/social/swipe" style="display: flex; justify-content: center; gap: 1rem;">
          <input type="hidden" name="fromUserId" value="usuario-logado" />
          <input type="hidden" name="toUserId" value="casal-explorador" />
          <input type="hidden" name="category" value="real" />
          <button type="submit" name="action" value="skip" class="btn" style="background: #34495e;">Pular</button>
          <button type="submit" name="action" value="like" class="btn" style="background: #27ae60;">Curtir (Like) ❤️</button>
        </form>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1.5rem;">Cota do Free: 30 likes por dia. Assine Premium para likes ilimitados.</p>
      </div>
    `,
    "/swipe"
  );
}

// 3. Mapa & Radar
export function renderMapPage(spotsList: any[], getHeadcount: (id: string) => number, params?: { error?: string; success?: string }) {
  return renderLayout(
    "Mapa & Radar de Estabelecimentos",
    html`
      <h1>Mapa & Radar de Estabelecimentos</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Consulte a lotação anônima dos locais curados (Motéis, Clubes de Swing e Bares liberais).
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <h3>Fazer Check-in no Local (Anônimo)</h3>
        <form method="POST" action="/api/radar/checkin" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <select name="spotId" style="padding: 0.6rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;">
            ${spotsList.map((s) => html`<option value="${s.id}">${s.name} (${s.category})</option>`)}
          </select>
          <label style="font-size: 0.85rem; color: var(--text-muted);">
            Tempo de permanência no mapa (TTL obrigatório):
            <select name="ttlHours" style="padding: 0.4rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px; margin-left: 0.5rem;">
              <option value="1">1 hora</option>
              <option value="2" selected>2 horas</option>
              <option value="3">3 horas</option>
              <option value="4">4 horas (Máximo)</option>
            </select>
          </label>
          <button type="submit" class="btn" style="align-self: flex-start;">Confirmar Check-in</button>
        </form>
      </div>

      <div class="card">
        <h3>Locais Curados & Lotação em Tempo Real</h3>
        <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          ${spotsList.map((s) => {
            const count = getHeadcount(s.id);
            return html`
              <div style="padding: 0.75rem; background: #0f111a; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border);">
                <div>
                  <strong>${s.name}</strong>
                  <p style="font-size: 0.8rem; color: var(--text-muted);">Categoria: ${s.category.toUpperCase()} • ${s.isPartner ? "★ Parceiro Oficial" : "Local Curado"}</p>
                </div>
                <span class="badge" style="background: rgba(39, 174, 96, 0.2); color: #2ecc71;">
                  ${count} ${count === 1 ? "pessoa" : "pessoas"} no radar
                </span>
              </div>
            `;
          })}
        </div>
      </div>
    `,
    "/mapa"
  );
}

// 4. Carteira Virtual
export function renderWalletPage(balance: number, params?: { success?: string }) {
  return renderLayout(
    "Minha Carteira",
    html`
      <h1>Minha Carteira (Tokens Liberages)</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Economia em circuito fechado (Closed-Loop). Zero Cash-out e Zero P2P.
      </p>

      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <span class="badge">Saldo Disponível</span>
        <h2 style="font-size: 2.5rem; margin: 0.5rem 0; color: var(--accent);">${balance} Tokens</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Use seus tokens para Match Boost no topo do Swipe, presentes virtuais no chat e cupons em estabelecimentos parceiros.
        </p>

        <form method="POST" action="/carteira/recharge">
          <input type="hidden" name="tokens" value="100" />
          <button type="submit" class="btn">Recarregar 100 Tokens (R$ 19,90 via Mercado Pago)</button>
        </form>
      </div>
    `,
    "/carteira"
  );
}

// 5. Chat DM (Mensagens)
export function renderChatPage(messages: any[], params?: { success?: string; error?: string }) {
  return renderLayout(
    "Mensagens Privadas",
    html`
      <h1>Mensagens Privadas (DMs)</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Comunicação 1:1 segura e isolada entre perfis com match mútuo.
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card" style="min-height: 250px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3>Conversa com @ParceiroMatch</h3>
          <div style="margin: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem;">
            ${messages.length === 0
              ? html`<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma mensagem nesta conversa ainda. Diga oi!</p>`
              : messages.map(
                  (m) => html`
                    <div style="padding: 0.5rem 0.75rem; background: ${m.fromUserId === "eu" ? "#1a1d2e" : "#2d314d"}; border-radius: 6px; align-self: ${m.fromUserId === "eu" ? "flex-end" : "flex-start"}; max-width: 70%;">
                      <p style="font-size: 0.9rem;">${m.text}</p>
                    </div>
                  `
                )}
          </div>
        </div>

        <form method="POST" action="/chat/send" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <input type="text" name="text" placeholder="Digite sua mensagem segura..." style="flex: 1; padding: 0.6rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;" required />
          <button type="submit" class="btn">Enviar</button>
        </form>
      </div>
    `,
    "/chat"
  );
}

// 6. Spaces & Comunidades
export function renderSpacesPage(posts: any[], params?: { success?: string; error?: string }) {
  return renderLayout(
    "Spaces & Comunidades",
    html`
      <h1>Spaces & Comunidades</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Fóruns abertos (perfil principal) e Sub-comunidades anônimas (pseudônimo exclusivo).
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <h3>Publicar em uma Comunidade</h3>
        <form method="POST" action="/api/community/spaces/post" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <select name="spaceType" style="padding: 0.5rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;">
            <option value="forum">Fórum Geral (Aberto — Usa seu Apelido Público)</option>
            <option value="anonymous_community">Comunidade de Confissões (Anônimo — Pseudônimo Exclusivo)</option>
          </select>
          <input type="text" name="communityPseudonym" placeholder="Pseudônimo (se anônimo, ex: MisterioSP)" style="padding: 0.5rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;" />
          <textarea name="content" rows="3" placeholder="Compartilhe seu relato, dúvida ou experiência..." style="padding: 0.5rem; background: #0f111a; border: 1px solid var(--border); color: white; border-radius: 4px;" required></textarea>
          <button type="submit" class="btn" style="align-self: flex-start;">Publicar no Space</button>
        </form>
      </div>

      <div class="card">
        <h3>Publicações Recentes nos Spaces (${posts.length})</h3>
        ${posts.length === 0
          ? html`<p style="color: var(--text-muted); margin-top: 0.5rem;">Nenhum relato publicado ainda.</p>`
          : html`<div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
              ${posts.map(
                (p) => html`
                  <div style="padding: 0.75rem; background: #0f111a; border-radius: 6px; border: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                      <strong>${p.authorDisplayed}</strong>
                      <span class="badge">${p.spaceType === "anonymous_community" ? "🔒 Anônimo" : "🌐 Fórum Aberto"}</span>
                    </div>
                    <p style="font-size: 0.9rem;">${p.content}</p>
                  </div>
                `
              )}
            </div>`}
      </div>
    `,
    "/spaces"
  );
}

// 7. Modo Falso (Disfarce - Calculadora)
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
