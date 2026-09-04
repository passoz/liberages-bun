# PROMPT: Liberages Etapa 2 - Pós-MVP Features Adicionais

**Status:** Pronto para planejamento
**Work ID:** 0005
**System spec:** `.specs/system.md`
**Baseline:** versão 1
**Origem:** `.sources/0005-local.md`

## Delta da system spec

- **Capacidades afetadas:** `CAP-001`, `CAP-002`, `CAP-003`, `CAP-004`.
- **Regras preservadas:** `BR-001`, `BR-002`, `BR-005`.
- **Regras alteradas:** `BR-003`, `BR-004`.
- **Contratos afetados:** `CON-001`.
- **Qualidades, entidades e integrações relacionadas:** `ENT-001`.
- **Gaps tocados:** nenhum.
- **Reconciliação esperada após implementação:** Features avançadas pós-MVP de chat, moderação comunitária, modos de ocultação e gamificação B2B estarão ativas.

## Problema e resultado

**Problema:** O MVP cobre o core loop de rede social, swipe e mapas, mas a experiência pós-MVP requer canais de comunicação direta (DMs), mecanismos reforçados de anonimato (Modo Falso, Ghost), governança comunitária (Júri Popular, Web of Trust) e parcerias B2B gamificadas (Caça ao Tesouro).

**Resultado esperado:** Usuários comunicam-se via Chat com proteção visual, ativam modos de ocultação sob demanda, participam de sub-comunidades anônimas, obtêm selo de verificação social e exploram caças ao tesouro geolocalizadas em estabelecimentos parceiros.

## Contexto confirmado

- `.specs/system.md`: especificação governante definindo CAP-001 a CAP-004.
- `SPEC.md`: master specification aprovada detalhando todas as 53 decisões consolidadas.

## Atores e valor

- **ACT-001:** Usuários que conversam por chat, ocultam-se com Modo Ghost e participam da Web of Trust.
- **ACT-002:** Moderadores ("Anjos") que participam do Júri Popular em deliberações comunitárias.

## Escopo

### Inclui

- Chat DM em tempo real com WebSockets/polling.
- Marca d'água dinâmica invisível nas imagens com hash do visualizador.
- Modo Falso (botão de pânico) e Modo Ghost com temporizador programável.
- Spaces: Fóruns abertos e Sub-comunidades anônimas com pseudônimo por espaço.
- Governança comunitária: Selo Anjo da Comunidade e Júri Popular.
- Web of Trust: Selo azul mediante validação de 4 amigos presenciais (`real`).
- Caça ao Tesouro B2B geolocalizada em estabelecimentos parceiros.
- Publicação de Contos Eróticos e galeria com álbuns permanentes expandidos.

### Não inclui

- Fundação técnica básica e MVP Core Loop (resolvidos no Work 0004).
- Criptografia E2E pós-quântica (fora de escopo).

## Cenários de usuário

### US-001 — Chat DM e Proteção Visual Anti-Leak (P1)

**Ator:** `ACT-001`.

**Valor independente:** Comunicação direta segura entre perfis com match.

**Verificação independente:** Envio de mensagens em tempo real e marca d'água invisível nas imagens.

**Cenários de aceitação:**

1. **Given** usuários com match mútuo, **When** trocam mensagens no chat, **Then** a entrega ocorre em tempo real via WebSockets ou polling. (FR-001, SC-001)
2. **Given** imagem exibida na interface, **When** é renderizada no frontend, **Then** embute marca d'água invisível com o hash do usuário visualizador. (FR-002)

### US-002 — Modos de Ocultação (Modo Falso e Ghost) (P1)

**Ator:** `ACT-001`.

**Valor independente:** Proteção imediata contra olhares indiscretos e ocultação seletiva do mapa.

**Verificação independente:** Botão de pânico redireciona para tela de disfarce e Modo Ghost oculta usuário do radar com timer.

**Cenários de aceitação:**

1. **Given** usuário em situação de risco de exposição, **When** aciona o Modo Falso, **Then** o app redireciona imediatamente para tela inócua de calculadora. (FR-003)
2. **Given** usuário ativando Modo Ghost por 2 horas, **When** navega no app, **Then** fica completamente invisível do radar e buscas até o término do timer. (FR-003, EC-001)

### US-003 — Spaces e Comunidades Anônimas (P1)

**Ator:** `ACT-001`.

**Valor independente:** Participação em debates com anonimato compartmentalizado.

**Verificação independente:** Postagem em fórum geral com perfil e em comunidade com pseudônimo específico.

**Cenários de aceitação:**

1. **Given** sub-comunidade anônima, **When** usuário posta um relato, **Then** seu autor é exibido sob o pseudônimo exclusivo daquela comunidade. (FR-004)

### US-004 — Governança e Web of Trust (P1)

**Ator:** `ACT-001`, `ACT-002`.

