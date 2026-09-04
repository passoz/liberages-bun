# Tasks: Pós-MVP Liberages - Retenção e Segurança de Ocultação
**Contract version:** 3
**Work ID:** 0003

## Execution contract

| Component | Root | Regression | Lint | Build | Security | Dev | Health |
|-----------|------|------------|------|-------|----------|-----|--------|
| `liberages` | `.` | `bun test` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` |

## Global gates
N/A

### [x] [1.1] Mecanismo de Mídia Efêmera e Selfie Destrutível

**Requirement:** FR-001
**Depends on:** 0001/1.1
**Behavior:** Uma mídia registrada com expiração de visualização única é servida no primeiro acesso e subsequentemente retorna HTTP 410 Gone.
**Components:** `liberages`
**Files:** `src/media.ts`, `tests/media.test.ts`
**Implementation files:** `src/media.ts`
**Test files:** `tests/media.test.ts`

**RED:**
- `bun test tests/media.test.ts` — fails asserting that a second GET request to an ephemeral media returns 410 Gone, exit code 1.

**Implementation:**
1. Instanciar registro de mídia efêmera com TTL de 1 visualização em `src/media.ts`.
2. Servir rota GET `/api/media/:id` que invalida o recurso após o primeiro consumo e retorna 410 nos acessos seguintes.

**ACs:**
- [x] `bun test tests/media.test.ts` — returns HTTP 200 on first access and HTTP 410 on subsequent request, exit code 0.

**Visual:** N/A

**Documentation:** N/A

### [x] [1.2] Expiração Imediata em Tentativa de Acesso Concorrente

**Requirement:** EC-001
**Depends on:** 1.1
**Behavior:** Tentativas simultâneas ou de recarregamento rápido não contornam o limite de 1 visualização, garantindo que apenas uma requisição obtenha o conteúdo.
**Components:** `liberages`
**Files:** `src/media.ts`, `tests/concurrency.test.ts`
**Implementation files:** `src/media.ts`
**Test files:** `tests/concurrency.test.ts`

**RED:**
- `bun test tests/concurrency.test.ts` — fails asserting that concurrent access permits exactly one successful consumption, exit code 1.

**Implementation:**
1. Adicionar trava atômica de consumo na consulta de visualização de mídia efêmera.

**ACs:**
- [x] `bun test tests/concurrency.test.ts` — enforces single view consumption under concurrent requests with exit code 0.

**Visual:** N/A

**Documentation:** N/A
