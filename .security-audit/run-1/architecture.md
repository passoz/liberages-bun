# System Architecture & Security Reconnaissance

**Application:** Liberages (`liberages-bun`)
**Domain:** Private adult social network, geolocated radar, and dating app for the Brazilian liberal/swing community.
**Stack:** Bun 1.4+, Hono 4.13+, SQLite (`bun:sqlite`), Drizzle ORM 0.45+, Hono JSX templates, UUIDv7.
**Baseline Comparable:** Adult/kink social networks (e.g., FetLife, 3Fun, Pure, Feeld) and privacy-focused dating networks.

---

## 1. Overview & Trust Model

Liberages is a server-rendered (Hono JSX) mobile-first PWA social network prioritizing strict privacy, anonymity, and zero-leakage for the liberal/swinger community. It pairs social features (24h ephemeral Fotolog, Spaces/forums) with physical world interactions (curated radar with anonymous headcount, B2B geolocated treasure hunts, bucket-list icebreakers, and swipe decks).

### Actors & Roles
1. **Unauthenticated Public Visitor (`none`):** Can access `/`, `/login`, `/onboarding`, health checks, PWA manifests, and public assets.
2. **Soft-Gated Visitor (`soft`):** Has completed 18+ self-declaration. Allowed read-only exploration of feeds, maps, and profiles. Disallowed from posting or interacting.
3. **Hard-Gated Member (`hard`):** Completed document verification (only SHA-256 hash retained; image discarded). Granted full read/write privileges: posting to fotolog, sending check-ins, matching, chatting, and purchasing tokens.
4. **Account Types (`accountType`):**
   - `single`: Individual member profile.
   - `couple`: Indivisible profile operated jointly by two partners with a single shared PIN/login.
   - `throuple`: Three-person relationship requiring manual moderation.
5. **Privileged / Gamified Roles:**
   - `is_verified` (Blue Badge): Granted automatically via Web of Trust when 4 physical friends (`Friendship` with `category: "real"`) attest identity.
   - `is_angel`: Community angel with voting rights on community jury disputes.
   - `is_premium`: Unlimited swipe likes, ad-free experience, story publication privileges.
   - `xp_level`: Level 10+ unlocks publishing permissions.

---

## 2. Trust Boundaries & Authentication

### Entry Points
- External HTTP traffic reaches the Hono application directly (`src/index.ts`).
- Middleware order: `RequestID` -> `CORS` -> Route handlers.
- Session proof: `auth_token` HTTP cookie containing a signed HS256 JWT.
- Gate status: `gate` HTTP cookie (`none` | `soft` | `hard`).

### Trust Assumptions & Flaws Identified in Baseline Code
1. **PIN Authentication Fallback (`src/modules/identity/identity.service.ts` & `src/auth.ts`):**
   - When no stored PIN is found (or `userId` is omitted), `verifyPin` falls back to checking `pin === "1234"`.
   - Logging in without `userId` creates a valid session for `"user-session"`.
   - Supplying an arbitrary `userId` with a null DB pin allows authenticating as that user with `"1234"`.
   - Plaintext PIN storage in SQLite without cryptographic hashing or salting.
2. **Missing Rate Limiting / Brute Force Protection:**
   - 4-digit numeric PINs (10,000 combinations) are exposed to `/api/identity/login/pin` and `/api/login/pin`.
   - `createThrottleMiddleware` exists in `src/throttle.ts` but was never attached to actual route handlers. Furthermore, it trusts `X-Forwarded-For` blindly.
3. **Client-Controlled Authorization Flags (Privilege Escalation):**
   - `/api/social/swipe`: Accepts `isPremium` from client body/form, bypassing the 30 likes/day quota.
   - `/api/community/jury/vote`: Accepts `isAngel` directly from client body/form, bypassing Community Angel restriction.
   - `/api/community/stories`: Accepts `isPremium` and `xpLevel` directly from client body/form, bypassing story publication gating.
4. **Chat DM Authorization Bypass & Impersonation (`src/modules/chat/chat.routes.ts`):**
   - Reading conversation (`/api/chat/messages/:userA/:userB`) relies on untrusted `x-user-id` request header rather than the authenticated JWT cookie.
   - Sending messages (`/api/chat/messages`) accepts `fromUserId` in request body without verifying it matches the authenticated session user.
