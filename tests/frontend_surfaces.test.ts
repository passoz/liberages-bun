import { describe, expect, test } from "bun:test";
import { app } from "../src/index";

describe("Frontend Surfaces End-to-End Functionality", () => {
  test("1. Login Page: renders PIN keypad and authenticates via form submission", async () => {
    // GET /login renders form
    const page = await app.request("/login");
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain("Acesso Rápido por PIN");
    expect(html).toContain("name=\"pin\"");

    // Form submission with valid PIN
    const formData = new FormData();
    formData.append("pin", "1234");
    const loginRes = await app.request("/api/identity/login/pin", {
      method: "POST",
      body: formData,
    });
    // Redirects to / on success
    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.get("location")).toBe("/");
    expect(loginRes.headers.get("set-cookie")).toContain("auth_token=");
  });

  test("2. Onboarding Page: transitions from none to soft and hard gate via forms", async () => {
    // GET /onboarding
    const page = await app.request("/onboarding");
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("Onboarding em Camadas");

    // Submit Soft Gate (18+)
    const softForm = new FormData();
    softForm.append("over18", "true");
    const softRes = await app.request("/api/identity/onboarding/soft", {
      method: "POST",
      body: softForm,
    });
    expect(softRes.status).toBe(302);
    const softCookie = softRes.headers.get("set-cookie") || "";
    expect(softCookie).toContain("gate=soft");

    // Submit Hard Gate (document verification)
    const hardForm = new FormData();
    hardForm.append("docBase64", "my-valid-identity-document");
    const hardRes = await app.request("/api/identity/onboarding/hard", {
      method: "POST",
      headers: { Cookie: softCookie },
      body: hardForm,
    });
    expect(hardRes.status).toBe(302);
    const hardCookie = hardRes.headers.get("set-cookie") || "";
    expect(hardCookie).toContain("gate=hard");
  });

  test("3. Fotolog Feed: posts photo via form and renders it in active feed", async () => {
    const postForm = new FormData();
    postForm.append("userId", "fotolog-user");
    postForm.append("imageUrl", "https://images.liberages.com/daily-photo-1.jpg");
    postForm.append("faceShowEnabled", "true");

    const submitRes = await app.request("/api/social/fotolog", {
      method: "POST",
      body: postForm,
    });
    expect(submitRes.status).toBe(302);

    const feedPage = await app.request("/feed");
    expect(feedPage.status).toBe(200);
    const feedHtml = await feedPage.text();
    expect(feedHtml).toContain("daily-photo-1.jpg");
    expect(feedHtml).toContain("Rosto Revelado");
  });

  test("4. Swipe Deck: processes swipe interactions via form", async () => {
    const swipeForm = new FormData();
    swipeForm.append("fromUserId", "swipe-user-alpha");
    swipeForm.append("toUserId", "swipe-target-beta");
    swipeForm.append("category", "real");

    const res = await app.request("/api/social/swipe", {
      method: "POST",
      body: swipeForm,
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("/swipe?liked=true");

    // Page displays success alert
    const page = await app.request("/swipe?liked=true");
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("Like registrado com sucesso!");
  });

  test("5. Mapa & Radar: submits check-in and updates live headcount", async () => {
    const checkinForm = new FormData();
    checkinForm.append("spotId", "motel-oasis");
    checkinForm.append("ttlHours", "2");
    checkinForm.append("userId", "map-tester");

    const res = await app.request("/api/radar/checkin", {
      method: "POST",
      body: checkinForm,
    });
    expect(res.status).toBe(302);

    // GET /mapa renders live headcount
    const mapPage = await app.request("/mapa");
    expect(mapPage.status).toBe(200);
    const mapHtml = await mapPage.text();
    expect(mapHtml).toContain("Motel Oasis");
    expect(mapHtml).toMatch(/\d+ pessoas? no radar/);
  });

  test("6. Minha Carteira: simulates recharge and updates token balance in UI", async () => {
    const rechargeForm = new FormData();
    rechargeForm.append("tokens", "100");

    const res = await app.request("/carteira/recharge", {
      method: "POST",
      body: rechargeForm,
    });
    expect(res.status).toBe(302);

    // GET /carteira renders updated balance
    const walletPage = await app.request("/carteira");
    expect(walletPage.status).toBe(200);
    const walletHtml = await walletPage.text();
    expect(walletHtml).toContain("Tokens");
    expect(walletHtml).toContain("Saldo Disponível");
  });

  test("7. Chat DM UI: sends message and displays conversation", async () => {
    const chatForm = new FormData();
    chatForm.append("text", "Olá! Adorei seu perfil.");

    const res = await app.request("/chat/send", {
      method: "POST",
      body: chatForm,
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/chat");

    const chatPage = await app.request("/chat");
    expect(chatPage.status).toBe(200);
    const chatHtml = await chatPage.text();
    expect(chatHtml).toContain("Olá! Adorei seu perfil.");
  });

  test("8. Spaces & Comunidades: posts to anonymous community and displays post", async () => {
    const spaceForm = new FormData();
    spaceForm.append("spaceType", "anonymous_community");
    spaceForm.append("communityPseudonym", "SombraDaNoite");
    spaceForm.append("content", "Primeira vez em um clube liberal. Foi incrível!");

    const res = await app.request("/api/community/spaces/post", {
      method: "POST",
      body: spaceForm,
    });
    expect(res.status).toBe(302);

    const spacesPage = await app.request("/spaces");
    expect(spacesPage.status).toBe(200);
    const spacesHtml = await spacesPage.text();
    expect(spacesHtml).toContain("SombraDaNoite");
    expect(spacesHtml).toContain("Primeira vez em um clube liberal");
  });

  test("9. Modo Falso: renders calculator disguise page", async () => {
    const page = await app.request("/disfarce/calculadora");
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain("Calculadora");
    expect(html).toContain("disp");
  });
});
