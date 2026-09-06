# Goal: Migração da Autenticação do Liberages para o Better Auth com Drizzle ORM

> **Objetivo:** Migrar integralmente o sistema de autenticação para o Better Auth utilizando o adaptador nativo Drizzle ORM (Bun SQLite), preservando total compatibilidade com o fluxo de PIN discreto, SSR Hono JSX, testes de integração e E2E, sem uso de SQL direto (apenas Drizzle ORM).
> **Status:** Concluído ✅

---

## Plano de Tarefas

### [1.0] Discovery & Configuração
- [x] [1.1] Mapear arquitetura de autenticação atual (JWT customizado, PIN login, cookies, middleware `getAuthenticatedUser`)
  - **AC:** Inventário completo de contratos, dependências, cookies e rotas afetadas documentado.
- [x] [1.2] Instalar dependência `better-auth`
  - **AC:** `package.json` atualizado com `better-auth` e resolução de tipos sem conflitos.

### [2.0] Modelagem Drizzle para o Better Auth (Sem SQL Direto)
- [x] [2.1] Definir schemas Drizzle para tabelas do Better Auth (`user`, `session`, `account`, `verification`) em `db/schema.ts`
  - **AC:** Tabelas declaradas com `sqliteTable` do Drizzle ORM com campos obrigatórios do Better Auth + campos de domínio do Liberages (nickname, accountType, pin, gateStatus, etc.).
- [x] [2.2] Atualizar inicialização do banco via Drizzle ORM em `db/index.ts`
  - **AC:** Banco e tabelas Better Auth inicializadas e integradas via Drizzle ORM sem queries SQL diretas.

### [3.0] Instanciação e Configuração do Better Auth
- [x] [3.1] Criar serviço de autenticação Better Auth com Drizzle Adapter (`src/auth.ts`)
  - **AC:** Instância do Better Auth configurada com `drizzleAdapter(db, { provider: "sqlite", schema: ... })` e opções de sessão.
- [x] [3.2] Expor rotas padrão do Better Auth no Hono (`/api/auth/*`)
  - **AC:** Endpoint `/api/auth/*` montado e respondendo às requisições do Better Auth (get-session, sign-in, etc.).

### [4.0] Integração com Domínio & PIN-First Login
- [x] [4.1] Integrar autenticação PIN com criação de sessão Better Auth
  - **AC:** Endpoints `/api/identity/login/pin` e `/api/login/pin` autenticam PIN e geram sessão Better Auth persistida via Drizzle.
- [x] [4.2] Atualizar middleware `getAuthenticatedUser` para validar sessões Better Auth
  - **AC:** `getAuthenticatedUser(c)` resolve usuário a partir do cookie/sessão do Better Auth com fallback retrocompatível.
- [x] [4.3] Atualizar dashboard e rotas SSR para consumo de sessão Better Auth
  - **AC:** Rota raiz `/` identifica sessão Better Auth e renderiza painel autenticado sem loops de redirecionamento.

### [5.0] Testes, Validação & Regressão
- [x] [5.1] Criar testes unitários e de integração para endpoints do Better Auth e login com sessão
  - **AC:** Testes validam `/api/auth/*`, criação de sessão, verificação de cookie e persistência via Drizzle.
- [x] [5.2] Executar suíte completa de testes (`bun test`) e E2E Playwright
  - **AC:** 100% dos testes existentes (61 testes) e novos testes passam sem falhas nem regressões (67/67 aprovados).
- [x] [5.3] Auditoria de conformidade de código
  - **AC:** Zero queries SQL diretas na camada de autenticação (somente Drizzle ORM), tipagem TypeScript estrita e convenções respeitadas.
