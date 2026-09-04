import { describe, expect, test } from "bun:test";
import { mediaApp, registerEphemeralMedia } from "../src/media";

describe("Concurrent Ephemeral Access (EC-001)", () => {
  test("allows exactly one consumer when multiple requests hit concurrently", async () => {
    const mediaId = "media-concurrent-test";
    registerEphemeralMedia(mediaId, { data: "race-condition-target" });

    // Fire 5 concurrent requests
    const responses = await Promise.all([
      mediaApp.request(`/api/media/${mediaId}`),
      mediaApp.request(`/api/media/${mediaId}`),
      mediaApp.request(`/api/media/${mediaId}`),
      mediaApp.request(`/api/media/${mediaId}`),
      mediaApp.request(`/api/media/${mediaId}`),
    ]);

    const successCount = responses.filter((r) => r.status === 200).length;
    expect(successCount).toBe(1);
  });
});
