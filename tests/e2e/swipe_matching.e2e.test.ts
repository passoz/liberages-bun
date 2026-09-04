import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Swipe Deck & Matching Flow", () => {
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

  test("interacts with swipe card and records like in the browser UI", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/swipe`);
    await page.waitForLoadState("networkidle");

    // Verify candidate card
    expect(await page.textContent(".card")).toContain("CasalExploradorSP");
    expect(await page.textContent(".card")).toContain("85% de Afinidade");

    // Click Like button
    await page.click("button:has-text('Curtir (Like)')");
    await page.waitForURL("**/swipe?liked=true*");

    // Verify alert message in DOM
    expect(await page.textContent(".alert-success")).toContain("Like registrado com sucesso!");

    await page.close();
  });
});
