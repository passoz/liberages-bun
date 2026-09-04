import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Fotolog 24h & Privacy Blur Flow", () => {
  let server: any;
  let browser: Browser;
  let baseUrl: string;

  beforeAll(async () => {
    server = Bun.serve({ fetch: app.fetch, port: 0 });
    baseUrl = `http://localhost:${server.port}`;
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser?.close();
    server?.stop(true);
  });

  test("posts photo in fotolog with facial blur by default, and reveals face on opt-out", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/feed`);
    await page.waitForLoadState("networkidle");

    // 1. Post photo with default blur (opt-out not checked)
    await page.fill("input[name='imageUrl']", "https://picsum.photos/400/400?blur=1");
    await page.click("button:has-text('Postar Foto de Hoje')");
    await page.waitForURL("**/feed?success=*");

    expect(await page.textContent("main")).toContain("Foto publicada por 24h");
    expect(await page.textContent("main")).toContain("Rosto com Blur");

    // 2. Post photo with explicit opt-out to reveal face
    await page.fill("input[name='imageUrl']", "https://picsum.photos/400/400?revealed=1");
    await page.check("input[name='faceShowEnabled']");
    await page.click("button:has-text('Postar Foto de Hoje')");
    await page.waitForURL("**/feed?success=*");

    expect(await page.textContent("main")).toContain("Rosto Revelado");

    await page.close();
  });
});
