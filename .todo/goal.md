# Goal: Liberages - Aplicação Completa Modular Monolith (Bun, Drizzle, SQLite, Hono JSX, UUIDv7)

> **Objetivo:** Transformar a base de protótipo em uma aplicação de produção completa, com persistência real em SQLite via Drizzle ORM, UUIDv7 em todas as entidades, Clean Architecture / DDD modular (adapters, repositories, domain), motor de busca FTS5, integração Mercado Pago, PWA completo e roteamento central unificado no Hono.
> **Status:** Concluído ✅

---

## Plano de Tarefas

### [1.0] Discovery & Infraestrutura de Banco
- [x] [1.1] Instalação de dependências (`uuidv7`, `drizzle-orm/bun-sqlite`) e teste de compatibilidade
- [x] [1.2] Modelagem do banco de dados completo (`db/schema.ts` e `db/index.ts`) com inicialização automática de tabelas e FTS5
  - **AC:** Banco SQLite é inicializado com schema completo e tabelas criadas.

### [2.0] Camada Compartilhada (Shared & Domain Primitives)
- [x] [2.1] Gerador UUIDv7 padronizado e tratamento de identificadores de domínio (`src/shared/uuid.ts`)
  - **AC:** Chaves primárias em todos os repositórios usam UUIDv7 estrito.

### [3.0] Módulos de Domínio (Modular Monolith / Clean Architecture)
- [x] [3.1] Módulo Identity: Soft/Hard gate, PIN login, contas Single e Couple com persistência SQLite
  - **AC:** Usuários e sessões são persistidos no banco SQLite via repositório Drizzle.
- [x] [3.2] Módulo Radar: Catálogo de locais, check-ins dinâmicos com TTL e agregação anônima no banco SQLite
  - **AC:** Check-ins gravados e filtrados por TTL real via queries SQLite.
- [x] [3.3] Módulo Social: Fotolog 24h, Swipe Deck ranking (distância + fetiches), likes, amizades e Bucket List
  - **AC:** Likes e amizades persistidos no banco; ordenação de deck operacional.
- [x] [3.4] Módulo Search: Motor de busca global FTS5 (apelido, cidade, tags de fetiches)
  - **AC:** Busca rápida em tabela virtual SQLite FTS5 com exclusão de perfis ghost.
- [x] [3.5] Módulo Economy: Token Wallet com ledger transacional e webhook adapter do Mercado Pago
  - **AC:** Saldo e histórico gravados em SQLite, sem cash-out/P2P, com validação de webhook MP.
- [x] [3.6] Módulo Chat & Media: DMs privados com isolamento e mídia efêmera com decaimento atômico
  - **AC:** Mensagens salvas no banco com checagem de autorização dos participantes.
- [x] [3.7] Módulo Community & Governance: Spaces (Fóruns e Comunidades Anônimas), Júri de Anjos, Web of Trust, Caça ao Tesouro B2B e Contos
  - **AC:** Todas as entidades de governança persistidas com regras ativas.
- [x] [3.8] Módulo Security: Modo Falso, Ghost Mode com temporizador e marca d'água dinâmica
  - **AC:** Disfarce funcional e filtro de invisibilidade no radar.

### [4.0] Interface de Usuário SSR (Hono JSX) e PWA
- [x] [4.1] Templates Hono JSX completos em pt-BR (Feed, Swipe, Mapa, Carteira, Chat, Spaces, Disfarce)
  - **AC:** Todas as rotas renderizam HTML semântico com navegação e formulários funcionais.
- [x] [4.2] Manifesto PWA (`public/manifest.json`) e Service Worker (`public/sw.js`)
  - **AC:** PWA instalável offline-first sem depender de app stores.

### [5.0] Roteamento Central e Montagem (`src/index.ts`)
- [x] [5.1] Montagem unificada de todos os módulos, middlewares e graceful shutdown no servidor principal
  - **AC:** Servidor `src/index.ts` roda com todas as rotas e health checks `/healthz` e `/readyz`.

### [6.0] Validação Final & Suite de Testes
- [x] [6.1] Suite completa de testes unitários e de integração
  - **AC:** Todos os testes passam limpos com 100% de sucesso (34/34 testes passando).
