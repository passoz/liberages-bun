import { describe, expect, test } from "bun:test";
import { spacesApp } from "../src/spaces";

describe("Unified Spaces: Forums vs Anonymous Communities (FR-004)", () => {
  test("posts under main profile in open forums and under exclusive pseudonym in anonymous communities", async () => {
    // 1. Open Forum Post (SPEC section 9.3: Todo usuário navega e posta usando seu perfil principal)
    const forumRes = await spacesApp.request("/api/spaces/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spaceType: "forum",
        realUserId: "user-alice-123",
        userNickname: "AliceLiberal",
        content: "Relato aberto sobre experiência",
      }),
    });
    expect(forumRes.status).toBe(200);
    const forumData = await forumRes.json();
    expect(forumData.authorDisplayed).toBe("AliceLiberal");

    // 2. Anonymous Community Post (SPEC section 9.3: Atua sob um Pseudônimo exclusivo)
    const anonRes = await spacesApp.request("/api/spaces/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spaceType: "anonymous_community",
        realUserId: "user-alice-123",
        communityPseudonym: "MisterioX",
        content: "Desabafo anônimo",
      }),
    });
    expect(anonRes.status).toBe(200);
    const anonData = await anonRes.json();
    expect(anonData.authorDisplayed).toBe("MisterioX");
    expect(anonData.authorDisplayed).not.toBe("user-alice-123");
  });
});
