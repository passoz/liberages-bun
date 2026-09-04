# SYSTEM SPEC: Liberages

**Status:** Baseline validada
**Versão:** 1
**Última reconciliação:** 2024-09-04

**Escopo da baseline:** Aplicação de Rede Social e Mapa Interativo ("Liberages") backend/frontend integrada, usando Bun/Hono/Drizzle/SQLite em arquitetura de monolito modular, incluindo gestão de perfis, matching, check-in, moeda virtual fechada e moderação.

## Propósito e resultados sistêmicos

**Problema sistêmico:** O público liberal (solteiros e casais) carece de um espaço seguro, livre de preconceitos e rastreamento comercial onde possam se encontrar, socializar e descobrir estabelecimentos parceiros com total privacidade da identidade real.

**Resultado sistêmico:** Um ecossistema fechado que prioriza a privacidade (arquivamento dinâmico de mídias e watermarks antifraude, anonimidade) onde os usuários se conectam geograficamente, agendam encontros reais e utilizam uma moeda digital restrita ao ecossistema para impulsionar conexões e interações sem exposição aos bancos tradicionais.

## Fronteira do sistema

### Dentro da fronteira
- Módulo de Contas, Identidade (Soft/Hard Gate) e Onboarding.
- Motor de Busca de texto completo (FTS5) e recomendação de perfis baseada em localização e interseção de fetiches.
- Módulo de Mapa Interativo com radar e catálogos de locais fixos.
- Sistema unificado de Moeda Virtual (Closed-Loop Economy).
- Mecanismos de Privacidade (Modo fantasma, selfies destrutíveis, blur default em rostos, marca d'água dinâmica).
- Frontend PWA e SSR com Hono JSX.

### Fora da fronteira
- Validação KYC profunda fora da checagem primária de idade via documento descartado.
- Saques de dinheiro (Cash-out) no ecossistema (Moeda Unidirecional).
- Pagamentos avulsos via PIX ou transações P2P diretas entre usuários.
- Criptografia de Chat E2E.

## Atores e sistemas externos

- **ACT-001 — Solteiros e Casais:** Usuários do núcleo que se conectam, consomem social e executam matches. Ações indissociáveis no caso de casal. **Evidência:** `SPEC.md`
- **ACT-002 — Admin/Moderador:** Membro do staff ("Anjo") da plataforma. **Evidência:** `SPEC.md`
- **ACT-003 — Mercado Pago:** Gateway de Pagamento para recarga da Moeda Virtual. **Evidência:** `SPEC.md`

## Capacidades sistêmicas

### CAP-001 — Descoberta de Perfis e Matching

**Valor:** Permitir que atores encontrem parceiros locais e sugere dates por interseções do Bucket List.

**Atores:** `ACT-001`.

**Comportamento:** Exibição do "deck de swipe" ordenado inicialmente por proximidade e depois por % de compatibilidade (fetiches em comum). Encontros com bucket list compatível sugerem date automático. Busca textual FTS5 permite pesquisar por tags. Amizades são geradas se os likes forem mútuos.

**Falhas e limites:** Limite diário de 30 likes na tier Free. Perfis "ghost" são omitidos.

**Regras relacionadas:** `BR-001`, `BR-002`.

**Contratos relacionados:** `CON-001`.

**Evidência:** `SPEC.md`

### CAP-002 — Check-in no Mapa e Radar

**Valor:** Revelar concentração de público em locais B2B sem quebrar anonimato pessoal.

**Atores:** `ACT-001`.

**Comportamento:** O usuário relata sua presença num local de catálogo (motel, bar). Sua identidade permanece anônima ("X pessoas estão no local Y").

**Falhas e limites:** O usuário define o TTL obrigatoriamente (1h a máx 4h). Após vencido, sai do radar. Nenhuma métrica GPS contínua é rastreada ou visível.

**Regras relacionadas:** `BR-003`.

**Contratos relacionados:** `CON-001`.

**Evidência:** `SPEC.md`

### CAP-003 — Postagem e Interação Social 

**Valor:** Permitir publicações focadas em social e moderação local via fotos de curta expiração e contos permanentes.

**Atores:** `ACT-001`.

**Comportamento:** Usuário divulga 1 foto diária no Fotolog (24h de decaimento). Pode escrever contos eróticos (se premium ou nível alto) ou postar informalmente que precisa de Cia em destino via "Destination Broadcast".

**Falhas e limites:** Apenas Premium/Verificado postam contos ilimitados. Free tem os álbuns limitados a 3 un. Rostos possuem blur on-upload por padrão. Imagens possuem marca d'água invisível.

**Regras relacionadas:** `BR-004`.

**Contratos relacionados:** `CON-001`.

**Evidência:** `SPEC.md`

### CAP-004 — Economia Virtual Unificada (Closed-Loop)

**Valor:** Sustentar compras de impulso sem KYC bancário ou evasão P2P.

**Atores:** `ACT-001`.

**Comportamento:** O sistema converte reais em Moedas via Gateway, ou os recebe por recompensa de engajamentos (check-in, verificação). A moeda virtual pode ser gasta para Presentes, Match Boost ou abater a assinatura do Premium. Cash-out é proibido.

**Falhas e limites:** P2P estritamente removido; ninguém transfere carteira para contas avulsas de outros usuários.

**Regras relacionadas:** `BR-005`.

**Contratos relacionados:** `CON-002`.

**Evidência:** `SPEC.md`

## Regras e invariantes globais

- **BR-001:** Uma Conta = Um Perfil de forma estrita; casais navegam sob mesma identidade de forma síncrona, não há nome real listado só pseudônimos. **Cobertura:** `CAP-001`. **Evidência:** `SPEC.md`
- **BR-002:** Soft Gate via idade auto-declarada para Leitura x Hard Gate envio documento descartado pra Escrita, login facilitado por PIN primário. **Cobertura:** `CAP-001`. **Evidência:** `SPEC.md`
- **BR-003:** O Mapa jamais sinaliza coordenadas P2P diretas entre os usuários ou rastreamento GPS constante, usa TTL. **Cobertura:** `CAP-002`. **Evidência:** `SPEC.md`
- **BR-004:** Anti-Leak Visual e Blur Default: Toda renderização recebe watermark heurístico (ID hash escondido) da visualização e decai self-destruction pics por padrão nos DMs. **Cobertura:** `CAP-003`. **Evidência:** `SPEC.md`
- **BR-005:** Closed-Loop Economy restrita, nenhum saque (cash-out) fiat é possível em todo o ecossistema P2P. **Cobertura:** `CAP-004`. **Evidência:** `SPEC.md`

## Contratos observáveis

### CON-001 — PWA & Web UI

**Consumidores:** `ACT-001`, `ACT-002`.

**Entradas:** Requisições HTML semântico via JSX, interações em SPA limitadas, e formulários HTML padrão enviados ao Hono.

**Saídas e efeitos:** Interface do PWA em pt-br.

**Erros:** Acessos não autorizados por níveis do Hard-Gate barrados e 401 Soft-gate negado.

**Compatibilidade:** Funciona sob PWA independente, suprimindo o bloqueio por App Stores restritivas.

**Evidência:** `SPEC.md`

### CON-002 — Gateway PSP (Webhooks)

**Consumidores:** `ACT-003`.

**Entradas:** Webhooks do Mercado Pago para notificação assíncrona de status de pagamento / assinatura em Reais.

**Saídas e efeitos:** Emissão de moedas ou confirmação de liberação do plano Premium. 

**Erros:** Ocorrendo rejeição bancária do checkout, retém o estado Pending até o timeout e declina sem efeitos duradouros.

**Compatibilidade:** Interface segregada em código isolando a API nativa.

**Evidência:** `SPEC.md`

## Modelo conceitual do domínio

- **ENT-001 — Social Profile:** Centralizador (Usuário Solteiro ou Casal), abrange likes, matches e fetiches. **Evidência:** `SPEC.md`
- **ENT-002 — Wallet Balance:** Alocador transacional da moeda (não conversível por Reais de forma inversa) em banco SQLite `TEXT`. **Evidência:** `SPEC.md`

## Dados e ciclo de vida

- Persistência em Bun SQLite em UUIDv7 com strings. Mídia gerada via Fotolog e Selfie destrutiva sofre TTL imediato ou limitação Free (3 álbuns pro app-limits). IDs originais de Hard gate decaem a hash criptográfico. (`ENT-001`, `BR-004`). **Evidência:** `SPEC.md`

## Segurança, privacidade e autorização

- Opt-out Blur mandatório (por default ofusca rosto). Watermarks da página inibem printscreens nativos do PWA. Apenas HTTPS habilitado no Chat (leitura pela inteligência backend de moderação permitida). PIN-first login via dispositivo com fallback password-E-mail. Modos Invisível/Ghost ocultam no mapa. (`BR-004`, `CON-001`). **Evidência:** `SPEC.md`

## Qualidades sistêmicas

- **SQR-001:** Hono Graceful shutdown — ao interceptar o sinal em Bun, tem obrigação técnica de fechar conexões SQL e HTTP em até 10s. **Cobertura:** `CAP-001`, `CON-001`. **Evidência:** `SPEC.md`

## Integrações externas

- Nenhuma integração externa não registrada nos Atores acima (como o MP) foi confirmada.

## Restrições e decisões vigentes

- Restrição de UI para PWA. Monolito Single Binary renderizado pelo runtime Bun localmente com Hono. DB em SQLite adaptativo para permitir migração Postgres apenas na Fase 2 futura. Referência explícita a código inteiramente em Inglês e view em pt-br.

## Registro de cobertura e drift

| ID | Estado | Evidência | Observação |
|----|--------|-----------|------------|
| `CAP-001` | Confirmado | `SPEC.md` | O comportamento fundamental e tags estão consistentes. |
| `CAP-002` | Confirmado | `SPEC.md` | Estratégia firme contra triangulação GPS. |
| `CAP-003` | Confirmado | `SPEC.md` | Anti-leaks estão fundamentados no SPEC. |
| `CAP-004` | Confirmado | `SPEC.md` | Zero Cash-out garante segurança legal contra lavagem. |

## Rastreabilidade sistêmica

| Capacidade | Atores | Regras | Contratos | Entidades | Qualidades | Integrações |
|------------|--------|--------|-----------|-----------|-----------|------------|
| `CAP-001` | `ACT-001` | `BR-001` | `CON-001` | `ENT-001` | `SQR-001` | N/A |
| `CAP-002` | `ACT-001` | `BR-003` | `CON-001` | `ENT-001` | `SQR-001` | N/A |
| `CAP-003` | `ACT-001` | `BR-004` | `CON-001` | `ENT-001` | `SQR-001` | N/A |
| `CAP-004` | `ACT-001` | `BR-005` | `CON-002` | `ENT-002` | `SQR-001` | N/A |

## Política de evolução

- Mudanças de comportamento devem começar em `/make-prompt` referenciando esta baseline.
- O prompt deve declarar capacidades, regras e contratos preservados ou alterados.
- Após implementação validada, reconcilie esta spec quando o comportamento sistêmico tiver mudado.
- Divergência entre spec e sistema deve ser registrada como drift; não escolha silenciosamente uma fonte.