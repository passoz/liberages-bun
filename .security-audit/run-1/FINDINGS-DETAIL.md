# Findings Detail — Medium & Above Vulnerabilities

This document provides exact data flows, reproduction payloads, and impact analysis for all findings rated MEDIUM or above in `liberages-bun` (Run 1).

---

## SEC-01: Unauthenticated Arbitrary Wallet Credit via Forged Mercado Pago Webhook

- **Severity:** CRITICAL
- **Data Flow:**
  1. `src/modules/economy/economy.routes.ts:14` (`economyRoutes.post("/wallet/webhook/mercadopago")`)
     - Receives raw JSON payload from HTTP client without inspecting `x-signature` or bearer tokens.
  2. `src/modules/economy/mercadopago.adapter.ts:13` (`MercadoPagoAdapter.processWebhook`)
     - Checks `payload.status === "approved" || payload.action === "payment.created"`.
     - Extracts `payerId = payload.payerId || "user-default"` and `tokens = payload.tokenUnits || 100`.
     - Generates or extracts `paymentId = payload.data?.id || "mp-${Date.now()}"`.
     - Calls `economyService.creditFromPurchase(userId, tokens, paymentId)`.
  3. `src/modules/economy/economy.service.ts:9` (`EconomyService.creditFromPurchase`)
     - Forwards to `walletRepository.credit(userId, amount, "credit_mercadopago", ...)`.
  4. `src/modules/economy/wallet.repository.ts:15` (`WalletRepository.credit`)
     - Computes `newBalance = current + amount`.
     - Executes `db.update(wallets)` or `db.insert(wallets)` in SQLite.
     - Inserts transaction record into `wallet_transactions`.
- **Exact Trigger Request:**
  ```http
  POST /api/economy/wallet/webhook/mercadopago HTTP/1.1
  Host: localhost:3333
  Content-Type: application/json

  {
    "action": "payment.created",
    "status": "approved",
    "payerId": "attacker-target",
    "tokenUnits": 1000000,
    "data": {
      "id": "forged-payment-id-001"
    }
  }
  ```
- **What the Attacker Gets:**
  - `attacker-target` receives 1,000,000 tokens in their wallet immediately with HTTP 200 `{ "success": true, "newBalance": 1000000 }`.
- **Comparable Baseline:**
  - Platforms integrating Mercado Pago (e.g. e-commerce, digital games) compute HMAC-SHA256 over `x-signature` timestamp and payment ID using a private webhook secret, verify payment status via the Mercado Pago v1/payments API, and store processed payment IDs to guarantee idempotency.

---

## SEC-02: Private Chat DM History Exfiltration via Spoofed Request Header

- **Severity:** HIGH
- **Data Flow:**
  1. `src/modules/chat/chat.routes.ts:30` (`chatRoutes.get("/messages/:userA/:userB")`)
     - Extracts `userA` and `userB` from URL path parameters.
     - Reads `requester = c.req.header("x-user-id")`.
  2. `src/modules/chat/chat.routes.ts:35`
     - Evaluates `if (!requester || (requester !== userA && requester !== userB))`.
     - Because `requester` is directly controlled by the caller, setting `x-user-id: userA` satisfies the check.
  3. `src/modules/chat/chat.repository.ts:19` (`ChatRepository.getConversation`)
     - Queries `chat_messages` table in SQLite for all messages where `(from = userA AND to = userB) OR (from = userB AND to = userA)`.
     - Returns unredacted messages list to caller.
- **Exact Trigger Request:**
  ```http
  GET /api/chat/messages/victimA/victimB HTTP/1.1
  Host: localhost:3333
  x-user-id: victimA
  ```
- **What the Attacker Gets:**
  - Complete transcript of all private direct messages exchanged between `victimA` and `victimB`.
- **Comparable Baseline:**
  - Dating applications (Tinder, Feeld, Pure) authenticate chat requests strictly through the authenticated user's session token/cookie and verify server-side that `session.userId === userA || session.userId === userB`. Custom client headers are never trusted for authorization.

