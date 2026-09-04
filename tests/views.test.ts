import { describe, expect, test } from "bun:test";
import { viewsApp } from "../src/views";

describe("MVP SSR Views in pt-BR (FR-010)", () => {
  test("renders all core MVP views with HTTP 200 in pt-BR", async () => {
    // 1. Feed View
    const feedRes = await viewsApp.request("/feed");
    expect(feedRes.status).toBe(200);
    const feedHtml = await feedRes.text();
    expect(feedHtml).toContain("Feed Social");

    // 2. Swipe Deck View
    const swipeRes = await viewsApp.request("/swipe");
    expect(swipeRes.status).toBe(200);
    const swipeHtml = await swipeRes.text();
    expect(swipeHtml).toContain("Encontros");

    // 3. Map & Radar View
    const mapRes = await viewsApp.request("/mapa");
    expect(mapRes.status).toBe(200);
    const mapHtml = await mapRes.text();
    expect(mapHtml).toContain("Mapa & Radar");

    // 4. Wallet View
    const walletRes = await viewsApp.request("/carteira");
    expect(walletRes.status).toBe(200);
    const walletHtml = await walletRes.text();
    expect(walletHtml).toContain("Minha Carteira");
  });
});
