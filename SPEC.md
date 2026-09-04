# SPEC.md — Liberages (Master Specification)

**Document Status:** Approved (Baseado nas 53 decisões estratégicas consolidadas)
**Version:** 2.1 (Exaustiva) - Adaptado para stack Bun/Drizzle/Hono


### 6.1 Modelo de Anúncios (Monetização do Free)
- **Free Tier:** Usuários grátis veem anúncios nativos B2B (ex: banners e marcadores de Motéis/Casas de Swing) mesclados no feed e no mapa.
- **Premium Tier:** A assinatura Premium remove 100% dos anúncios (Ad-Free).

---

## 1. Visão Geral e Escopo
- **Produto:** Rede Social e Mapa Interativo focado no público liberal.
- **Abordagem:** O app é uma **Rede Social primeiro**, e um aplicativo de Swipe (encontros) em segundo plano.
- **Escopo do MVP:** Contempla todas as funcionalidades aprovadas no *Grilling*, sem cortes agressivos para "MVP enxuto", exceto as funcionalidades explicitamente banidas (Live Streaming, Marketplace de Criadores, Carona Solidária, "Tô Querendo", Encontro Surpresa).

---

## 2. Arquitetura e Infraestrutura
- **Linguagem:** Bun (TypeScript) - single binary via `bun build`.
- **Web UI:** Interface do usuário renderizada no servidor com Hono e JSX templates, ou como SPA client-side (dependendo da rota), com suporte a i18n para pt-br. Assets empacotados com Bun. PWA para bypassar restrições das App Stores. Desktop App via system tray.
- **Roteamento e HTTP:** Hono (framework web leve para Bun/Edge). Substitui o net/http do Go.
- **Banco de Dados:** SQLite via driver do bun (`bun.sqlite`). Preparado arquiteturalmente para migração a PostgreSQL futuramente (quando exigir múltiplos containers).
- **Queries:** Drizzle ORM (query builder e mapeador leve, sem abstrações que comprometam performance, seguindo o princípio de SQL puro sempre que possível).
- **IDs:** UUID v7 gerados no servidor (nunca no frontend) salvos como `TEXT`.
- **Middlewares (Ordem Estrita):** RequestID → SlogLogger (usando pino-bunyan ou similar) → Recoverer → CORS → Auth.
- **Graceful Shutdown:** Bun fornece manejo de sinais; timeout de 10 segundos ao interceptar `SIGINT`/`SIGTERM`.
- **Health Checks:** Rotas isoladas `/healthz` (liveness) e `/readyz` (readiness/DB check) via Hono.
- **Armazenamento (Storage):** Local filesystem na V1 (Adaptador S3 preparado no código para fase 2).
- **Gateway de Pagamento (PSP):** Mercado Pago (interface segregada via Ports & Adapters para permitir troca fácil).
- **Backup:** Sidecar container (ou processo separado) realizando cópia do SQLite para storage S3-compatível (ex: MinIO).
- **Padronização de Linguagem:**
  - Código, rotas e nomenclatura (nome de variáveis, funções, tabelas do banco, etc.) em inglês.
  - Interface do usuário (strings) internacionalizada (i18n) para pt-br.

---

## 3. Identidade, Contas e Onboarding
### 3.1 Modelo de Entidade e Perfis
- **Regra de Ouro:** Um `User` (Conta) = Um `Profile`. Não existem sub-perfis.
- **Tipos de Conta:**
  - `single` (Solteiro)
  - `couple` (Casal): Conta compartilhada e administrada por ambos. Possui apenas UM login unificado e UM perfil público na plataforma. O casal age de forma indissociável (ex: o swipe é feito pela entidade 'casal').
  - `throuple` (Trisal): Requer moderação humana prévia para aprovação.
- **Política de Identidade:** Nomes reais são **desencorajados**. A plataforma baseia-se em apelidos/pseudônimos.

### 3.2 Onboarding em Camadas (Moderated Entry)
O ingresso na plataforma não é aberto. É feito em camadas para equilibrar conversão e compliance:
1. **Soft Gate (Acesso de Leitura):** Cadastro inicial + auto-declaração de 18+ gerando um cookie HMAC. O usuário pode entrar, navegar nos feeds e buscar perfis, mas não pode interagir ou postar.
2. **Hard Gate (Acesso Total / Age Verification):** Para enviar mensagens, fazer check-ins ou criar conteúdo, exige-se envio de documento.
   - *Privacidade do Documento:* A verificação é anônima. A IA/Humano atesta a idade, salva o `hash` da verificação no banco e **descarta** a imagem e o nome real.

