import { describe, expect, test } from "bun:test";
import { app } from "../src/index";
import { searchService } from "../src/modules/search/search.service";

describe("Liberages Modular Monolith Full Application Integration", () => {
  test("responds to health checks /healthz and /readyz", async () => {
    const health = await app.request("/healthz");
    expect(health.status).toBe(200);

    const ready = await app.request("/readyz");
    expect(ready.status).toBe(200);
    const readyBody = await ready.json();
    expect(readyBody.status).toBe("ready");
    expect(readyBody.database).toBe("connected");
  });

  test("serves PWA manifest.json and sw.js", async () => {
    const manifest = await app.request("/manifest.json");
    expect(manifest.status).toBe(200);
    const manifestBody = await manifest.json();
    expect(manifestBody.name).toContain("Liberages");

    const sw = await app.request("/sw.js");
    expect(sw.status).toBe(200);
    const swText = await sw.text();
    expect(swText).toContain("CACHE_NAME");
  });

  test("renders all core SSR pages in pt-BR with navigation", async () => {
    for (const path of ["/feed", "/swipe", "/mapa", "/carteira", "/spaces", "/disfarce/calculadora"]) {
      const res = await app.request(path);
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text.length).toBeGreaterThan(100);
    }
  });

  test("executes global search with FTS5", async () => {
    searchService.indexProfile(
      "user-fts-alice",
      "AliceSensual",
      "Belo Horizonte",
      "bdsm swing submissao",
      "Explorando novos horizontes"
    );

    const searchRes = await app.request("/api/search?q=submissao");
    expect(searchRes.status).toBe(200);
    const searchData = await searchRes.json();
    expect(searchData.results.length).toBeGreaterThan(0);
    expect(searchData.results[0].nickname).toBe("AliceSensual");
  });

  test("processes Mercado Pago payment webhook and credits wallet", async () => {
    const res = await app.request("/api/economy/wallet/webhook/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "payment.created",
        status: "approved",
        payerId: "user-buyer-1",
        tokenUnits: 250,
        data: { id: "mp-pay-9999" },
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.newBalance).toBeGreaterThanOrEqual(250);
  });
});
