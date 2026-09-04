# Tasks: Liberages Etapa 1 - MVP Completo com UI
**Contract version:** 3
**Work ID:** 0004

## Execution contract

| Component | Root | Regression | Lint | Build | Security | Dev | Health |
|-----------|------|------------|------|-------|----------|-----|--------|
| `liberages` | `.` | `bun test` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` |

## Global gates
N/A

### [x] [1.1] Onboarding em Camadas (Soft Gate Leitura e Hard Gate Escrita)

**Requirement:** FR-001
**Depends on:** 0001/1.1
**Behavior:** Usuários com auto-declaração 18+ recebem permissão de somente leitura; envio de documento gera hash anônimo e libera permissão de escrita.
**Components:** `liberages`
**Files:** `src/onboarding.ts`, `tests/onboarding.test.ts`
**Implementation files:** `src/onboarding.ts`
**Test files:** `tests/onboarding.test.ts`

**RED:**
- `bun test tests/onboarding.test.ts` — fails asserting that soft gate permits read and denies write while hard gate permits write, exit code 1.

**Implementation:**
1. Criar middleware de permissões de gate (`soft_read` vs `hard_write`) em `src/onboarding.ts`.
2. Implementar endpoint de verificação de idade gerando hash e descartando documento original.

**ACs:**
- [x] `bun test tests/onboarding.test.ts` — validates gate transitions successfully with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.2] Contas de Casal Unificadas (Couple Account Type)

**Requirement:** FR-002
**Depends on:** 1.1
**Behavior:** Contas do tipo `couple` operam sob um login e perfil único, agindo de forma indissociável na plataforma.
**Components:** `liberages`
**Files:** `src/accounts.ts`, `tests/accounts.test.ts`
**Implementation files:** `src/accounts.ts`
**Test files:** `tests/accounts.test.ts`

**RED:**
- `bun test tests/accounts.test.ts` — fails asserting that a couple account has a single unified profile entity, exit code 1.

**Implementation:**
1. Estruturar modelo e regras de conta `couple` em `src/accounts.ts`.

**ACs:**
- [x] `bun test tests/accounts.test.ts` — executes account type assertions with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.3] Catálogo de Locais e Check-in com TTL Obrigatório

**Requirement:** FR-003
**Depends on:** 1.1
**Behavior:** Permite check-in em estabelecimentos fixos com TTL definido entre 1h e 4h.
**Components:** `liberages`
**Files:** `src/radar.ts`, `tests/radar_checkin.test.ts`
**Implementation files:** `src/radar.ts`
**Test files:** `tests/radar_checkin.test.ts`

**RED:**
- `bun test tests/radar_checkin.test.ts` — fails asserting check-in creation with valid TTL between 1h and 4h, exit code 1.

**Implementation:**
1. Criar repositório em memória e endpoints de check-in com validação de TTL em `src/radar.ts`.

**ACs:**
- [x] `bun test tests/radar_checkin.test.ts` — records check-in with enforced TTL with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.4] Radar Anônimo por Localidade

**Requirement:** FR-004
**Depends on:** 1.3
**Behavior:** Consulta ao radar retorna somente a contagem numérica de frequentadores por local, sem expor identidades ou posições de usuários.
**Components:** `liberages`
**Files:** `src/radar.ts`, `tests/radar_anonymous.test.ts`
**Implementation files:** `src/radar.ts`
**Test files:** `tests/radar_anonymous.test.ts`

**RED:**
- `bun test tests/radar_anonymous.test.ts` — fails asserting radar output returns count without personal identifiers, exit code 1.

**Implementation:**
1. Implementar agregação anônima no handler do radar em `src/radar.ts`.

**ACs:**
- [x] `bun test tests/radar_anonymous.test.ts` — verifies aggregated count without identities with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.5] Expiração Automática de Check-in por TTL no Radar

**Requirement:** EC-001
**Depends on:** 1.4
**Behavior:** Check-ins com TTL expirado são automaticamente excluídos da contagem de pessoas presentes no radar.
**Components:** `liberages`
**Files:** `src/radar.ts`, `tests/radar_ttl.test.ts`
**Implementation files:** `src/radar.ts`
**Test files:** `tests/radar_ttl.test.ts`

**RED:**
- `bun test tests/radar_ttl.test.ts` — fails asserting that expired check-ins decrement from the count, exit code 1.

**Implementation:**
1. Filtrar registros com `expiresAt <= now` nas consultas do radar em `src/radar.ts`.

**ACs:**
- [x] `bun test tests/radar_ttl.test.ts` — verifies expired records drop from count with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.6] Fotolog com Expiração de 24h e Blur Facial

**Requirement:** FR-005
**Depends on:** 1.1
**Behavior:** Publicação de 1 foto diária com decaimento após 24h e aplicação de flag de desfoque facial por padrão.
**Components:** `liberages`
**Files:** `src/fotolog.ts`, `tests/fotolog.test.ts`
**Implementation files:** `src/fotolog.ts`
**Test files:** `tests/fotolog.test.ts`

**RED:**
- `bun test tests/fotolog.test.ts` — fails asserting 24h expiration and default facial blur, exit code 1.

**Implementation:**
1. Implementar módulo do Fotolog com TTL de 24h e regra de blur facial padrão em `src/fotolog.ts`.

**ACs:**
- [x] `bun test tests/fotolog.test.ts` — verifies Fotolog lifecycle and blur flag with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.7] Deck de Swipe por Geodistância e Fetiches

**Requirement:** FR-006
**Depends on:** 1.2
**Behavior:** Deck de perfis ordenado primariamente pela distância geográfica e secundariamente pela porcentagem de interseção de fetiches.
**Components:** `liberages`
**Files:** `src/matching.ts`, `tests/matching_deck.test.ts`
**Implementation files:** `src/matching.ts`
**Test files:** `tests/matching_deck.test.ts`

**RED:**
- `bun test tests/matching_deck.test.ts` — fails asserting deck sorting orders by distance first and fetish match second, exit code 1.

**Implementation:**
1. Implementar algoritmo de ranking do deck em `src/matching.ts`.

**ACs:**
- [x] `bun test tests/matching_deck.test.ts` — returns correctly ordered swipe candidates with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.8] Cota de 30 Likes no Free e Geração de Amizade Mútua

**Requirement:** FR-007
**Depends on:** 1.7
**Behavior:** Usuários Free recebem limite diário de 30 likes; match mútuo gera amizade categorizada em `real` ou `virtual`.
**Components:** `liberages`
**Files:** `src/matching.ts`, `tests/matching_likes.test.ts`
**Implementation files:** `src/matching.ts`
**Test files:** `tests/matching_likes.test.ts`

**RED:**
- `bun test tests/matching_likes.test.ts` — fails asserting friendship generation on mutual like, exit code 1.

**Implementation:**
1. Implementar registro de likes e criação de amizade pós-match em `src/matching.ts`.

**ACs:**
- [x] `bun test tests/matching_likes.test.ts` — verifies mutual match friendship generation with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.9] Bloqueio ao Atingir Cota Diária de 30 Likes no Free

**Requirement:** SC-001
**Depends on:** 1.8
**Behavior:** Bloqueia likes subsequentes no mesmo dia quando a cota de 30 likes para conta Free é esgotada.
**Components:** `liberages`
**Files:** `src/matching.ts`, `tests/matching_quota.test.ts`
**Implementation files:** `src/matching.ts`
**Test files:** `tests/matching_quota.test.ts`

**RED:**
- `bun test tests/matching_quota.test.ts` — fails asserting that the 31st like is blocked for free tier, exit code 1.

**Implementation:**
1. Adicionar validador de cota diária de likes no processador de swipe em `src/matching.ts`.

**ACs:**
- [x] `bun test tests/matching_quota.test.ts` — verifies 31st like rejection with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.10] Sugestão de Date via Bucket List

**Requirement:** FR-008
**Depends on:** 1.8
**Behavior:** Quando dois perfis dão match e compartilham o mesmo local na Bucket List, o sistema sugere automaticamente o date.
**Components:** `liberages`
**Files:** `src/bucket_list.ts`, `tests/bucket_list.test.ts`
**Implementation files:** `src/bucket_list.ts`
**Test files:** `tests/bucket_list.test.ts`

**RED:**
- `bun test tests/bucket_list.test.ts` — fails asserting common spot detection from bucket lists upon match, exit code 1.

**Implementation:**
1. Criar comparador de Bucket List e gerador de sugestão de date em `src/bucket_list.ts`.

**ACs:**
- [x] `bun test tests/bucket_list.test.ts` — verifies icebreaker date suggestion with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.11] Token Wallet Fechada (Closed-Loop)

**Requirement:** FR-009
**Depends on:** 1.1
**Behavior:** Carteira de moedas com ledger transacional, recargas via Mercado Pago e bloqueio explícito de cash-out e transferências diretas P2P.
**Components:** `liberages`
**Files:** `src/wallet.ts`, `tests/wallet.test.ts`
**Implementation files:** `src/wallet.ts`
**Test files:** `tests/wallet.test.ts`

**RED:**
- `bun test tests/wallet.test.ts` — fails asserting wallet credits and rejection of cash-out/P2P transfers, exit code 1.

**Implementation:**
1. Implementar ledger de Token Wallet com regras de bloqueio de saída fiat em `src/wallet.ts`.

**ACs:**
- [x] `bun test tests/wallet.test.ts` — verifies credit and disallowed operations with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.12] Telas SSR do MVP em pt-BR via Hono JSX

**Requirement:** FR-010
**Depends on:** 1.1
**Behavior:** Interface do usuário com templates SSR em pt-BR cobrindo Feed, Swipe, Mapa e Carteira.
**Components:** `liberages`
**Files:** `src/views.ts`, `tests/views.test.ts`
**Implementation files:** `src/views.ts`
**Test files:** `tests/views.test.ts`

**RED:**
- `bun test tests/views.test.ts` — fails asserting that SSR views render Feed, Swipe, Mapa and Carteira in pt-BR, exit code 1.

**Implementation:**
1. Implementar templates de visualização SSR em `src/views.ts` integrando as rotas da interface.

**ACs:**
- [ ] `bun test tests/views.test.ts` — confirms all MVP pages render with HTTP 200 in pt-BR with exit code 0.

**Visual:** N/A

**Documentation:** N/A