### 3.3 Autenticação e Login
- **Modelo de Dados:** JWT + bcrypt local na V1 (Preparado para Keycloak na V2).
- **Fluxo de Login (PIN-First):**
  - E-mail e Senha são usados apenas no **primeiro acesso** no dispositivo (ou para forçar logout).
  - Após o primeiro acesso, o usuário cadastra um **PIN de 4 dígitos**.
  - O PIN passa a ser a forma primária e rápida de login para as sessões diárias (como um app bancário).

---

## 4. Mapa, Radar e Geolocalização
### 4.1 Catálogo de Locais (Bases Fixas)
- O mapa exibe locais fixos (Motéis, Casas de Swing, Bares).
- **Lançamento:** 50 a 100 locais curados pela plataforma.
- **Expansão:** Inserções colaborativas (crowdsourced) da comunidade mediante aprovação do admin.
- **Dados do Local:** Nome, coordenadas, categoria, fotos, horários. Locais **B2B Parceiros** possuem dados estendidos (eventos no local, status "rolando agora?", links, etc).

### 4.2 Radar e Check-ins (Política de Privacidade)
- **Check-in Dinâmico:** O check-in em um local exige um `TTL` (Time-To-Live). O usuário escolhe (ex: 1h, 2h, max 4h). Quando expira, some do mapa.
- **Visibilidade do Radar:** A visualização do radar é **sempre anônima**. O frontend só recebe `"X pessoas estão no local Y"`. 
- **Jamais revela identidade:** Identidades de usuários próximos nunca são expostas no radar. A revelação ocorre apenas via chat privado.

### 4.3 Outras Funcionalidades Geográficas
- **Destination Broadcast:** Convite informal. O usuário posta: "Vou pro Motel X hoje, quem anima?". **Não** é um ponto no radar, e sim um post no feed social que expira após o evento. Respostas são anônimas até os usuários combinarem.
- **Funcionalidades Cortadas:** "Tô Querendo" (GPS contínuo provou ser risco de privacidade/triangulação) e "Carona Solidária" (Risco severo de liability física).

---

## 5. Busca, Feed Social e Matching
### 5.1 Busca Global (FTS5)
- Como é uma rede social, a busca precisa ser poderosa.
- SQLite `FTS5` (Full-Text Search) ativado. Usuários podem buscar por Apelido exato, cidade, tags da bio.
- Perfis no "Modo Fantasma" são omitidos da busca.

### 5.2 Algoritmo do Feed Social (Fotolog)
- **Fotolog:** Foto única diária no feed. Expira estritamente após 24h.
- **Feed Contínuo:** Um único feed sem abas ("infinite scroll").
- **Regra de Ordenação (Funil):**
  1. `is_friend = true` (Maior prioridade: mostra os amigos primeiro).
  2. `distance` (Mostra desconhecidos fisicamente próximos).
  3. `compatibility_%` (Mostra desconhecidos distantes, mas com fetiches idênticos).

### 5.3 Lógica de Match e Fetiches
- **Ordenação do Deck de Swipe (Funil):** O deck de perfis exibido no Swipe é ordenado em duas camadas:
  1. **Localização primeiro** — perfis mais próximos geograficamente aparecem antes (raio de distância configurável).
  2. **Compatibilidade depois** — dentro do raio, ordena por % de match (interseção de fetiches).
- **Catálogo de Fetiches:** Catálogo fixo/curado pela plataforma (para garantir precisão matemática) + até 3 tags livres de texto para expressar a personalidade.
- **Cálculo de Match:** Interseção matemática simples (% de fetiches em comum). Lógicas complexas baseadas em papéis direcionais foram movidas para Pós-MVP.
- **Geração de Amizade:**
  - 1 Match (recíproco: 2 likes positivos) não cria um "match no limbo".
  - O match sugere/cria uma **Friendship** categorizada: `real` (se conhecem fisicamente) ou `virtual`.
- **Limites de Swipe (Monetização):**
  - Usuários **Free** possuem cota diária de likes (ex: 30/dia).
  - Usuários **Premium** possuem likes ilimitados.

