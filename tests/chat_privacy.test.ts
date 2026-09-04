import { describe, expect, test } from "bun:test";
import { chatApp } from "../src/chat";

describe("Chat Privacy and Message Isolation (SC-001)", () => {
  test("allows participants to read conversation and rejects third-party access with HTTP 403", async () => {
    // 1. Participant (userA) reads conversation -> 200
    const participantRes = await chatApp.request("/api/chat/messages/userA/userB", {
      headers: { "x-user-id": "userA" },
    });
    expect(participantRes.status).toBe(200);

    // 2. Unauthorized third-party (userC) attempts to read userA & userB conversation -> 403
    const intruderRes = await chatApp.request("/api/chat/messages/userA/userB", {
      headers: { "x-user-id": "userC" },
    });
    expect(intruderRes.status).toBe(403);
  });
});
