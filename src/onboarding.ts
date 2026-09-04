import { Hono } from "hono";

export const onboardingApp = new Hono();

onboardingApp.get("/api/feed", (c) => c.json({ error: "denied" }, 403));
onboardingApp.post("/api/posts", (c) => c.json({ error: "denied" }, 403));
onboardingApp.post("/api/onboarding/soft", (c) => c.json({ ok: false }, 400));
onboardingApp.post("/api/onboarding/hard", (c) => c.json({ ok: false }, 400));
