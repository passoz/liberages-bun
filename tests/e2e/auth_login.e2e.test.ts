import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: PIN Authentication & Login Flow", () => {
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

  test("submits PIN via real browser form and redirects to authenticated dashboard", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState("networkidle");

    // Check page elements
    expect(await page.textContent("h2")).toContain("Acesso Rápido por PIN");

    // 1. Try wrong PIN
    await page.fill("#pin-input", "9999");
    await page.click("button[type='submit']");
    await page.waitForURL("**/login?error=*");
    expect(await page.textContent(".alert-error")).toContain("PIN incorreto");

    // 2. Submit correct PIN (1234)
    await page.fill("#pin-input", "1234");
    await page.click("button[type='submit']");
    await page.waitForURL(`${baseUrl}/`);

    // Verify redirected to dashboard and authenticated
    const bodyText = await page.textContent("main");
    expect(bodyText).toContain("Painel Liberages");

    await page.close();
  });
});