---

## SEC-03: Sender Impersonation in Private Chat Messages

- **Severity:** HIGH
- **Data Flow:**
  1. `src/modules/chat/chat.routes.ts:8` (`chatRoutes.post("/messages")`)
     - Parses JSON body `{ fromUserId, toUserId, text }`.
  2. `src/modules/chat/chat.routes.ts:17`
     - Checks `matchingRepository.hasLiked(fromUserId, toUserId)` and `matchingRepository.hasLiked(toUserId, fromUserId)`.
     - If both users are matched, `isFriend` evaluates to `true`.
  3. `src/modules/chat/chat.repository.ts:7` (`ChatRepository.saveMessage`)
     - Inserts record into `chat_messages` with `fromUserId = body.fromUserId`.
- **Exact Trigger Request:**
  ```http
  POST /api/chat/messages HTTP/1.1
  Host: localhost:3333
  Content-Type: application/json

  {
    "fromUserId": "alice",
    "toUserId": "bob",
    "text": "Hey Bob, let's meet up right now."
  }
  ```
- **What the Attacker Gets:**
  - Injects arbitrary messages into Alice and Bob's private conversation, appearing to have been sent by Alice.
- **Comparable Baseline:**
  - Secure messaging APIs ignore `fromUserId` in request payloads, deriving the sender identity strictly from the authenticated session.

---

## SEC-04: Client-Controlled Privilege Escalation in Swipe Quotas, Jury Voting, and Story Publishing

- **Severity:** HIGH
- **Data Flow:**
  1. `src/modules/social/social.routes.ts:41` & `src/matching.ts:78`
     - Client passes `isPremium: true` in `/api/social/swipe`.
     - Handler passes `!!isPremium` to `processSwipe`.
     - `processSwipe` skips quota check and increments likes indefinitely.
  2. `src/modules/community/community.routes.ts:40`
     - Client passes `isAngel: true` in `/api/community/jury/vote`.
     - Handler checks `if (!isAngel) return 403` and persists the jury vote to SQLite without verifying the user's actual badge.
  3. `src/modules/community/community.routes.ts:88`
     - Client passes `isPremium: true` or `xpLevel: 10` in `/api/community/stories`.
     - Handler allows story publication without verifying user profile in database.
- **Exact Trigger Request:**
  ```http
  POST /api/social/swipe HTTP/1.1
  Host: localhost:3333
  Content-Type: application/json

  {
    "fromUserId": "free-user",
    "toUserId": "target-user",
    "isPremium": true
  }
  ```
- **What the Attacker Gets:**
  - Unlimited daily swipes on Free tier; unauthorized votes on community jury disputes; publication of erotic stories without required tier or XP level.
- **Comparable Baseline:**
  - Subscription and role checks in web applications query the user's database record or read signed claims from a trusted JWT token.

---

## SEC-05: Client-Specified Token Reward Injection in B2B Treasure Claim

- **Severity:** HIGH
- **Data Flow:**
  1. `src/modules/community/community.routes.ts:63`
     - Parses `body = { treasureId, spotId, userId, tokenReward }`.
  2. `src/modules/community/community.routes.ts:76`
     - Calls `economyService.creditReward(userId, Number(tokenReward), ...)`.
  3. `src/modules/economy/wallet.repository.ts:15`
     - Credits `wallets` table by `Number(tokenReward)` directly.
- **Exact Trigger Request:**
  ```http
  POST /api/community/treasure/claim HTTP/1.1
  Host: localhost:3333
  Content-Type: application/json

  {
    "treasureId": "exploit-treasure",
    "spotId": "spot-oasis",
    "userId": "attacker-user",
    "tokenReward": 5000000
  }
  ```
- **What the Attacker Gets:**
  - 5,000,000 tokens credited directly to their wallet balance.