### 5.4 Quebra-gelo: Bucket List
- Lista de desejos de locais. Se dois usuários dão match e possuem o mesmo local em sua Bucket List, a plataforma sugere um date automático para aquele local (Icebreaker direcionado). Substitui a feature antiga "Encontro Surpresa".

---

## 6. Conteúdo e Interações
- **Fotolog (24h):** Expiração automática diária.
- **Álbuns (Permanentes):** 
  - Limite para usuários Free: Max 3 álbuns.
  - Premium: Ilimitados.
- **Contos Eróticos:**
  - Usuários Free: Permissão apenas para ler.
  - Publicação de contos exige ser Premium OU desbloquear um nível/Badge alto de XP.
- **Likes e Visitas (Mecânica de Conversão):**
  - Usuários Free conseguem ver quem os curtiu/visitou apenas em uma **janela de tempo de 2 horas** após o evento.
  - Usuários Premium têm acesso ao histórico completo sem restrição de tempo.
- **Eventos UGC (Criados por Usuários):**
  - **Públicos:** Apenas usuários que conquistaram o selo de `Verified` (Web of Trust) podem colocar eventos no mapa público/agenda.
  - **Privados:** Usuários comuns só criam eventos ocultos (acessados via link/PIN).
- **Features Cortadas:** Story de 24h (substituído pelo Fotolog), Live Streaming, Marketplace de Criadores.

---

## 7. Segurança e Privacidade
### 7.1 Criptografia e Chat (DMs)
- **Fase 1 (MVP):** HTTPS-only. O servidor pode ler o conteúdo para permitir moderação robusta e IA analisando denúncias.
- **Fase 2 (Roadmap):** E2E (Web Crypto + ECDH). A arquitetura do banco deve ser pensada para suportar payloads opacos no futuro.
- **Selfie Destrutível:** Funcionalidade restrita ao Chat (DMs). A foto enviada possui uma flag de auto-destruição após 1 visualização real.

### 7.2 Proteção Visual
- **Blur Facial Automático:** Privilégio à privacidade. Toda foto (Fotolog/Album) sobe com blur no rosto por padrão. O dono deve dar opt-in explícito (`face_show_enabled = true`) post a post para revelar o rosto.
- **Alarme de Screenshots:** Em um PWA é impossível bloquear prints nativamente. A estratégia adota duas camadas complementares:
  - **Marca d'Água Dinâmica (Deterrent principal):** Toda imagem renderizada via frontend embute o `ID (hash)` do usuário que a está visualizando de forma invisível. Se vazar, o autor é rastreado e banido permanentemente.
  - **Detecção Heurística (Bônus):** Monitoramento via Page Visibility API (detecta quando o app perde foco) e atalhos de teclado suspeitos (PrtScn, Cmd+Shift+3/4) como camada secundária de alerta.

### 7.3 Modos de Ocultação
- **Modo Falso (Free):** Botão de emergência (panic button) que redireciona para uma tela de disfarce (Calculadora, Previsão do tempo). Disponível a todos como feature básica de segurança civil.
- **Estados de Visibilidade:** O usuário alterna entre três estados:
  1. `visible` (Padrão) — Visível para todos no radar, busca e recomendações.
  2. `invisible` (Premium) — Fica oculto de estranhos, mas visível para os amigos.
  3. `ghost` (Premium) — Torna o usuário totalmente invisível do radar, da busca e de recomendações. **Temporizador opcional:** o usuário pode programar a desativação automática (ex: "voltar ao normal em 2h").

---

## 8. Economia: Moeda Única (Closed-Loop)
**A decisão arquitetural mais importante para fugir da regulação bancária (KYC pesado).**

### 8.1 Regras de Ouro
- A plataforma opera uma Moeda Virtual unificada (que substitui XP solto e cobranças avulsas).
- **Zero Cash-out:** Usuários e criadores não podem sacar o dinheiro para Reais. 
- **Zero P2P:** Usuários não transferem moedas diretamente entre si. Só podem enviar "presentes comprados com moedas".

### 8.2 Fluxo Financeiro (In & Out)
- **Inflow (Entrada):**
  - Compra com dinheiro real (Mercado Pago).
  - Ganho via alto engajamento: Recompensas B2B, check-ins, conclusão de Desafios Semanais.