**Valor independente:** Moderação legítima sem censura corporativa e confiança social real.

**Verificação independente:** Anjos votando em Júri Popular e 4 amigos atestando para selo verificado.

**Cenários de aceitação:**

1. **Given** disputa na comunidade, **When** submetida ao Júri Popular, **Then** somente Anjos votam na resolução. (FR-005)
2. **Given** usuário com 4 atestados de amizade presencial (`real`), **Then** o sistema concede automaticamente o selo azul de verificação comunitária. (FR-006)

### US-005 — Gamificação B2B e Conteúdo Expandido (P1)

**Ator:** `ACT-001`.

**Valor independente:** Recompensas reais em estabelecimentos e criação de conteúdo literário.

**Verificação independente:** Caça ao tesouro resgatável no mapa e contos publicados por usuários qualificados.

**Cenários de aceitação:**

1. **Given** usuário próximo a estabelecimento parceiro, **When** encontra o ponto de caça ao tesouro no mapa, **Then** resgata moedas ou cupons de desconto. (FR-007)
2. **Given** usuário Premium ou com badge de alto XP, **When** publica conto erótico, **Then** o texto fica visível na biblioteca pública. (FR-008)

## Contrato observável

- **Entradas:** Conexões WebSockets para chat, requisições de ativação de modos e resgate de tesouros.
- **Saídas e efeitos:** Streams de mensagens em tempo real, telas de disfarce, atualização de selos Web of Trust.
- **Erros:** HTTP 403 para não-Anjos tentando votar no Júri; HTTP 403 para publicação de contos sem nível/plano exigido.

## Requisitos

### Funcionais

- **FR-001:** O sistema deve prover Chat DM com entrega em tempo real para pares com match mútuo.
- **FR-002:** O sistema deve aplicar marca d'água dinâmica invisível com hash do visualizador nas imagens renderizadas.
- **FR-003:** O sistema deve implementar Modo Falso (botão de pânico) e Modo Ghost com temporizador automático.
- **FR-004:** O sistema deve prover Spaces unificados com suporte a fóruns abertos e sub-comunidades com pseudônimos.
- **FR-005:** O sistema deve habilitar Júri Popular restrito a moderadores com selo Anjo da Comunidade.
- **FR-006:** O sistema deve conceder selo azul de verificação social mediante atestado presencial de 4 amigos reais.
- **FR-007:** O sistema deve suportar Caça ao Tesouro B2B geolocalizada com concessão de moedas virtuais ou cupons.
- **FR-008:** O sistema deve permitir publicação de contos eróticos e álbuns ilimitados para assinantes Premium ou usuários com alto XP.

### Qualidade e restrições

- Stack mantida em Bun + Hono + Drizzle + SQLite.

## Casos de borda

- **EC-001:** Modo Ghost desativa automaticamente e restaura visibilidade padrão quando o temporizador atinge zero. (FR-003)

## Critérios de sucesso

- **SC-001:** Mensagens trocadas no Chat DM são entregues instantaneamente e inacessíveis para terceiros. (FR-001)

## Premissas

- Conexões de Chat utilizam a infraestrutura nativa do Hono no Bun.

## Componentes afetados

- `src/chat.ts` — Mensageria em tempo real
- `src/security.ts` — Marca d'água, Modo Falso e Ghost timer
- `src/spaces.ts` — Fóruns e sub-comunidades anônimas
- `src/governance.ts` — Júri Popular e Web of Trust
- `src/b2b.ts` — Caça ao tesouro e cupons de parceiros
- `src/stories.ts` — Contos eróticos e álbuns expandidos

## Rastreabilidade

| Requisito | Cobertura | Evidência esperada |
|-----------|-----------|--------------------|
| `FR-001` | `US-001`, `SC-001` | Teste automatizado de envio e recebimento de mensagem no chat. |
| `FR-002` | `US-001` | Teste de injeção de watermark com hash do usuário visualizador. |
| `FR-003` | `US-002`, `EC-001` | Teste de redirecionamento do Modo Falso e expiração do timer Ghost. |
| `FR-004` | `US-003` | Teste de postagem sob pseudônimo em sub-comunidade anônima. |
| `FR-005` | `US-004` | Teste de permissão restrita de votação no Júri Popular para Anjos. |
| `FR-006` | `US-004` | Teste de concessão do selo verificado após 4 amigos atestarem presença física. |
| `FR-007` | `US-005` | Teste de resgate de ponto de caça ao tesouro B2B concedendo moedas. |
| `FR-008` | `US-005` | Teste de permissão de postagem de contos restrita a Premium/alto XP. |
| `EC-001` | `US-002` | Teste de restauração de visibilidade ao término do timer Ghost. |
| `SC-001` | `US-001` | Teste de entrega privada e instantânea de mensagens de chat. |
