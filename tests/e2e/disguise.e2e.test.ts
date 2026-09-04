import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Disfarce Calculator Flow", () => {
  let server: any;
  let browser: Browser;
  let baseUrl: string;

  beforeAll(async () => {
    server = Bun.serve({
      fetch: app.fetch,
      port: 0,
    });
    baseUrl = `http://localhost:${server.port}`;
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser?.close();
    server?.stop(true);
  });

  test("clicks panic button from feed and interacts with functional calculator", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/feed`);
    await page.waitForLoadState("networkidle");

    // Click panic button
    await page.click("a.panic-btn");
    await page.waitForURL("**/disfarce/calculadora");

    expect(page.url()).toContain("/disfarce/calculadora");
    const title = await page.title();
    expect(title).toBe("Calculadora");

    // Click button 7 on the calculator
    await page.click("button:has-text('7')");
    const display = await page.textContent("#disp");
    expect(display).toContain("7");

    await page.close();
  });
});
