# Security Audit Report — Liberages (`liberages-bun`)

**Target:** Liberages Modular Monolith (`liberages-bun`)  
**Audit Run:** Run 1  
**Methodology:** Cloudflare Security Audit & Vulnerability Hunting Standard  
**Date:** September 2025  
**Auditor:** Automated Senior Application Security Engineer  

---

## Executive Summary

Liberages demonstrates a strong structural foundation with modern architecture choices (Bun, Hono, Drizzle, UUIDv7, SQLite WAL mode, parameterized SQL queries, and automatic HTML output escaping via Hono JSX). However, the application suffers from critical gaps at the authorization and trust boundaries. Specifically, payment webhooks lack cryptographic signature verification, allowing unauthenticated infinite token creation; private chat endpoints rely on client-spoofed headers and unauthenticated sender parameters, allowing conversation exfiltration and impersonation; multiple business features accept client-supplied role flags (`isPremium`, `isAngel`, `xpLevel`), defeating monetization and governance models; and the identity module contains a hardcoded fallback PIN (`"1234"`) that enables account takeover for any profile without an explicitly configured PIN. Addressing these systemic session-binding and input-validation issues is necessary before production deployment.

---

## Baseline Comparable

**Comparable Applications:** Privacy-centric adult social networks and kink/swinger dating platforms (e.g., FetLife, 3Fun, Pure, Feeld).  
**Baseline Expectation:** In adult and liberal dating networks, privacy, pseudonymity, and confidentiality are existential requirements. Leaking chat logs or allowing unauthorized account access carries severe real-world reputational and personal safety risks. Comparables enforce strict server-side authorization on all direct messages, reject unauthenticated payment webhooks with cryptographic HMAC signatures, and never allow client-declared role overrides.

---

## Findings Summary

| ID | Severity | Title | Affected Component |
|---|---|---|---|
| **SEC-01** | **CRITICAL** | Unauthenticated Arbitrary Wallet Credit via Forged Mercado Pago Webhook | `src/modules/economy/mercadopago.adapter.ts` |
| **SEC-02** | **HIGH** | Private Chat DM History Exfiltration via Spoofed Request Header | `src/modules/chat/chat.routes.ts` |
| **SEC-03** | **HIGH** | Sender Impersonation in Private Chat Messages | `src/modules/chat/chat.routes.ts` |
| **SEC-04** | **HIGH** | Client-Controlled Privilege Escalation (Swipe Quotas, Jury, Stories) | `src/modules/social/` & `src/modules/community/` |
| **SEC-05** | **HIGH** | Client-Specified Token Reward Injection in B2B Treasure Claim | `src/modules/community/community.routes.ts` |
| **SEC-06** | **HIGH** | Default PIN Authentication Bypass for Unconfigured Accounts | `src/modules/identity/identity.service.ts` |
| **SEC-07** | **MEDIUM** | Radar Check-in TTL Tampering and Headcount Poisoning | `src/modules/radar/radar.routes.ts` |
| **SEC-08** | **MEDIUM** | Non-Atomic Ephemeral Media Consumption and Persistent Storage on Disk | `src/modules/chat/chat.repository.ts` |

---

## Detailed Findings

### SEC-01: Unauthenticated Arbitrary Wallet Credit via Forged Mercado Pago Webhook
- **Severity:** CRITICAL
- **File:** `src/modules/economy/mercadopago.adapter.ts` (lines 13-28), `src/modules/economy/economy.routes.ts` (lines 14-23)
- **Concrete Attack Scenario:** An external attacker sends an unauthenticated HTTP POST request to `/api/economy/wallet/webhook/mercadopago` with JSON body `{"status":"approved","payerId":"attacker-id","tokenUnits":1000000}`. The server checks `status === "approved"` and immediately credits 1,000,000 tokens to `attacker-id`.
- **Impact:** Infinite currency creation in the platform's closed-loop token wallet, completely destroying platform monetization.
- **Recommended Fix:** Require HMAC-SHA256 signature verification on the `x-signature` header using a shared secret. Validate that token quantities match server-cataloged packages and enforce transaction idempotency.

### SEC-02: Private Chat DM History Exfiltration via Spoofed Request Header
- **Severity:** HIGH
- **File:** `src/modules/chat/chat.routes.ts` (lines 30-41)
- **Concrete Attack Scenario:** An attacker sends `GET /api/chat/messages/victimA/victimB` with HTTP request header `x-user-id: victimA`. The endpoint checks `requester === userA || requester === userB` using the unverified request header and returns the full conversation transcript.
- **Impact:** Total privacy breach of confidential adult communications between matched members.
- **Recommended Fix:** Remove reliance on `x-user-id` header; authenticate requests strictly via the signed `auth_token` JWT cookie, ensuring `jwtPayload.sub === userA || jwtPayload.sub === userB`.

### SEC-03: Sender Impersonation in Private Chat Messages
- **Severity:** HIGH
- **File:** `src/modules/chat/chat.routes.ts` (lines 8-27)
- **Concrete Attack Scenario:** An attacker posts to `/api/chat/messages` with `{"fromUserId":"alice","toUserId":"bob","text":"fabricated message"}`. Because Alice and Bob are mutual friends, the server allows the message and records it into the conversation as sent by Alice without validating that the session belongs to Alice.
- **Impact:** Malicious message fabrication, harassment, and social engineering in private chats.
- **Recommended Fix:** Bind `fromUserId` directly to `jwtPayload.sub` from the verified session token.

