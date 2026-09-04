import { describe, expect, test } from "bun:test";
import { chatApp } from "../src/chat";
import { recordLike } from "../src/matching";

describe("Private Chat DM between Matched Friends (FR-001)", () => {
  test("delivers message successfully between matched users and records message in conversation", async () => {
    // Establish mutual match
    recordLike("chat-user-1", "chat-user-2");
    recordLike("chat-user-2", "chat-user-1");

    const res = await chatApp.request("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "chat-user-1",
        to: "chat-user-2",
        text: "Oi, tudo bem?",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message.text).toBe("Oi, tudo bem?");
    expect(body.message.from).toBe("chat-user-1");
  });
});
