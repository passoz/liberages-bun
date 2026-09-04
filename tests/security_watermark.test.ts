import { describe, expect, test } from "bun:test";
import { securityApp, generateViewerWatermark } from "../src/security";
import { createHash } from "node:crypto";

describe("Dynamic Invisible Watermark (FR-002)", () => {
  test("embeds viewer hash watermark metadata to trace image leaks", async () => {
    const viewerId = "viewer-user-999";
    const expectedHash = createHash("sha256").update(viewerId).digest("hex").slice(0, 16);

    // 1. Direct generator test
    const watermark = generateViewerWatermark(viewerId);
    expect(watermark).toBe(expectedHash);

    // 2. Image response metadata test
    const res = await securityApp.request("/api/image/img-123", {
      headers: { "x-user-id": viewerId },
    });

    expect(res.status).toBe(200);
    const watermarkHeader = res.headers.get("x-viewer-watermark");
    expect(watermarkHeader).toBe(expectedHash);
  });
});
