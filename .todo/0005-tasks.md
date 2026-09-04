# Tasks: Liberages Etapa 2 - Pós-MVP Features Adicionais
**Contract version:** 3
**Work ID:** 0005

## Execution contract

| Component | Root | Regression | Lint | Build | Security | Dev | Health |
|-----------|------|------------|------|-------|----------|-----|--------|
| `liberages` | `.` | `bun test` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` |

## Global gates
N/A

### [x] [1.1] Chat DM Privado em Tempo Real

**Requirement:** FR-001
**Depends on:** 0004/1.8
**Behavior:** Permite envio e recebimento de mensagens privadas em tempo real exclusivamente entre usuários com amizade mútua.
**Components:** `liberages`
**Files:** `src/chat.ts`, `tests/chat.test.ts`
**Implementation files:** `src/chat.ts`
**Test files:** `tests/chat.test.ts`

**RED:**
- `bun test tests/chat.test.ts` — fails asserting private message delivery between matched friends, exit code 1.

**Implementation:**
1. Implementar canal de mensageria em `src/chat.ts` com validação de match mútuo.

**ACs:**
- [x] `bun test tests/chat.test.ts` — verifies message exchange between matched users with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.2] Entrega Privada e Isolamento de Mensagens

**Requirement:** SC-001
**Depends on:** 1.1
**Behavior:** Mensagens trocadas no Chat DM não podem ser lidas por usuários terceiros fora da conversa.
**Components:** `liberages`
**Files:** `src/chat.ts`, `tests/chat_privacy.test.ts`
**Implementation files:** `src/chat.ts`
**Test files:** `tests/chat_privacy.test.ts`

**RED:**
- `bun test tests/chat_privacy.test.ts` — fails asserting rejection of unauthorized message reading, exit code 1.

**Implementation:**
1. Adicionar restrição rigorosa de autorização por participante na leitura de conversas em `src/chat.ts`.

**ACs:**
- [x] `bun test tests/chat_privacy.test.ts` — rejects third-party access with HTTP 403 and exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.3] Marca d'Água Dinâmica com Hash do Visualizador

**Requirement:** FR-002
**Depends on:** 0004/1.6
**Behavior:** Injeta metadados / marca d'água invisível contendo o hash do ID do usuário visualizador em imagens renderizadas.
**Components:** `liberages`
**Files:** `src/security.ts`, `tests/security_watermark.test.ts`
**Implementation files:** `src/security.ts`
**Test files:** `tests/security_watermark.test.ts`

**RED:**
- `bun test tests/security_watermark.test.ts` — fails asserting viewer hash watermark injection on media responses, exit code 1.

**Implementation:**
1. Criar middleware de injeção de watermark com hash do usuário em `src/security.ts`.

**ACs:**
- [x] `bun test tests/security_watermark.test.ts` — confirms watermark metadata presence with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.4] Modos de Ocultação: Modo Falso e Modo Ghost com Timer

**Requirement:** FR-003
**Depends on:** 0004/1.4
**Behavior:** Modo Falso provê tela imediata de disfarce; Modo Ghost oculta o perfil do radar e buscas durante o tempo programado.
**Components:** `liberages`
**Files:** `src/security.ts`, `tests/security_modes.test.ts`
**Implementation files:** `src/security.ts`
**Test files:** `tests/security_modes.test.ts`

**RED:**
- `bun test tests/security_modes.test.ts` — fails asserting fake mode redirect and ghost mode map invisibility, exit code 1.

**Implementation:**
1. Implementar endpoints de pânico e ativação de Ghost mode com timer em `src/security.ts`.

**ACs:**
- [x] `bun test tests/security_modes.test.ts` — verifies panic disguise and ghost state with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.5] Restauração Automática de Visibilidade Pós-Timer Ghost

**Requirement:** EC-001
**Depends on:** 1.4
**Behavior:** Ao expirar o temporizador do Modo Ghost, o status de visibilidade do usuário é revertido automaticamente para o padrão.
**Components:** `liberages`
**Files:** `src/security.ts`, `tests/security_ghost_ttl.test.ts`
**Implementation files:** `src/security.ts`
**Test files:** `tests/security_ghost_ttl.test.ts`

**RED:**
- `bun test tests/security_ghost_ttl.test.ts` — fails asserting visibility restoration after ghost expiration, exit code 1.

**Implementation:**
1. Adicionar checagem de decaimento do timer Ghost nas consultas de presença em `src/security.ts`.

**ACs:**
- [ ] `bun test tests/security_ghost_ttl.test.ts` — confirms visibility restores to normal after timer with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.6] Spaces de Comunidade: Fóruns e Sub-comunidades Anônimas

**Requirement:** FR-004
**Depends on:** 0004/1.2
**Behavior:** Provê espaços de discussão permitindo postagens sob o perfil principal em fóruns e sob pseudônimo exclusivo em comunidades anônimas.
**Components:** `liberages`
**Files:** `src/spaces.ts`, `tests/spaces.test.ts`
**Implementation files:** `src/spaces.ts`
**Test files:** `tests/spaces.test.ts`

**RED:**
- `bun test tests/spaces.test.ts` — fails asserting forum post under main profile and anonymous community post under pseudonym, exit code 1.

**Implementation:**
1. Implementar estrutura unificada de Spaces em `src/spaces.ts`.

**ACs:**
- [ ] `bun test tests/spaces.test.ts` — verifies public and anonymous posts with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.7] Governança Comunitária: Júri Popular de Anjos

**Requirement:** FR-005
**Depends on:** 1.6
**Behavior:** Permite votação e resolução de disputas comunitárias exclusivamente para membros com selo de Anjo da Comunidade.
**Components:** `liberages`
**Files:** `src/governance.ts`, `tests/governance_jury.test.ts`
**Implementation files:** `src/governance.ts`
**Test files:** `tests/governance_jury.test.ts`

**RED:**
- `bun test tests/governance_jury.test.ts` — fails asserting that non-Angels are rejected from jury voting, exit code 1.

**Implementation:**
1. Implementar sistema de votação de disputas com trava de autorização para Anjos em `src/governance.ts`.

**ACs:**
- [ ] `bun test tests/governance_jury.test.ts` — allows Angel votes and blocks regular user votes with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.8] Web of Trust: Selo Verificado por 4 Amigos Reais

**Requirement:** FR-006
**Depends on:** 0004/1.8
**Behavior:** Concede selo azul de verificação social automaticamente assim que 4 amigos presenciais (`real`) confirmam atestado físico.
**Components:** `liberages`
**Files:** `src/governance.ts`, `tests/governance_wot.test.ts`
**Implementation files:** `src/governance.ts`
**Test files:** `tests/governance_wot.test.ts`

**RED:**
- `bun test tests/governance_wot.test.ts` — fails asserting verified badge grant upon 4 physical friendship attestations, exit code 1.

**Implementation:**
1. Implementar cálculo de confiança Web of Trust em `src/governance.ts`.

**ACs:**
- [ ] `bun test tests/governance_wot.test.ts` — verifies blue badge grant threshold with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.9] Caça ao Tesouro B2B Geolocalizada

**Requirement:** FR-007
**Depends on:** 0004/1.11
**Behavior:** Usuários coletam pontos de tesouro escondidos em estabelecimentos parceiros no mapa, recebendo moedas ou cupons de desconto.
**Components:** `liberages`
**Files:** `src/b2b.ts`, `tests/b2b_treasure.test.ts`
**Implementation files:** `src/b2b.ts`
**Test files:** `tests/b2b_treasure.test.ts`

**RED:**
- `bun test tests/b2b_treasure.test.ts` — fails asserting treasure discovery and token/coupon reward credit, exit code 1.

**Implementation:**
1. Implementar mecânica de resgate de caça ao tesouro integrada à Token Wallet em `src/b2b.ts`.

**ACs:**
- [ ] `bun test tests/b2b_treasure.test.ts` — verifies treasure claim and wallet balance update with exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [ ] [1.10] Contos Eróticos e Álbuns Expandidos

**Requirement:** FR-008
**Depends on:** 0004/1.2
**Behavior:** Permite leitura pública de contos e publicação irrestrita para assinantes Premium ou usuários com badge de alto XP.
**Components:** `liberages`
**Files:** `src/stories.ts`, `tests/stories.test.ts`
**Implementation files:** `src/stories.ts`
**Test files:** `tests/stories.test.ts`

**RED:**
- `bun test tests/stories.test.ts` — fails asserting read-only for free users and publishing permission for Premium/high-XP users, exit code 1.

**Implementation:**
1. Implementar catálogo de contos e regras de permissão de publicação em `src/stories.ts`.

**ACs:**
- [ ] `bun test tests/stories.test.ts` — verifies publishing privileges for Premium users with exit code 0.

**Visual:** N/A

**Documentation:** N/A