- **Outflow (Queima):**
  - **Match Boost:** Comprar 1 hora no topo do Swipe. (Premium ganha 1 grátis por semana).
  - **Presente Virtual:** Enviar emojis picantes no chat (custa moeda).
  - **Cupons B2B:** Trocar saldo por descontos em Casas/Motéis.

### 8.3 Pagamento de Assinatura (Híbrido)
- A assinatura Premium (R$29,90) pode ser paga em Reais.
- Os usuários engajados podem abater o valor com moedas acumuladas (Ex: R$14,90 + 1.500 moedas), valorizando o *grind*, mas garantindo que sempre exista um influxo financeiro real (a moeda nunca cobre 100% da mensalidade).

### 8.4 Assinatura de Presente (Gift Subscription)
- Vetor de receita validado: Um usuário pode comprar (com Moedas) um mês de Premium para outro usuário do qual tenha interesse, como "Super Icebreaker".

---

## 9. B2B, Gamificação e Moderação
### 9.1 Gamificação Funcional
- Sistema baseado em **Níveis e Badges**.
- Badges não são cosméticos; eles destravam permissões sistêmicas (Ex: "Badge de Criador" destrava publicação infinita de contos sem precisar pagar Premium).

### 9.2 B2B (Locais Parceiros)
- **Gestão no MVP:** Modelo de "Concierge". Os administradores da plataforma atualizam perfis de motéis e casas parceiras (evita construir painel B2B no dia 1).
- **Caça ao Tesouro:** O Parceiro paga a plataforma para ocultar um "tesouro geolocalizado". O usuário o coleta no mapa, ganhando Moedas Virtuais ou descontos reais no estabelecimento.
- **Cartão Fidelidade:** Integrado na Moeda Única.

### 9.3 Moderação e Comunidade
- **Moderação Híbrida (Report Lifecycle):** Denúncias geram um ticket. Uma IA (via API ou heurística de backend) faz a triagem inicial definindo um `confidence_score`. A sanção final de banimento exige review humano no Admin.
- **Anjo da Comunidade:** Usuários exemplares recebem esse selo do Administrador.
- **Júri Popular:** O Júri não avalia assédio ou denúncias individuais. O Júri Popular, composto apenas pelos `Anjos`, vota em disputas de normas ou mudanças na comunidade.
- **Fóruns e Comunidades (Estrutura Unificada):** Ambos utilizam a mesma fundação técnica (`Spaces`).
  - *Fórum:* Espaço aberto. Todo usuário navega e posta usando seu perfil principal.
  - *Comunidade Anônima:* Sub-fóruns onde o `User` atua sob um `Pseudônimo` exclusivo. O anonimato é garantido perante outros usuários, mas os moderadores do espaço acessam o Real ID por segurança.
- **Web of Trust (Verificado):** O cobiçado selo azul exige que 4 usuários reais atestem que a pessoa existe fisicamente (`Friendship category: real`). É uma verificação social e colaborativa, e não baseada em pagamento.

---

## 10. Notificações e Admin
### 10.1 Notificações (Strict Policy)
- **Push Restrito:** Para evitar fadiga de alertas, apenas 4 eventos disparam push:
  1. Nova mensagem de chat.
  2. Amigo nas proximidades (Raio ex: 1km).
  3. Check-in próximo (exibe o nome do local onde houve o check-in).
  4. Likes recebidos em *Batch* ("João e mais 3 curtiram seu perfil").
- **Infraestrutura de Entrega (Híbrida):** Mensagens de Chat utilizam **WebSockets** para tempo real (se o app estiver aberto). Demais alertas utilizam **Web Push API** nativo do PWA.
- **Configurações:** O usuário pode ativar/desativar cada um dos 4 tipos individualmente. **Não existe horário silencioso automático** (Quiet Hours) controlado pela plataforma.
- **Armazenamento:** Persistidas no SQLite com rotina de job cron para TTL de limpeza de 90 dias.
- **Coleta de Permissão:** Contextual. NUNCA pede permissão de notificação no load do app. Pede apenas no momento em que o primeiro evento notificável ocorrer.

### 10.2 Admin Dashboard (MVP Scope)
- Gestão manual de usuários (banimento, aprovação de contas throuple, tickets de moderação).
- CRUD de locais do catálogo.
- Métricas vitais: DAU, volume de matches, check-ins no dia, MRR das assinaturas.
- *Análise avançada de sentimento e portal self-service para B2B foram postergados para pós-MVP.*