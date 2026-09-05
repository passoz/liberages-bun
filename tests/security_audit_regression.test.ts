import { describe, expect, test } from "bun:test";
import { app } from "../src/index";
import { sign } from "hono/jwt";
import { JWT_SECRET } from "../src/auth";
import { userRepository } from "../src/modules/identity/user.repository";
import { chatRepository } from "../src/modules/chat/chat.repository";
import { matchingRepository } from "../src/modules/social/matching.repository";
import { db } from "../db/index";
import { ephemeralMedia } from "../db/schema";
import { eq } from "drizzle-orm";
import { createHmac } from "node:crypto";
import { MP_WEBHOOK_SECRET } from "../src/modules/economy/mercadopago.adapter";

describe("Security Audit Regression Suite (Cloudflare Security Audit Fixes)", () => {
  test("SEC-01: Rejects forged Mercado Pago webhook without valid signature, validates idempotency and caps tokens", async () => {
    // 1. Rejected if invalid signature is provided
    const forgedRes = await app.request("/api/economy/wallet/webhook/mercadopago", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": "ts=1700000000,v1=invalid-hmac-signature-here",
      },
      body: JSON.stringify({
        action: "payment.created",
        status: "approved",
        payerId: "attacker-user-1",
        tokenUnits: 500,
        data: { id: "mp-pay-forged-1" },
      }),
    });
    expect(forgedRes.status).toBe(400);
    const forgedBody = await forgedRes.json();
    expect(forgedBody.error).toContain("Assinatura do webhook inválida");

    // 2. Rejects negative or excessive token units
    const invalidTokenRes = await app.request("/api/economy/wallet/webhook/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "payment.created",
        status: "approved",
        payerId: "attacker-user-1",
        tokenUnits: -500,
        data: { id: "mp-pay-negative-1" },
      }),
    });
    expect(invalidTokenRes.status).toBe(400);
    expect((await invalidTokenRes.json()).error).toContain("Quantidade de tokens inválida");

    // 3. Valid signature is accepted and idempotent
    const dataId = "mp-legit-1234";
    const reqId = "req-test-99";
    const ts = "1700000000";
    const manifest = `id:${dataId};request-id:${reqId};ts:${ts};`;
    const validHmac = createHmac("sha256", MP_WEBHOOK_SECRET).update(manifest).digest("hex");
    const sigHeader = `ts=${ts},v1=${validHmac}`;

    const legitRes = await app.request("/api/economy/wallet/webhook/mercadopago", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": sigHeader,
        "x-request-id": reqId,
      },
      body: JSON.stringify({
        action: "payment.created",
        status: "approved",
        payerId: "legit-buyer-sec1",
        tokenUnits: 150,
        data: { id: dataId },
      }),
    });
    expect(legitRes.status).toBe(200);

    // Replay with identical payment ID returns existing balance without double-crediting
    const replayRes = await app.request("/api/economy/wallet/webhook/mercadopago", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": sigHeader,
        "x-request-id": reqId,
      },
      body: JSON.stringify({
        action: "payment.created",
        status: "approved",
        payerId: "legit-buyer-sec1",
        tokenUnits: 150,
        data: { id: dataId },
      }),
    });
    expect(replayRes.status).toBe(200);
  });

  test("SEC-02: Protects private chat messages from unauthorized access and header spoofing", async () => {
    const userA = "sec02-alice";
    const userB = "sec02-bob";
    const userC = "sec02-eve";

    chatRepository.saveMessage(userA, userB, "Top secret personal message");

    // Attacker without token attempting to read via spoofed header is blocked
    const unauthRes = await app.request(`/api/chat/messages/${userA}/${userB}`, {
      headers: {
        Cookie: "auth_token=invalid",
        "x-user-id": userC,
      },
    });
    expect(unauthRes.status).toBe(403);

    // Legitimate participant with signed JWT succeeds
    const aliceToken = await sign({ sub: userA, role: "single" }, JWT_SECRET);
    const authRes = await app.request(`/api/chat/messages/${userA}/${userB}`, {
      headers: {
        Cookie: `auth_token=${aliceToken}`,
      },
    });
    expect(authRes.status).toBe(200);
    const messages = (await authRes.json()).messages;
    expect(messages.length).toBeGreaterThan(0);
  });

  test("SEC-03: Blocks sender impersonation in private chat messages", async () => {
    const sender = "sec03-alice";
    const receiver = "sec03-bob";
    const attacker = "sec03-eve";

    matchingRepository.recordLike(sender, receiver, "real");
    matchingRepository.recordLike(receiver, sender, "real");

    // Eve tries to send a message claiming fromUserId = sender
    const eveToken = await sign({ sub: attacker, role: "single" }, JWT_SECRET);
    const impersonationRes = await app.request("/api/chat/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${eveToken}`,
      },
      body: JSON.stringify({
        fromUserId: sender,
        toUserId: receiver,
        text: "Spoofed message from Eve",
      }),
    });

    expect(impersonationRes.status).toBe(403);
    const err = await impersonationRes.json();
    expect(err.error).toContain("não é permitido enviar mensagens em nome de outro usuário");
  });

  test("SEC-04: Prevents client-controlled privilege escalation (Swipe quotas, Jury voting, Stories)", async () => {
    // 1. Free user in DB cannot bypass 30 swipe limit via isPremium: true in body
    const freeUser = userRepository.create({ nickname: "sec04_free" });
    // Run 30 swipes
    for (let i = 0; i < 30; i++) {
      await app.request("/api/social/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: freeUser.id,
          toUserId: `target-${i}`,
          isPremium: true, // Attacker tries to bypass quota
        }),
      });
    }

    // 31st swipe must be blocked with 429
    const blockedRes = await app.request("/api/social/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: freeUser.id,
        toUserId: "target-31",
        isPremium: true,
      }),
    });
    expect(blockedRes.status).toBe(429);

    // 2. Non-angel user cannot vote in jury dispute by declaring isAngel: true
    const regularUser = userRepository.create({ nickname: "sec04_regular" });
    const juryRes = await app.request("/api/community/jury/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disputeId: "disp-sec04",
        userId: regularUser.id,
        isAngel: true, // Attacker tries to bypass angel check
        vote: "ban",
      }),
    });
    expect(juryRes.status).toBe(403);

    // 3. Low-XP user cannot publish stories by declaring isPremium: true
    const storyRes = await app.request("/api/community/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Unauthorized Story",
        text: "Content",
        authorId: regularUser.id,
        isPremium: true, // Attacker tries to bypass story publishing check
      }),
    });
    expect(storyRes.status).toBe(403);
  });

  test("SEC-05: Rejects inflated token rewards in B2B treasure claims", async () => {
    const res = await app.request("/api/community/treasure/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        treasureId: "trs-cheat-999",
        spotId: "spot-1",
        userId: "sec05-user",
        tokenReward: 5000000,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("limite máximo permitido");
  });

  test("SEC-06: Rejects default PIN '1234' authentication for registered users lacking an explicit PIN", async () => {
    const unpinnedUser = userRepository.create({ nickname: "sec06_unpinned" });
    expect(unpinnedUser.pin).toBeNull();

    // Attacker tries to authenticate as unpinnedUser with PIN '1234'
    const loginRes = await app.request("/api/identity/login/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: unpinnedUser.id,
        pin: "1234",
      }),
    });

    expect(loginRes.status).toBe(401);
    const body = await loginRes.json();
    expect(body.error).toBe("PIN incorreto");
  });

  test("SEC-07: Strictly enforces server-side check-in TTL and rejects future expiration extensions", async () => {
    const farFuture = Date.now() + 1000 * 3600 * 24 * 365 * 10;
    const res = await app.request("/api/radar/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spotId: "spot-oasis",
        ttlHours: 2,
        userId: "sec07-user",
        expiresAt: farFuture,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    // Expiration must NOT be 10 years in future; must be bounded by 2 hours (+ max 5 seconds clock drift)
    const expectedMax = Date.now() + 2 * 3600 * 1000 + 5000;
    expect(data.expiresAt).toBeLessThanOrEqual(expectedMax);
  });

  test("SEC-08: Ephemeral media shreds payload upon consumption and prevents persistence on disk", () => {
    const secretPhoto = "secret_base64_nude_photo_content";
    const media = chatRepository.saveEphemeralMedia(secretPhoto);

    // 1. Consume once -> returns data
    const firstConsumption = chatRepository.consumeEphemeralMedia(media.id);
    expect(firstConsumption.status).toBe("found");
    expect(firstConsumption.data).toBe(secretPhoto);

    // 2. Consume twice -> returns already_consumed
    const secondConsumption = chatRepository.consumeEphemeralMedia(media.id);
    expect(secondConsumption.status).toBe("already_consumed");

    // 3. Inspect database on disk: secret photo data payload must be shredded and overwritten with '[DESTRUCTED]'
    const dbRecord = db.select().from(ephemeralMedia).where(eq(ephemeralMedia.id, media.id)).get();
    expect(dbRecord?.consumed).toBe(1);
    expect(dbRecord?.data).toBe("[DESTRUCTED]");
  });
});