- **Comparable Baseline:**
  - Geolocated gamification systems (e.g. Pokémon GO, Munzee) look up the treasure/item on the server and award a pre-configured, immutable reward. The client never dictates the quantity or currency value.

---

## SEC-06: Default PIN Authentication Bypass for Unconfigured Accounts

- **Severity:** HIGH
- **Data Flow:**
  1. `src/modules/identity/identity.routes.ts:40`
     - Receives `userId` and `pin`.
  2. `src/modules/identity/user.repository.ts:19`
     - Finds user record in SQLite. If user has `pin: null`:
  3. `src/modules/identity/identity.service.ts:22` (`IdentityService.verifyPin`)
     - `if (!storedPin) return inputPin === "1234"` evaluates to `true`.
  4. `src/modules/identity/identity.routes.ts:64`
     - Signs JWT with `sub: user.id` and sets `auth_token` cookie.
- **Exact Trigger Request:**
  ```http
  POST /api/identity/login/pin HTTP/1.1
  Host: localhost:3333
  Content-Type: application/json

  {
    "userId": "victim-user-id",
    "pin": "1234"
  }
  ```
- **What the Attacker Gets:**
  - Valid signed JWT session authenticating as `victim-user-id`.
- **Comparable Baseline:**
  - User authentication mechanisms never fall back to global default credentials. If an account has not initialized credentials, login must fail with a prompt to complete onboarding.

---

## SEC-07: Radar Check-in TTL Tampering and Headcount Poisoning

- **Severity:** MEDIUM
- **Data Flow:**
  1. `src/modules/radar/radar.routes.ts:27`
     - Reads `expiresAt = body?.expiresAt ? Number(body.expiresAt) : undefined`.
  2. `src/modules/radar/radar.routes.ts:40`
     - Passes `expiresAt` to `checkinRepository.create(userId, spotId, ttlHours, expiresAt)`.
  3. `src/modules/radar/checkin.repository.ts:8`
     - `const expiresAt = customExpiresAt ?? (now + ttlHours * 3600 * 1000)` accepts `customExpiresAt`.
  4. `src/modules/radar/checkin.repository.ts:21`
     - Active headcount query checks `checkins.expiresAt > now`. The checkin remains active for years.
- **Exact Trigger Request:**
  ```http
  POST /api/radar/checkin HTTP/1.1
  Host: localhost:3333
  Content-Type: application/json

  {
    "spotId": "spot-oasis",
    "ttlHours": 2,
    "expiresAt": 2103997013408
  }
  ```
- **What the Attacker Gets:**
  - Permanent check-in record in SQLite that remains counted in `/api/radar/radar/:spotId` for 10+ years.
- **Comparable Baseline:**
  - Temporary check-in and proximity systems calculate TTL and expiration strictly server-side.

---

## SEC-08: Non-Atomic Ephemeral Media Consumption and Persistent Storage on Disk

- **Severity:** MEDIUM
- **Data Flow:**
  1. `src/modules/chat/chat.routes.ts:53`
     - Invokes `consumeEphemeralMedia(id)`.
  2. `src/modules/chat/chat.repository.ts:44`
     - Executes `db.select().from(ephemeralMedia).where(eq(ephemeralMedia.id, id)).get()`.
  3. `src/modules/chat/chat.repository.ts:49`
     - Executes `db.update(ephemeralMedia).set({ consumed: 1 }).where(eq(ephemeralMedia.id, id)).run()`.
     - Two concurrent requests read `consumed === 0` before the update executes.
     - The media content `data` is never deleted or overwritten, remaining in SQLite indefinitely.
- **Exact Trigger Request:**
  ```http
  GET /api/chat/media/<media-id> HTTP/1.1
  ```
- **What the Attacker Gets:**
  - Ephemeral media can be captured via concurrent reads and persists on disk storage/backups.
- **Comparable Baseline:**
  - Ephemeral photo services (e.g. Snapchat, Signal view-once) perform atomic test-and-set deletion and shred the media file from disk upon first access.
