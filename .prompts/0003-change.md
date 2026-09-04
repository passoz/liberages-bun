# PROMPT: Pós-MVP Liberages - Retenção e Segurança de Ocultação

**Status:** Pronto para planejamento
**Work ID:** 0003
**System spec:** `.specs/system.md`
**Baseline:** versão 1
**Origem:** `.sources/0003-local.md`

## Delta da system spec

- **Capacidades afetadas:** `CAP-002`, `CAP-003`.
- **Regras preservadas:** `BR-001`, `BR-002`, `BR-005`.
- **Regras alteradas:** `BR-003`, `BR-004`.
- **Contratos afetados:** `CON-001`.
- **Qualidades, entidades e integrações relacionadas:** `ENT-001`.
- **Gaps tocados:** nenhum.
- **Reconciliação esperada após implementação:** Delta que abrange a infra WebCrypto no contrato PWA e o Web of Trust na entidade do Usuário, habilitando blindagem avançada da rede.

## Problema e resultado

**Problema:** A rede opera bem em MVP, mas sem DMs encriptados, limites para bad-actors (sem júri popular), faltam mecanismos premium (selfies destrutíveis) que reduzem a conversão final e a exclusividade (Ghost mode no mapa restrito).

**Resultado esperado:** Usuários com engajamento de Chat ativo, proteção E2E visual via Marca-D'água Dinâmica/auto-blur, e sistema gamificado de moderação B2B comunitária instanciado.

## Contexto confirmado

- `.specs/system.md`: capacidades CAP-003 atestando a presença obrigatória pra anti-leaks/blur.

## Atores e valor

- **ACT-001:** Ganha poder de comunicação 1:1 segura (Chat DM), compartilha mídia efêmera, ou engaja via Web of Trust.
- **ACT-002:** O Anjo/Moderador passa a poder atuar num painel de Júri.

## Escopo

### Inclui

- Chat DM Habilitado e mecanismo de expiração na 1ª view (Selfies destrutíveis).
- Marca d'água dinâmica do rastreador invisível nos responses JSON/HTML.
- Modo Falso e Modo Ghost no motor de Mapas.
- Dashboard da Comunidade/Fóruns e Júri Popular da moderação.
- Web of trust (Checkin atestado).

### Não inclui

- Fundação da Economia via MP (Tão resolvida na fase 1).
- Rotas base de Match Swipe.

## Cenários de usuário

### US-001 — Selfie Destrutível (P1)

**Ator:** `ACT-001`.

**Valor independente:** Reduz exposição da privacidade nas mensagens.

**Verificação independente:** A imagem DM, uma vez consumida, sofre decaimento de ID e purge no File System.

**Cenários de aceitação:**
1. **Given** num Chat direto, **When** abre selfie efêmera do remetente, **Then** view flag é ativada permanentemente revogando o render daquele URL. (FR-001)

## Contrato observável

- **Entradas:** Envios WebSocket (se adotado) ou HTMX Polling para DM real-time.
- **Saídas e efeitos:** Atualização de buffer binário restrito (imagens criptografadas).
- **Erros:** View expirada manda 410 Gone; UI fallback genérico.

## Requisitos

### Funcionais

- **FR-001:** Arquivos atrelados com `ttl_views=1` são deletados imediatamente/removidos hash do Bun driver após o primeiro request GET finalizado 200 via CDN interna.

### Qualidade e restrições

- Nenhum SQR novo, preserva arquitetura original.

## Casos de borda

- **EC-001:** Usuário dá refresh rápido para contornar limitador expira de imediato a view. (FR-001)

## Critérios de sucesso

- **SC-001:** Mídia falha em render com 404/410 após recarregamento via rede. (FR-001)

## Premissas

- Hono continuará orquestrando stream WebSockets para esse Chat sem introdução de Go.

## Componentes afetados

- `business/chat`, `db/migrations`, `web/assets/`

## Rastreabilidade

| Requisito | Cobertura | Evidência esperada |
|-----------|-----------|--------------------|
| `FR-001` | `US-001`, `SC-001` | Teste que um Request subsequente a um view file dá Not Found HTTP Code. |
