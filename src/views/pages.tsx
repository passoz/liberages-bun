import { html } from "hono/html";

// Modern SVG Icons for high-craft UI
const ICONS = {
  feed: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`,
  swipe: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  map: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>`,
  wallet: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  chat: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
  spaces: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  shield: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
  lock: html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  unlock: html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
  sparkles: html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
};

export function renderLayout(title: string, content: any, currentPath = "/") {
  return html`<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>${title} — Liberages</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0b10" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Urbanist:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          :root {
            --bg-canvas: #090a0f;
            --bg-surface: #11131c;
            --bg-card: #161926;
            --bg-card-hover: #1c2030;
            --bg-input: #0c0e15;
            --accent-crimson: #e0244e;
            --accent-crimson-hover: #ff3366;
            --accent-glow: rgba(224, 36, 78, 0.22);
            --accent-gold: #d4af37;
            --accent-emerald: #10b981;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --border-subtle: rgba(255, 255, 255, 0.08);
            --border-highlight: rgba(255, 255, 255, 0.15);
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 20px;
            --radius-pill: 9999px;
            --shadow-subtle: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
            --shadow-glow: 0 0 25px -3px rgba(224, 36, 78, 0.35);
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
          }

          ::selection {
            background: rgba(224, 36, 78, 0.35);
            color: #ffffff;
          }

          body {
            font-family: 'Urbanist', system-ui, -apple-system, sans-serif;
            background: var(--bg-canvas);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            letter-spacing: -0.015em;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            background-image: 
              radial-gradient(ellipse at 50% -20%, rgba(224, 36, 78, 0.12), transparent 70%),
              radial-gradient(circle at 90% 80%, rgba(132, 43, 88, 0.08), transparent 50%);
          }

          /* Custom Scrollbar */
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: var(--bg-canvas); }
          ::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: var(--accent-crimson); }

          /* Header */
          header {
            background: rgba(17, 19, 28, 0.82);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-subtle);
            padding: 0.85rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .logo-container {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            text-decoration: none;
          }

          .logo-dot {
            width: 8px;
            height: 8px;
            background: var(--accent-crimson);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--accent-crimson);
            animation: pulse 2.5s infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.6; }
          }

          .logo {
            font-family: 'Syne', sans-serif;
            font-size: 1.35rem;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.04em;
          }
          .logo span { color: var(--accent-crimson); }

          .header-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .header-link {
            color: var(--text-secondary);
            font-size: 0.85rem;
            font-weight: 500;
            text-decoration: none;
            transition: color 0.2s ease;
          }
          .header-link:hover { color: var(--text-primary); }

          .panic-btn {
            background: rgba(220, 38, 38, 0.16);
            color: #ef4444;
            border: 1px solid rgba(220, 38, 38, 0.35);
            padding: 0.45rem 0.9rem;
            border-radius: var(--radius-pill);
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s ease;
          }
          .panic-btn:hover {
            background: #dc2626;
            color: #ffffff;
            border-color: #dc2626;
            box-shadow: 0 0 15px rgba(220, 38, 38, 0.4);
          }

          /* Navigation Bar */
          nav {
            display: flex;
            gap: 0.4rem;
            background: rgba(17, 19, 28, 0.65);
            backdrop-filter: blur(12px);
            padding: 0.5rem 1.25rem;
            border-bottom: 1px solid var(--border-subtle);
            overflow-x: auto;
            scrollbar-width: none;
          }
          nav::-webkit-scrollbar { display: none; }

          nav a {
            color: var(--text-secondary);
            text-decoration: none;
            padding: 0.5rem 0.95rem;
            border-radius: var(--radius-sm);
            font-size: 0.88rem;
            font-weight: 500;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 0.45rem;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          nav a:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.04);
          }
          nav a.active {
            color: #ffffff;
            background: rgba(224, 36, 78, 0.14);
            border: 1px solid rgba(224, 36, 78, 0.3);
            font-weight: 600;
          }

          /* Main Container */
          main {
            max-width: 860px;
            width: 100%;
            margin: 2rem auto;
            padding: 0 1.25rem 4rem;
            flex: 1;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }

          h1, h2, h3 {
            font-family: 'Syne', sans-serif;
            letter-spacing: -0.02em;
          }
          h1 {
            font-size: 1.85rem;
            font-weight: 800;
            letter-spacing: -0.035em;
            margin-bottom: 0.4rem;
            color: #ffffff;
          }

          p.lead {
            color: var(--text-secondary);
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1.75rem;
          }

          /* Cards */
          .card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: var(--shadow-subtle);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .card:hover {
            border-color: var(--border-highlight);
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.02em;
          }

          /* Interactive Inputs & Forms */
          input[type="text"], input[type="password"], textarea, select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--bg-input);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            font-family: inherit;
            font-size: 0.92rem;
            outline: none;
            transition: all 0.2s ease;
          }
          input:focus, textarea:focus, select:focus {
            border-color: var(--accent-crimson);
            box-shadow: 0 0 0 3px rgba(224, 36, 78, 0.18);
          }

          /* Buttons */
          .btn {
            background: var(--accent-crimson);
            color: #ffffff;
            border: none;
            padding: 0.7rem 1.35rem;
            border-radius: var(--radius-sm);
            font-size: 0.92rem;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 2px 10px rgba(224, 36, 78, 0.25);
          }
          .btn:hover {
            background: var(--accent-crimson-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-glow);
          }
          .btn:active { transform: translateY(0); }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: var(--text-primary);
            box-shadow: none;
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.14);
            box-shadow: none;
          }

          /* Badges */
          .badge {
            background: rgba(224, 36, 78, 0.12);
            color: var(--accent-crimson);
            border: 1px solid rgba(224, 36, 78, 0.25);
            padding: 0.25rem 0.65rem;
            border-radius: var(--radius-pill);
            font-size: 0.78rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            letter-spacing: 0.01em;
          }
          .badge-success {
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
            border-color: rgba(16, 185, 129, 0.25);
          }

          /* Alerts */
          .alert {
            padding: 0.85rem 1.1rem;
            border-radius: var(--radius-sm);
            margin-bottom: 1.25rem;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: fadeIn 0.25s ease;
          }
          .alert-success {
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.25);
          }
          .alert-error {
            background: rgba(239, 68, 68, 0.12);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.25);
          }
        </style>
      </head>
      <body>
        <header>
          <a href="/" class="logo-container">
            <div class="logo-dot"></div>
            <div class="logo">Liber<span>ages</span></div>
          </a>
          <div class="header-actions">
            <a href="/onboarding" class="header-link">Verificação</a>
            <a href="/login" class="header-link">Login (PIN)</a>
            <a href="/disfarce/calculadora" class="panic-btn">
              ${ICONS.shield}
              Modo Pânico
            </a>
          </div>
        </header>

        <nav>
          <a href="/feed" class="${currentPath === "/feed" ? "active" : ""}">
            ${ICONS.feed}
            Feed Social
          </a>
          <a href="/swipe" class="${currentPath === "/swipe" ? "active" : ""}">
            ${ICONS.swipe}
            Encontros
          </a>
          <a href="/mapa" class="${currentPath === "/mapa" ? "active" : ""}">
            ${ICONS.map}
            Mapa & Radar
          </a>
          <a href="/carteira" class="${currentPath === "/carteira" ? "active" : ""}">
            ${ICONS.wallet}
            Minha Carteira
          </a>
          <a href="/chat" class="${currentPath === "/chat" ? "active" : ""}">
            ${ICONS.chat}
            Mensagens
          </a>
          <a href="/spaces" class="${currentPath === "/spaces" ? "active" : ""}">
            ${ICONS.spaces}
            Comunidades
          </a>
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

// 0. Login Page (PIN-First)
export function renderLoginPage(params: { error?: string; success?: string }) {
  return renderLayout(
    "Entrar com PIN",
    html`
      <div style="max-width: 380px; margin: 3rem auto; text-align: center;">
        <div class="card" style="padding: 2.25rem 1.75rem; border-top: 3px solid var(--accent-crimson);">
          <div style="width: 48px; height: 48px; background: rgba(224, 36, 78, 0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--accent-crimson);">
            ${ICONS.lock}
          </div>
          <h2>Acesso Rápido por PIN</h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0.4rem 0 1.5rem;">
            Digite seu PIN de 4 dígitos para acesso diário discreto (Padrão: 1234)
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
              placeholder="••••"
              style="font-size: 2.2rem; letter-spacing: 0.6rem; text-align: center; width: 100%; padding: 0.75rem; margin-bottom: 1.5rem; font-weight: 700;"
              required
              autofocus
            />
            <button type="submit" class="btn" style="width: 100%; padding: 0.85rem;">
              Entrar
            </button>
          </form>

          <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 1.5rem;">
            Novo por aqui? <a href="/onboarding" style="color: var(--accent-crimson); text-decoration: none; font-weight: 600;">Iniciar Onboarding</a>
          </p>
        </div>
      </div>
    `,
    "/login"
  );
}

// 0. Onboarding Page (Soft & Hard Gate)
export function renderOnboardingPage(params: { gateStatus: string; error?: string; success?: string }) {
  return renderLayout(
    "Onboarding & Verificação",
    html`
      <h1>Onboarding em Camadas</h1>
      <p class="lead">
        Status de acesso: <span class="badge ${params.gateStatus === "hard" ? "badge-success" : ""}" style="font-size: 0.82rem;">${params.gateStatus.toUpperCase()} GATE</span>
      </p>

      ${params.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div class="card" style="border-top: 2px solid ${params.gateStatus !== "none" ? "var(--accent-emerald)" : "var(--border-subtle)"};">
          <div class="card-header">
            <div class="card-title">1. Soft Gate (Leitura)</div>
            <span class="badge ${params.gateStatus !== "none" ? "badge-success" : ""}">
              ${params.gateStatus !== "none" ? "Ativo" : "Pendente"}
            </span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5;">
            Auto-declaração de maioridade (18+). Permite navegar no feed, buscar perfis e visualizar estabelecimentos no mapa.
          </p>
          <form method="POST" action="/api/identity/onboarding/soft" style="margin-top: 1.5rem;">
            <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer; margin-bottom: 1.25rem; font-size: 0.9rem; color: var(--text-primary);">
              <input type="checkbox" name="over18" value="true" required ${params.gateStatus !== "none" ? "checked disabled" : ""} style="width: 18px; height: 18px; accent-color: var(--accent-crimson);" />
              Declaro ter 18 anos de idade ou mais
            </label>
            <button type="submit" class="btn" style="width: 100%;" ${params.gateStatus !== "none" ? "disabled style='opacity: 0.6;'" : ""}>
              ${params.gateStatus !== "none" ? "✓ Soft Gate Confirmado" : "Confirmar Maioridade"}
            </button>
          </form>
        </div>

        <div class="card" style="border-top: 2px solid ${params.gateStatus === "hard" ? "var(--accent-emerald)" : "var(--accent-crimson)"};">
          <div class="card-header">
            <div class="card-title">2. Hard Gate (Acesso Total)</div>
            <span class="badge ${params.gateStatus === "hard" ? "badge-success" : ""}">
              ${params.gateStatus === "hard" ? "Verificado" : "Obrigatório p/ Interagir"}
            </span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5;">
            Verificação anônima de idade. <strong>Privacidade absoluta:</strong> Apenas o hash SHA-256 é registrado; a imagem e o nome real são descartados imediatamente.
          </p>
          <form method="POST" action="/api/identity/onboarding/hard" style="margin-top: 1.5rem;">
            <input type="hidden" name="docBase64" value="secure-doc-verification-token" />
            <button type="submit" class="btn" style="width: 100%; ${params.gateStatus === "hard" ? "background: var(--accent-emerald); opacity: 0.7;" : ""}" ${params.gateStatus === "hard" ? "disabled" : ""}>
              ${params.gateStatus === "hard" ? "✓ Hard Gate Verificado" : "Enviar Verificação de Idade"}
            </button>
          </form>
        </div>
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
      <p class="lead">
        Momentos diários que expiram estritamente em 24h. Desfoque facial automático ativo por padrão.
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <div class="card-title" style="margin-bottom: 0.8rem;">Publicar Foto do Dia</div>
        <form method="POST" action="/api/social/fotolog" style="display: flex; flex-direction: column; gap: 0.9rem;">
          <input type="text" name="imageUrl" placeholder="URL da foto (ex: https://images.unsplash.com/...)" required />
          <label style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
            <input type="checkbox" name="faceShowEnabled" value="true" style="width: 16px; height: 16px; accent-color: var(--accent-crimson);" /> 
            Desejo revelar meu rosto (desativar blur facial automático)
          </label>
          <button type="submit" class="btn" style="align-self: flex-start;">
            Postar Foto de Hoje
          </button>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Fotolog de Hoje</div>
          <span class="badge">${posts.length} ${posts.length === 1 ? "foto ativa" : "fotos ativas"}</span>
        </div>

        ${posts.length === 0
          ? html`<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">Nenhuma foto ativa nas últimas 24 horas. Compartilhe seu momento com discrição.</p>`
          : html`<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
              ${posts.map(
                (p) => html`
                  <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow: hidden; display: flex; flex-direction: column;">
                    <div style="height: 180px; background: #0c0e15; display: flex; align-items: center; justify-content: center; position: relative; border-bottom: 1px solid var(--border-subtle);">
                      <span style="font-size: 0.82rem; color: var(--text-muted); padding: 0 1rem; text-align: center; word-break: break-all;">${p.imageUrl}</span>
                      <span class="badge" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);">
                        ${p.faceBlur === 1 ? html`${ICONS.lock} Rosto com Blur` : html`${ICONS.unlock} Rosto Revelado`}
                      </span>
                    </div>
                    <div style="padding: 0.85rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 0.9rem;">@${p.userId}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Expira em 24h</span>
                      </div>
                    </div>
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
    "Encontros & Deck de Swipe",
    html`
      <h1>Encontros & Deck de Swipe</h1>
      <p class="lead">
        Perfis ranqueados primeiro pela proximidade física e em seguida pela afinidade de fetiches.
      </p>

      ${params?.match ? html`<div class="alert alert-success"><strong>🎉 MATCH MÚTUO!</strong> ${params.msg || "Vocês se curtiram reciprocamente!"}</div>` : ""}
      ${params?.liked ? html`<div class="alert alert-success">Like registrado com sucesso!</div>` : ""}
      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}

      <div class="card" style="max-width: 460px; margin: 0 auto; text-align: center; padding: 2.5rem 1.75rem; position: relative; overflow: hidden; border-top: 3px solid var(--accent-crimson);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <span class="badge" style="background: rgba(224, 36, 78, 0.15); border-color: rgba(224, 36, 78, 0.3);">
            ${ICONS.sparkles} 85% de Afinidade
          </span>
          <span style="font-size: 0.82rem; color: var(--text-muted);">📍 3.2 km de distância</span>
        </div>

        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #1c2030, #2d314d); margin: 1rem auto; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; border: 2px solid var(--border-subtle); box-shadow: var(--shadow-subtle);">
          👫
        </div>

        <h2 style="font-size: 1.4rem; margin-bottom: 0.4rem;">CasalExploradorSP</h2>
        <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1.25rem;">
          Casal liberal • São Paulo, SP
        </p>

        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; margin-bottom: 1.75rem;">
          <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: var(--border-subtle);">BDSM</span>
          <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: var(--border-subtle);">Voyeur</span>
          <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: var(--border-subtle);">Swing</span>
        </div>

        <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 2rem;">
          <p style="font-size: 0.82rem; color: #e2c058;">
            ✨ <strong>Bucket List em Comum:</strong> Ambos desejam conhecer o <strong>Motel Oasis</strong>.
          </p>
        </div>

        <form method="POST" action="/api/social/swipe" style="display: flex; justify-content: center; gap: 1.25rem;">
          <input type="hidden" name="fromUserId" value="usuario-logado" />
          <input type="hidden" name="toUserId" value="casal-explorador" />
          <input type="hidden" name="category" value="real" />
          <button type="submit" name="action" value="skip" class="btn btn-secondary" style="width: 120px;">
            Pular
          </button>
          <button type="submit" name="action" value="like" class="btn" style="width: 140px;">
            Curtir (Like)
          </button>
        </form>

        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 1.75rem;">
          Cota diária: 30 likes por dia no plano Free.
        </p>
      </div>
    `,
    "/swipe"
  );
}

