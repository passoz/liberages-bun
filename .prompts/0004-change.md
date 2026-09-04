# PROMPT: Liberages Etapa 1 - MVP Completo com UI

**Status:** Pronto para planejamento
**Work ID:** 0004
**System spec:** `.specs/system.md`
**Baseline:** versão 1
**Origem:** `.sources/0004-local.md`

## Delta da system spec

- **Capacidades afetadas:** `CAP-001`, `CAP-002`, `CAP-003`, `CAP-004`.
- **Regras preservadas:** `BR-001`, `BR-002`, `BR-003`, `BR-004`, `BR-005`.
- **Regras alteradas:** nenhuma.
- **Contratos afetados:** `CON-001`, `CON-002`.
- **Qualidades, entidades e integrações relacionadas:** `ENT-001`, `ENT-002`, `SQR-001`.
- **Gaps tocados:** nenhum.
- **Reconciliação esperada após implementação:** Toda a suíte de funcionalidades da Fase 1 do MVP (onboarding em camadas, swipe/fetiches, mapa/checkin com TTL, fotolog 24h e token wallet) estará operacional e verificada.

## Problema e resultado

**Problema:** O MVP atual possui apenas a fundação técnica básica, faltando as regras de negócio centrais da spec: onboarding em camadas, contas de casal unificadas, catálogo de locais com check-in anônimo temporizado, deck de swipe com compatibilidade de fetiches, fotolog de 24h e economia fechada via Token Wallet.

**Resultado esperado:** Usuários navegam pela UI em pt-BR, realizam onboarding com verificação, exploram o mapa com radar anônimo por local, interagem com o Fotolog diário, utilizam o deck de swipe com cálculo de afinidade e cota diária, e gerenciam saldo de moedas na carteira fechada.

## Contexto confirmado

- `.specs/system.md`: especificação governante definindo CAP-001 a CAP-004 e regras BR-001 a BR-005.
- `SPEC.md`: master specification aprovada detalhando todas as 53 decisões estratégicas consolidadas.

## Atores e valor

- **ACT-001 (Solteiros e Casais):** Utilizam a rede social liberal com pseudônimos, participam do swipe por afinidade de fetiches e encontram locais sem expor sua localização em tempo real.
- **ACT-003 (Mercado Pago):** Processa pagamentos de recarga de moedas na carteira virtual.

## Escopo

### Inclui

- Soft Gate (cookie 18+) e Hard Gate (hash de documento descartado).
- Contas `single` e `couple` (login e perfil unificado para o casal).
- Catálogo de locais no mapa com check-in dinâmico por TTL (1h a 4h).
- Radar estritamente anônimo com contagem agregada de frequentadores por local.
- Fotolog social com foto diária de 24h, blur facial padrão e opt-out.
- Deck de swipe ordenado por geodistância e % de interseção de fetiches curados.
- Cota de 30 likes/dia para contas Free e geração de amizade (`real`/`virtual`).
- Bucket List sugerindo encontros em locais de interesse comum.
- Token Wallet (Closed-Loop) em SQLite com recarga e bloqueio de cash-out/P2P.
- Telas completas em SSR via Hono JSX e i18n em pt-BR.

### Não inclui

- Chat E2E e mensagens criptografadas (Fase 2).
- Júri Popular e Tribunal de Anjos da comunidade (Fase 2).
- Modo Falso e Modo Ghost com temporizador (Fase 2).
- Spaces com subfóruns anônimos (Fase 2).

## Cenários de usuário

### US-001 — Onboarding em Camadas e Contas de Casal (P1)

**Ator:** `ACT-001`.

**Valor independente:** Permite acesso progressivo à plataforma preservando anonimato real.

**Verificação independente:** Acesso de leitura com cookie 18+ e desbloqueio de escrita após envio de hash de documento.

**Cenários de aceitação:**

1. **Given** visitante sem cadastro, **When** aceita a auto-declaração de 18+, **Then** recebe cookie de soft gate permitindo apenas leitura do feed. (FR-001)
2. **Given** usuário com soft gate, **When** envia verificação de idade, **Then** sistema gera hash anônimo, descarta o documento e concede permissão de escrita. (FR-001)
3. **Given** casal cadastrado como `couple`, **When** realizam login e swipe, **Then** a plataforma os trata como uma única entidade com perfil unificado. (FR-002)

### US-002 — Catálogo de Locais, Check-in com TTL e Radar Anônimo (P1)

**Ator:** `ACT-001`.

**Valor independente:** Permite descobrir estabelecimentos movimentados sem expor paradeiro individual.

**Verificação independente:** O radar exibe a contagem agregada de frequentadores sem listar quem são.

**Cenários de aceitação:**

1. **Given** usuário em um local do catálogo, **When** faz check-in informando TTL de 2 horas, **Then** a contagem do radar incrementa e o registro expira após o TTL. (FR-003, EC-001)
2. **Given** usuário consultando o mapa, **When** visualiza um local com check-ins ativos, **Then** recebe apenas a quantidade total de pessoas presentes sem dados individuais. (FR-004)

### US-003 — Fotolog de 24h e Feed Social (P1)

**Ator:** `ACT-001`.

**Valor independente:** Compartilhamento visual diário com privacidade nativa.

**Verificação independente:** Foto desaparece do feed após 24h e aplica blur facial por padrão.

**Cenários de aceitação:**

1. **Given** usuário logado, **When** publica foto no Fotolog sem desativar blur, **Then** a imagem é salva com desfoque facial por padrão e expira em 24h. (FR-005)

### US-004 — Swipe por Fetiches, Cota de Likes e Bucket List (P1)

**Ator:** `ACT-001`.

