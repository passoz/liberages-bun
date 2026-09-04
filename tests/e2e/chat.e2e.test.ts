import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Private Chat DMs Flow", () => {
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

  test("sends message in chat and renders conversation in the real browser UI", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/chat`);
    await page.waitForLoadState("networkidle");

    // Type and send message
    await page.fill("input[name='text']", "E2E Message: Olá, tudo bem?");
    await page.click("button:has-text('Enviar')");
    await page.waitForURL(`${baseUrl}/chat`);

    // Verify message bubble in DOM
    const chatContent = await page.textContent("main");
    expect(chatContent).toContain("E2E Message: Olá, tudo bem?");

    await page.close();
  });
});
