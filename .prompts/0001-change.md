# PROMPT: Fundação e MVP do UI Liberages

**Status:** Pronto para planejamento
**Work ID:** 0001
**System spec:** `.specs/system.md`
**Baseline:** versão 1
**Origem:** `.sources/0001-local.md`

## Delta da system spec

- **Capacidades afetadas:** `CAP-001`, `CAP-002`, `CAP-004`.
- **Regras preservadas:** `BR-001`, `BR-002`, `BR-003`, `BR-005`.
- **Regras alteradas:** nenhuma.
- **Contratos afetados:** `CON-001`, `CON-002`.
- **Qualidades, entidades e integrações relacionadas:** `ENT-001`, `ENT-002`, `SQR-001`.
- **Gaps tocados:** nenhum.
- **Reconciliação esperada após implementação:** Nenhuma reconciliação normativa pendente; código passará a refletir capacidades do MVP delineadas pela baseline validada.

## Problema e resultado

**Problema:** O repositório está sem o arcabouço primário (Bun, Drizzle, Hono) exigido; inoperante em autenticação, recomendação de swipes e monetização inicial, impossibilitando qualquer acesso à plataforma.

**Resultado esperado:** Monolito rodando, operando a base PWA renderizada no servidor para usuários navegarem por locais, processarem perfis no Deck via fetiches/raio geográfico, e realizarem cadastro e login pelo PIN-first, gerando economia closed-loop nas tags básicas.

## Contexto confirmado

- `.specs/system.md`: system spec governante apontando escopo da fundação.
- `.spec.md` (legacy port): confirmando limitações MVP (ausência de fóruns/b2b pesado).

## Atores e valor

- **ACT-001:** Ganha acesso basal via UI responsivo à rede, efetuando likes e acompanhando anonimamente áreas de interesse B2B.

## Escopo

### Inclui

- Inicialização do Monolito Bun (`package.json`, `drizzle.config.ts`, `bun.sqlite`).
- Servidor web Hono com templates JSX integrados e i18n para pt-br.
- Entidades de Domínio estruturadas (Auth PIN, Users/Profiles com UUIDv7, Spot/Check-ins e TokenWallet).
- UX fundamental de Match e Feed Social minimalista.

### Não inclui

- Chat em tempo real e Selfies destrutíveis do chat.
- Júri Popular e Moderção B2B de Eventos via Dashboard.
- Álbuns permanentes Premium limitados.

## Cenários de usuário

### US-001 — Onboarding PIN First (P1)

**Ator:** `ACT-001`.

**Valor independente:** Conecta o usuário de forma anônima e ágil após validação inicial.

**Verificação independente:** Criação ou leitura de pin e atribuição de entidade Conta (User).

**Cenários de aceitação:**

1. **Given** visita o app deslogado, **When** envia um PIN de acesso recém cadastrado após soft gate, **Then** assume cookie JWT ativo de sessão no Hono. (FR-001)

## Contrato observável

- **Entradas:** Comandos HTTP JSX e webhooks MP.
- **Saídas e efeitos:** O sistema retorna HTML nativo responsivo aos requesters e altera tags de state no SQLite.
- **Erros:** Negativa de login PIN 401; Falha interna no DB segura 500 sem vazar dados.

## Requisitos

### Funcionais

- **FR-001:** O sistema injeta rota HTML em Bun via Hono assegurada por middleware de JWT cookie emitido em SignIn de 4 dígitos (PIN).

### Qualidade e restrições

- **QR-001:** Interceptar `SIGTERM` permitindo fallback log em menos de 10s.

## Casos de borda

- **EC-001:** Tentativa repetida de envio de PIN errado bloqueia sessão com throttle (FR-001).

## Critérios de sucesso

- **SC-001:** Acesso via navegador com sessão confirmada visualmente via Home Dashboard SSR. (FR-001)

## Premissas

- Nenhuma premissa material não documentada, todo frontend é resolvido nos responses Hono `html/template` sem re-hidratação pesada SPA.

## Componentes afetados

- `package.json`, `drizzle.config.ts` — Scaffold
- `db/` — Database migrations e schemas
- `app/`, `cmd/`, `internal/web/`, `business/` — Roteamento Hono, adaptação limpa de portas

## Rastreabilidade

| Requisito | Cobertura | Evidência esperada |
|-----------|-----------|--------------------|
| `FR-001` | `US-001`, `SC-001` | Arquivos gerados nas pastas web provando emissão funcional com Bun Run. |
| `QR-001` | `US-001` | Teste de graceful shutdown injetando SIGTERM real no teste e-2-e. |
