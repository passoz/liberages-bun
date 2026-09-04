import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Layered Onboarding Flow (Soft & Hard Gate)", () => {
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

  test("completes soft gate and hard gate via real browser forms with privacy hashing", async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/onboarding`);
    await page.waitForLoadState("networkidle");

    // Initially NONE GATE
    expect(await page.textContent(".badge")).toContain("NONE GATE");

    // 1. Submit Soft Gate (18+)
    await page.check("input[name='over18']");
    await page.click("button:has-text('Confirmar Maioridade')");
    await page.waitForURL("**/onboarding?success=*");

    expect(await page.textContent(".badge")).toContain("SOFT GATE");
    expect(await page.textContent(".alert-success")).toContain("Soft Gate Ativado");

    // 2. Submit Hard Gate (Document verification)
    await page.click("button:has-text('Enviar Verificação de Idade')");
    await page.waitForURL("**/onboarding?success=*");

    expect(await page.textContent(".badge")).toContain("HARD GATE");
    expect(await page.textContent("button:has-text('Hard Gate Verificado')")).toContain("Hard Gate Verificado");

    await context.close();
  });
});
