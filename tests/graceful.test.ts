import { describe, expect, test } from "bun:test";
import { gracefulShutdown } from "../src/server";

describe("Graceful Shutdown (QR-001)", () => {
  test("terminates connections within 10s grace timeout", async () => {
    const start = Date.now();
    const result = await gracefulShutdown(10000);
    const duration = Date.now() - start;

    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(10000);
  });
});