**Valor independente:** Matching direcionado por compatibilidade de interesses liberais.

**Verificação independente:** Deck ordenado por proximidade física e interseção de fetiches, bloqueando após 30 likes diários no Free.

**Cenários de aceitação:**

1. **Given** deck de swipe, **When** usuário consome 30 likes no plano Free, **Then** o sistema bloqueia novos likes no dia com aviso de cota. (FR-006, FR-007, SC-001)
2. **Given** dois perfis que deram match mútuo com mesmo local na Bucket List, **Then** o sistema sugere um date automático naquele local. (FR-008)

### US-005 — Economia Closed-Loop (Token Wallet) (P1)

**Ator:** `ACT-001`.

**Valor independente:** Moeda interna para consumo de impulsos e vantagens sem risco de regulação bancária.

**Verificação independente:** Carteira registra saldo, recargas e queima de moedas, rejeitando cash-out e transferências entre usuários.

**Cenários de aceitação:**

1. **Given** carteira do usuário, **When** recebe recarga de moedas, **Then** o saldo é creditado no ledger SQLite e transferências P2P diretas são proibidas. (FR-009)

## Contrato observável

- **Entradas:** Formulários HTML e requisições HTTP REST enviadas ao Hono.
- **Saídas e efeitos:** Páginas HTML renderizadas em pt-BR via JSX com navegação de Deck, Mapa, Feed e Carteira.
- **Erros:** HTTP 403 para ações de escrita sob soft gate; HTTP 429 para cota diária de likes atingida; HTTP 400 para tentativas de cash-out/P2P.

## Requisitos

### Funcionais

- **FR-001:** O sistema deve fornecer Soft Gate (cookie 18+ para leitura) e Hard Gate (hash de verificação de idade para escrita, com descarte de imagem original).
- **FR-002:** O sistema deve suportar tipo de conta `couple` como entidade indivisível com único login e perfil compartilhado.
- **FR-003:** O sistema deve permitir check-in em locais com TTL obrigatório entre 1h e 4h, expirando automaticamente do mapa.
- **FR-004:** O radar do mapa deve retornar exclusivamente a contagem agregada de frequentadores por local, sem expor identidades ou GPS em tempo real.
- **FR-005:** O Fotolog deve aceitar 1 foto diária com expiração estrita de 24h e aplicar blur facial por padrão.
- **FR-006:** O deck de swipe deve ordenar perfis primeiro por raio de distância física e depois por percentual de fetiches em comum.
- **FR-007:** O sistema deve impor cota diária de 30 likes para contas Free e gerar amizades categorizadas (`real` ou `virtual`) em match mútuo.
- **FR-008:** O sistema deve cruzar as listas de desejos (Bucket List) de perfis com match mútuo para sugerir dates automáticos.
- **FR-009:** A Token Wallet deve manter saldo em SQLite sem permitir cash-out e sem permitir transferências diretas P2P.
- **FR-010:** A interface deve fornecer navegação SSR completa em pt-BR via Hono JSX para Feed, Swipe, Mapa e Carteira.

### Qualidade e restrições

- Restrições arquiteturais da baseline: Bun + Hono + Drizzle + SQLite mantidos.

## Casos de borda

- **EC-001:** Check-in cujo TTL expirou é automaticamente excluído da contagem do radar no mapa. (FR-003, FR-004)

## Critérios de sucesso

- **SC-001:** Usuário Free que atinge 30 likes no mesmo dia é impedido de realizar novos swipes até o próximo ciclo diário. (FR-007)

## Premissas

- Nenhuma premissa material externa; toda persistência é gerida no SQLite local via Drizzle.

## Componentes afetados

- `db/schema.ts` — Modelos de perfis, fetiches, check-ins, bucket list e wallet
- `src/onboarding.ts` — Lógica de Soft/Hard Gate e verificação de idade
- `src/radar.ts` — Catálogo de locais e agregação anônima de check-ins com TTL
- `src/matching.ts` — Algoritmo de swipe, afinidade de fetiches e cota diária
- `src/fotolog.ts` — Foto diária de 24h e blur facial
- `src/wallet.ts` — Ledger da moeda virtual sem cash-out/P2P
- `src/views/` — Templates SSR em pt-BR via Hono JSX

## Rastreabilidade

| Requisito | Cobertura | Evidência esperada |
|-----------|-----------|--------------------|
| `FR-001` | `US-001` | Teste automatizado de permissões de leitura com soft gate e escrita com hard gate. |
| `FR-002` | `US-001` | Teste de conta de casal garantindo perfil único e ação conjunta. |
| `FR-003` | `US-002` | Teste de check-in com expiração por TTL de 1h a 4h. |
| `FR-004` | `US-002` | Teste de retorno anônimo no radar contendo apenas totalizador numérico. |
| `FR-005` | `US-003` | Teste de upload no Fotolog com decaimento de 24h e flag de blur ativada. |
| `FR-006` | `US-004` | Teste do cálculo de ordenação do deck por distância e fetiches. |
| `FR-007` | `US-004`, `SC-001` | Teste do limitador de 30 likes diários para contas gratuitas. |
| `FR-008` | `US-004` | Teste de detecção de local em comum no Bucket List após match mútuo. |
| `FR-009` | `US-005` | Teste de transações na Token Wallet com bloqueio de cash-out e P2P. |
| `FR-010` | `US-001`, `US-002`, `US-003`, `US-004`, `US-005` | Teste de renderização das rotas HTML em pt-BR via Hono JSX. |
| `EC-001` | `US-002` | Teste de exclusão de check-in vencido na consulta do radar. |
| `SC-001` | `US-004` | Teste de bloqueio de like quando quota de 30 é atingida no Free. |
