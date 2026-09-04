# Tasks: Fundação e MVP do UI Liberages
**Contract version:** 3
**Work ID:** 0001

## Execution contract

| Component | Root | Regression | Lint | Build | Security | Dev | Health |
|-----------|------|------------|------|-------|----------|-----|--------|
| `liberages` | `.` | `bun test` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` |

## Global gates
N/A

### [ ] [1.1] Rota de Login e Throttle PIN Base via Hono

**Requirement:** FR-001
**Depends on:** none
**Behavior:** Injeção de autenticação via middleware JWT e Rota HTML PIN em Bun via Hono.
**Components:** `liberages`
**Files:** `src/auth.ts`, `tests/auth.test.ts`
**Implementation files:** `src/auth.ts`
**Test files:** `tests/auth.test.ts`

**RED:**
- `bun test tests/auth.test.ts` — fails asserting that POST /api/login/pin returns 200 and issues a JWT cookie, exit code 1.

**Implementation:**
1. Criar `package.json` base com `hono`.
2. Adicionar Endpoint de PIN Hono com setup de JWT issue (hono/jwt) e setup middleware cookie response.

**ACs:**
- [ ] `bun test tests/auth.test.ts` — executes endpoints successfully and returns exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.2] Acesso Confirmado Visualmente via Home Dashboard SSR

**Requirement:** SC-001
**Depends on:** 1.1
**Behavior:** O sistema provê acesso via navegação visual SSR PWA via rotas base para sessões logadas pelo cookie e conecta banco SQLite `uuidv7` token.
**Components:** `liberages`
**Files:** `src/index.ts`, `db/schema.ts`, `tests/ssr.test.ts`
**Implementation files:** `src/index.ts`, `db/schema.ts`
**Test files:** `tests/ssr.test.ts`

**RED:**
- `bun test tests/ssr.test.ts` — fails asserting that GET / renders the user dashboard authenticated string, exit code 1.

**Implementation:**
1. Instanciar banco SQLite local criando schema de UUID pra UUIDv7.
2. Servir Rota html base dependente de autenticação.

**ACs:**
- [ ] `bun test tests/ssr.test.ts` — returns rendered HTML with HTTP 200 and exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.3] Proteção de Tentativas em Login (Throttle)

**Requirement:** EC-001
**Depends on:** 1.1
**Behavior:** O sistema conta as recusas e barra conexões agressivas de força bruta sob a mesma interface PIN.
**Components:** `liberages`
**Files:** `src/throttle.ts`, `tests/throttle.test.ts`
**Implementation files:** `src/throttle.ts`
**Test files:** `tests/throttle.test.ts`

**RED:**
- `bun test tests/throttle.test.ts` — fails asserting that a 6th consecutive login attempt returns HTTP 429, exit code 1.

**Implementation:**
1. Instanciar block na rota Auth que impõe max tries, cacheando em memória IP/session limit.

**ACs:**
- [ ] `bun test tests/throttle.test.ts` — returns HTTP 429 after threshold checks, exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.4] Encerramento Graceful com Tempo Limite (SIGTERM)

**Requirement:** QR-001
**Depends on:** 1.1
**Behavior:** O servidor desliga conexões HTTP e loga o encerramento validando grace time 10s.
**Components:** `liberages`
**Files:** `src/server.ts`, `tests/graceful.test.ts`
**Implementation files:** `src/server.ts`
**Test files:** `tests/graceful.test.ts`

**RED:**
- `bun test tests/graceful.test.ts` — fails asserting that graceful shutdown executes within 10s, exit code 1.

**Implementation:**
1. Ouvinte `process.on('SIGTERM')` injeta uma Promise hook encarregada de fechar os sockets db/web em timeout 10s.

**ACs:**
- [ ] `bun test tests/graceful.test.ts` — exits safely passing grace shutdown assertions, exit code 0.

**Visual:** N/A

**Documentation:** N/A
