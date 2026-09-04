import { describe, expect, test } from "bun:test";
import { mediaApp, registerEphemeralMedia } from "../src/media";

describe("Ephemeral Media / Destructive Selfie (FR-001)", () => {
  test("allows first access and returns 410 on second access", async () => {
    const mediaId = "media-unique-123";
    registerEphemeralMedia(mediaId, { data: "secret-selfie" });

    const firstRes = await mediaApp.request(`/api/media/${mediaId}`);
    expect(firstRes.status).toBe(200);

    const secondRes = await mediaApp.request(`/api/media/${mediaId}`);
    expect(secondRes.status).toBe(410);
  });
});
