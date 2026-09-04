import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Closed-Loop Token Wallet Flow", () => {
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

  test("displays wallet balance and credits tokens via checkout form", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/carteira`);
    await page.waitForLoadState("networkidle");

    // Check header and balance text
    expect(await page.textContent("h1")).toContain("Minha Carteira");
    expect(await page.textContent(".card")).toContain("Tokens");

    // Click recharge
    await page.click("button:has-text('Recarregar 100 Tokens')");
    await page.waitForURL("**/carteira?success=*");

    // Verify confirmation and balance update
    expect(await page.textContent(".alert-success")).toContain("Tokens Creditados");

    await page.close();
  });
});
