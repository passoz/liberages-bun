import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { app } from "../../src/index";

describe("E2E Playwright: Spaces & Anonymous Communities Flow", () => {
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

  test("posts to anonymous community and displays post under pseudonym on screen", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/spaces`);
    await page.waitForLoadState("networkidle");

    // Select anonymous community
    await page.selectOption("select[name='spaceType']", "anonymous_community");
    await page.fill("input[name='communityPseudonym']", "NocturnoE2E");
    await page.fill("textarea[name='content']", "Experiência única relatada no teste E2E!");
    await page.click("button:has-text('Publicar no Space')");
    await page.waitForURL("**/spaces?success=*");

    // Verify post rendered on the wall
    const wallContent = await page.textContent("main");
    expect(wallContent).toContain("NocturnoE2E");
    expect(wallContent).toContain("Experiência única relatada no teste E2E!");
    expect(wallContent).toContain("🔒 Anônimo");

    await page.close();
  });
});