// 3. Mapa & Radar
export function renderMapPage(spotsList: any[], getHeadcount: (id: string) => number, params?: { error?: string; success?: string }) {
  return renderLayout(
    "Mapa & Radar",
    html`
      <h1>Mapa & Radar de Estabelecimentos</h1>
      <p class="lead">
        Consulte a lotação anônima dos locais curados (Motéis, Clubes de Swing e Bares liberais).
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <div class="card-title" style="margin-bottom: 0.8rem;">Fazer Check-in Anônimo</div>
        <form method="POST" action="/api/radar/checkin" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.75rem; align-items: end;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Estabelecimento</label>
            <select name="spotId">
              ${spotsList.map((s) => html`<option value="${s.id}">${s.name} (${s.category})</option>`)}
            </select>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">TTL Obrigatório</label>
            <select name="ttlHours">
              <option value="1">1 hora</option>
              <option value="2" selected>2 horas</option>
              <option value="3">3 horas</option>
              <option value="4">4 horas (Max)</option>
            </select>
          </div>
          <button type="submit" class="btn" style="height: 42px;">
            Confirmar Check-in
          </button>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Locais Curados & Lotação em Tempo Real</div>
          <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: #10b981; border-color: rgba(16, 185, 129, 0.25);">
            ● Radar Ativo
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem;">
          ${spotsList.map((s) => {
            const count = getHeadcount(s.id);
            return html`
              <div style="padding: 1rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <strong style="font-size: 1rem; color: #ffffff;">${s.name}</strong>
                    ${s.isPartner ? html`<span class="badge" style="background: rgba(212,175,55,0.15); color: #d4af37; border-color: rgba(212,175,55,0.3);">Parceiro Oficial</span>` : ""}
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Categoria: ${s.category.toUpperCase()} • Check-in anônimo</p>
                </div>
                <span class="badge badge-success" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
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
      <p class="lead">
        Economia em circuito fechado (Closed-Loop). Zero Cash-out e Zero P2P.
      </p>

      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card" style="background: linear-gradient(135deg, #161926 0%, #1a1d30 100%); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: var(--radius-md); padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
          <div>
            <span class="badge" style="background: rgba(212, 175, 55, 0.15); color: #d4af37; border-color: rgba(212, 175, 55, 0.3);">
              VIP Token Wallet
            </span>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.75rem;">Saldo Disponível</div>
            <div style="font-size: 3rem; font-weight: 800; color: #ffffff; letter-spacing: -0.04em;">
              ${balance} <span style="font-size: 1.4rem; color: var(--accent-crimson);">Tokens</span>
            </div>
          </div>
          <div style="width: 48px; height: 36px; background: rgba(212, 175, 55, 0.25); border: 1px solid rgba(212, 175, 55, 0.5); border-radius: 6px;"></div>
        </div>

        <form method="POST" action="/carteira/recharge" style="display: flex; gap: 1rem; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
          <input type="hidden" name="tokens" value="100" />
          <button type="submit" class="btn" style="background: linear-gradient(135deg, var(--accent-crimson), #c0133c);">
            Recarregar 100 Tokens
          </button>
          <span style="font-size: 0.82rem; color: var(--text-muted);">Processamento seguro via Mercado Pago</span>
        </form>
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom: 0.75rem;">Regras da Moeda Única</div>
        <ul style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6; padding-left: 1.25rem;">
          <li><strong>Zero Cash-out:</strong> Não são permitidos saques para reais, eliminando regulação bancária pesada.</li>
          <li><strong>Zero P2P:</strong> Usuários não transferem saldo diretamente entre si; moedas são utilizadas para presentes e Match Boost.</li>
          <li><strong>Match Boost:</strong> Compre 1 hora no topo do Deck de Swipe com seus tokens acumulados.</li>
        </ul>
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
      <p class="lead">
        Comunicação 1:1 segura e isolada entre perfis com match mútuo.
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card" style="min-height: 380px; display: flex; flex-direction: column; justify-content: space-between; padding: 1.25rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--bg-surface); display: flex; align-items: center; justify-content: center; font-size: 1rem;">
              👤
            </div>
            <div>
              <strong style="font-size: 0.95rem;">@ParceiroMatch</strong>
              <div style="font-size: 0.75rem; color: #10b981;">● Conectado com segurança</div>
            </div>
          </div>

          <div style="margin: 1.25rem 0; display: flex; flex-direction: column; gap: 0.75rem; max-height: 320px; overflow-y: auto;">
            ${messages.length === 0
              ? html`<p style="color: var(--text-muted); font-size: 0.88rem; text-align: center; padding: 2rem 0;">Nenhuma mensagem nesta conversa ainda. Quebre o gelo com discrição!</p>`
              : messages.map(
                  (m) => html`
                    <div style="padding: 0.65rem 1rem; border-radius: var(--radius-sm); max-width: 75%; ${m.fromUserId === "current-user" ? "background: rgba(224, 36, 78, 0.18); border: 1px solid rgba(224, 36, 78, 0.3); align-self: flex-end;" : "background: var(--bg-surface); border: 1px solid var(--border-subtle); align-self: flex-start;"}">
                      <p style="font-size: 0.9rem;">${m.text}</p>
                    </div>
                  `
                )}
          </div>
        </div>

        <form method="POST" action="/chat/send" style="display: flex; gap: 0.6rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <input type="text" name="text" placeholder="Digite sua mensagem segura..." required />
          <button type="submit" class="btn" style="white-space: nowrap;">
            Enviar
          </button>
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
      <p class="lead">
        Fóruns abertos (perfil principal) e Sub-comunidades anônimas (pseudônimo exclusivo).
      </p>

      ${params?.error ? html`<div class="alert alert-error">${params.error}</div>` : ""}
      ${params?.success ? html`<div class="alert alert-success">${params.success}</div>` : ""}

      <div class="card">
        <div class="card-title" style="margin-bottom: 0.8rem;">Publicar em um Space</div>
        <form method="POST" action="/api/community/spaces/post" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Tipo de Espaço</label>
              <select name="spaceType">
                <option value="forum">Fórum Geral (Aberto — Apelido Público)</option>
                <option value="anonymous_community">Comunidade de Confissões (Anônimo)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Pseudônimo Exclusivo (se anônimo)</label>
              <input type="text" name="communityPseudonym" placeholder="Ex: SombraDaNoite" />
            </div>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Conteúdo da Publicação</label>
            <textarea name="content" rows="3" placeholder="Compartilhe seu relato, experiência ou dúvida..." required></textarea>
          </div>
          <button type="submit" class="btn" style="align-self: flex-start;">
            Publicar no Space
          </button>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Publicações Recentes nos Spaces</div>
          <span class="badge">${posts.length} relatos</span>
        </div>

        ${posts.length === 0
          ? html`<p style="color: var(--text-muted); font-size: 0.88rem; padding: 1rem 0;">Nenhum relato publicado ainda.</p>`
          : html`<div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem;">
              ${posts.map(
                (p) => html`
                  <div style="padding: 1rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                      <strong style="font-size: 0.95rem; color: #ffffff;">${p.authorDisplayed}</strong>
                      <span class="badge" style="${p.spaceType === "anonymous_community" ? "background: rgba(132, 43, 88, 0.15); color: #d946ef; border-color: rgba(132, 43, 88, 0.3);" : ""}">
                        ${p.spaceType === "anonymous_community" ? "🔒 Anônimo" : "🌐 Fórum Aberto"}
                      </span>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">${p.content}</p>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Calculadora</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
            background: #000000;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            user-select: none;
          }
          .calc-shell {
            width: 330px;
            background: #000000;
            padding: 20px;
          }
          .screen {
            font-size: 3.8rem;
            font-weight: 300;
            text-align: right;
            padding: 30px 10px 15px;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            letter-spacing: -0.02em;
          }
          .keypad {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
          button {
            border: none;
            border-radius: 50%;
            height: 68px;
            width: 68px;
            font-size: 1.7rem;
            font-weight: 400;
            cursor: pointer;
            outline: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: filter 0.15s ease;
          }
          button:active { filter: brightness(1.3); }
          .btn-num { background: #333333; color: #ffffff; }
          .btn-top { background: #a5a5a5; color: #000000; font-weight: 500; }
          .btn-op { background: #ff9f0a; color: #ffffff; font-size: 1.9rem; }
          .btn-zero {
            grid-column: span 2;
            width: 148px;
            border-radius: 34px;
            justify-content: flex-start;
            padding-left: 26px;
          }
        </style>
      </head>
      <body>
        <div class="calc-shell">
          <div class="screen" id="disp">0</div>
          <div class="keypad">
            <button class="btn-top" onclick="document.getElementById('disp').innerText='0'">C</button>
            <button class="btn-top" onclick="alert('Função desabilitada')">±</button>
            <button class="btn-top" onclick="alert('Função desabilitada')">%</button>
            <button class="btn-op">÷</button>

            <button class="btn-num" onclick="appendNum('7')">7</button>
            <button class="btn-num" onclick="appendNum('8')">8</button>
            <button class="btn-num" onclick="appendNum('9')">9</button>
            <button class="btn-op">×</button>

            <button class="btn-num" onclick="appendNum('4')">4</button>
            <button class="btn-num" onclick="appendNum('5')">5</button>
            <button class="btn-num" onclick="appendNum('6')">6</button>
            <button class="btn-op">-</button>

            <button class="btn-num" onclick="appendNum('1')">1</button>
            <button class="btn-num" onclick="appendNum('2')">2</button>
            <button class="btn-num" onclick="appendNum('3')">3</button>
            <button class="btn-op">+</button>

            <button class="btn-num btn-zero" onclick="appendNum('0')">0</button>
            <button class="btn-num" onclick="appendNum('.')">.</button>
            <!-- Secret Exit back to Liberages -->
            <button class="btn-op" onclick="location.href='/'">=</button>
          </div>
        </div>
        <script>
          function appendNum(n) {
            const d = document.getElementById('disp');
            if (d.innerText === '0' && n !== '.') {
              d.innerText = n;
            } else {
              d.innerText += n;
            }
          }
        </script>
      </body>
    </html>`;
}
