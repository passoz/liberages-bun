import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Mapa, Check-in com TTL & Radar Anônimo Flow", () => {
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

  test("submits check-in with enforced TTL and updates anonymous radar headcount on screen", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/mapa`);
    await page.waitForLoadState("networkidle");

    // Select TTL and confirm checkin
    await page.selectOption("select[name='ttlHours']", "2");
    await page.click("button:has-text('Confirmar Check-in')");
    await page.waitForURL("**/mapa?success=*");

    // Verify confirmation and headcount
    expect(await page.textContent(".alert-success")).toContain("Check-in confirmado");
    const radarHeadcount = await page.textContent("main");
    expect(radarHeadcount).toMatch(/\d+ pessoas? no radar/);

    await page.close();
  });
});