### SEC-04: Client-Controlled Privilege Escalation (Swipe Quotas, Jury Voting, Story Publishing)
- **Severity:** HIGH
- **File:** `src/modules/social/social.routes.ts` (line 45), `src/modules/community/community.routes.ts` (lines 41, 89)
- **Concrete Attack Scenario:** Free users submit `isPremium: true` in `/api/social/swipe` to bypass the 30-likes daily quota. Users submit `isAngel: true` in `/api/community/jury/vote` to vote on community jury disputes. Users submit `isPremium: true` in `/api/community/stories` to publish erotic stories.
- **Impact:** Defeats subscription paywalls and corrupts community governance integrity.
- **Recommended Fix:** Always resolve user permissions (`isPremium`, `isAngel`, `xpLevel`) from the database record associated with the authenticated session user.

### SEC-05: Client-Specified Token Reward Injection in B2B Treasure Claim
- **Severity:** HIGH
- **File:** `src/modules/community/community.routes.ts` (lines 63-79)
- **Concrete Attack Scenario:** An attacker sends `POST /api/community/treasure/claim` with `{"treasureId":"exploit","spotId":"oasis","userId":"attacker","tokenReward":5000000}`. The server credits 5,000,000 tokens without checking if the treasure exists or what reward is configured.
- **Impact:** Arbitrary wallet balance generation without paying.
- **Recommended Fix:** Maintain an authorized server catalog of active treasures with fixed reward amounts. Discard client-provided reward values.

### SEC-06: Default PIN Authentication Bypass for Unconfigured Accounts
- **Severity:** HIGH
- **File:** `src/modules/identity/identity.service.ts` (lines 22-25), `src/modules/identity/identity.routes.ts` (lines 40-74)
- **Concrete Attack Scenario:** When a user account is created without a PIN (`pin === null`), calling `/api/identity/login/pin` with `{ "userId": victimId, "pin": "1234" }` evaluates `verifyPin(null, "1234") === true` and issues a valid session JWT for the victim.
- **Impact:** Complete account takeover of any user lacking an explicitly registered PIN.
- **Recommended Fix:** Reject PIN login if no PIN is registered. Hash PINs with SHA-256 and salt. Apply rate limiting to login endpoints.

### SEC-07: Radar Check-in TTL Tampering and Headcount Poisoning
- **Severity:** MEDIUM
- **File:** `src/modules/radar/radar.routes.ts` (lines 27-50), `src/modules/radar/checkin.repository.ts` (lines 7-18)
- **Concrete Attack Scenario:** A client submits `expiresAt: 2103997013408` (10 years in the future) to `/api/radar/checkin`. The custom timestamp overrides the 1h-4h TTL validation, permanently incrementing venue headcount.
- **Impact:** Indefinite corruption of real-time venue radar headcount and analytics.
- **Recommended Fix:** Strip the client-controlled `expiresAt` parameter from the public API route. Calculate expiration strictly as `Date.now() + ttlHours * 3600 * 1000`.

### SEC-08: Non-Atomic Ephemeral Media Consumption and Persistent Storage on Disk
- **Severity:** MEDIUM
- **File:** `src/modules/chat/chat.repository.ts` (lines 43-51)
- **Concrete Attack Scenario:** Ephemeral media consumption executes a non-atomic `SELECT` followed by `UPDATE`. Furthermore, setting `consumed = 1` retains the sensitive media payload on SQLite storage permanently.
- **Impact:** Ephemeral media can be retrieved concurrently and persists indefinitely on disk/backups, violating the single-view privacy guarantee.
- **Recommended Fix:** Use an atomic conditional query (`UPDATE ephemeral_media SET consumed = 1, data = '[DESTRUCTED]' WHERE id = ? AND consumed = 0`) to shred media data immediately upon first consumption.

---

## Positive Patterns & Strengths
1. **SQL Injection Defense:** All SQLite queries throughout Drizzle ORM and direct SQLite statements use parameterized placeholders (`?`). FTS5 queries sanitize search tokens before binding.
2. **XSS Protection:** Hono JSX templates automatically escape interpolated strings by default, preventing reflected and stored cross-site scripting in HTML views.
3. **No Dangerous Sinks:** Zero use of `eval()`, `child_process.exec()`, `Bun.spawn()`, or dynamic path traversal sinks.
4. **Anonymized Age Verification:** The hard-gate onboarding flow computes a SHA-256 hash of documents and discards raw identity images immediately, aligning with data privacy best practices.

---

## Hardening Notes (Defense-in-Depth)
1. **Cookie Security:** Set `secure: true` on authentication cookies in production (over HTTPS), and specify `sameSite: "Strict"` where navigation allows.
2. **Rate Limiting:** Enforce distributed rate limiting on all public API routes to mitigate credential stuffing and denial of service.
3. **JWT Secret Rotation:** Ensure `JWT_SECRET` is supplied from an external secrets manager in production with at least 256 bits of entropy.