5. **Mercado Pago Webhook Forgery (`src/modules/economy/mercadopago.adapter.ts`):**
   - `/api/economy/wallet/webhook/mercadopago` accepts arbitrary JSON payloads without validating HMAC-SHA256 signature, secret token, or transaction idempotency.
   - Anyone can inject arbitrary token balances into any user's wallet.
6. **B2B Treasure Hunt Arbitrary Credit Injection (`src/modules/community/community.routes.ts`):**
   - `/api/community/treasure/claim` accepts `tokenReward` directly from untrusted client request without verifying catalog treasure definitions or reward constraints.
7. **Radar Check-in TTL Tampering (`src/modules/radar/radar.routes.ts`):**
   - `/api/radar/checkin` accepts `expiresAt` directly from client input, bypassing the 1h-4h TTL validation and enabling permanent radar poisoning.
8. **Ephemeral Media Race Condition & Leakage (`src/modules/chat/chat.repository.ts`):**
   - Ephemeral media consumption does not use atomic test-and-set queries; data remains stored in the database after being flagged consumed.

---

## 3. Input Surface Inventory

| Route | Method | Purpose | Input Source | Danger Sinks |
|---|---|---|---|---|
| `/api/identity/login/pin` | POST | PIN authentication | Body (`pin`, `userId`) | JWT issuance, DB lookup |
| `/api/login/pin` | POST | Legacy PIN login | Body (`pin`) | JWT issuance |
| `/api/identity/onboarding/soft` | POST | Soft gate activation | Body (`over18`) | Cookie set |
| `/api/identity/onboarding/hard` | POST | Age doc verification | Body (`docBase64`, `userId`) | SHA256 hash, DB update |
| `/api/radar/spots` | GET | List curated spots | None | DB select |
| `/api/radar/checkin` | POST | Venue check-in | Body (`spotId`, `ttlHours`, `userId`, `expiresAt`) | DB insert |
| `/api/radar/radar/:spotId` | GET | Anonymous headcount | Path (`spotId`) | DB query |
| `/api/social/fotolog/feed` | GET | Active 24h posts | None | DB select |
| `/api/social/fotolog` | POST | Post photo to fotolog | Body (`userId`, `imageUrl`, `faceShowEnabled`) | DB insert |
| `/api/social/swipe` | POST | Swipe action (like/skip) | Body (`fromUserId`, `toUserId`, `isPremium`, `category`) | DB insert, Daily quota |
| `/api/social/swipe/deck` | POST | Order deck by geo & fetiches | Body (`candidates`, `userFetishes`) | Memory sort |
| `/api/search/profiles` | GET | FTS5 profile search | Query (`q`) | SQLite FTS5 `MATCH` query |
| `/api/economy/wallet/:userId` | GET | Check token balance | Path (`userId`) | DB select |
| `/api/economy/wallet/webhook/mercadopago` | POST | Payment webhook | Body (`status`, `payerId`, `tokenUnits`, `data`) | DB update (Wallet balance) |
| `/api/chat/messages` | POST | Send private DM | Body (`fromUserId`, `toUserId`, `text`) | DB insert |
| `/api/chat/messages/:userA/:userB` | GET | Read conversation | Path params, Header `x-user-id` | DB select |
| `/api/chat/media` | POST | Upload ephemeral media | Body (`data`) | DB insert |
| `/api/chat/media/:id` | GET | Consume ephemeral media | Path (`id`) | DB select & update |
| `/api/community/spaces/post` | POST | Post to forum/anonymous space | Body (`spaceType`, `content`, `realUserId`, `communityPseudonym`, `userNickname`) | DB insert |
| `/api/community/spaces/posts` | GET | List space posts | None | DB select |
| `/api/community/jury/vote` | POST | Cast community jury vote | Body (`disputeId`, `userId`, `isAngel`, `vote`) | DB insert |
| `/api/community/wot/verify/:userId` | GET | Verify Web of Trust | Path (`userId`) | DB count |
| `/api/community/treasure/claim` | POST | Claim geolocated treasure | Body (`treasureId`, `spotId`, `userId`, `tokenReward`) | DB insert, Wallet balance |
| `/api/community/stories` | GET / POST | Read / Publish erotic stories | Body (`title`, `text`, `authorId`, `isPremium`, `xpLevel`) | DB select / DB insert |
| `/api/security/panic` | POST | Panic disguise redirect | None | Response |
| `/api/security/ghost` | POST | Ghost mode activation | Body (`userId`, `durationMinutes`, `expiresAt`) | In-memory store |
