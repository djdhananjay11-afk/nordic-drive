import assert from "node:assert/strict";
import test from "node:test";
import { releaseVehicles, vehiclePath } from "./release.js";

// Read-only catalogue checks and AI requests against a local production build.
const origin = "http://localhost:3000";
const curated = process.env.NORDICDRIVE_RELEASE_MODE === "curated";
const request = (path: string) =>
  fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(30000) });

test("root redirects to Norwegian", async () => {
  const response = await request("/");
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")!).pathname, "/no");
});

test("both locales render catalogue, comparison and every released detail and brand page", async () => {
  for (const locale of ["no", "en"]) {
    const paths = [
      "/",
      "/cars",
      "/electric-cars",
      "/compare",
      "/verified-cars",
      "/verified-compare",
      ...(!curated ? ["/ai", "/cars/tesla/model-y-long-range"] : []),
      ...releaseVehicles.flatMap((v) => [
        vehiclePath(v),
        ...(curated ? [`/brands/${v.brandSlug}`] : []),
      ]),
    ];
    for (const path of paths) {
      const response = await request(`/${locale}${path === "/" ? "" : path}`);
      assert.equal(response.status, 200, `${locale}${path}`);
      const html = await response.text();
      assert.ok(html.includes(`lang="${locale === "no" ? "nb-NO" : "en-NO"}"`), path);
      assert.ok(!html.includes("Internal Server Error"), path);
    }
  }
});

test("reviewed API remains distinct from the full catalogue", async () => {
  const response = await request("/api/catalogue");
  assert.equal(response.status, 200);
  const payload = (await response.json()) as { vehicles: { id: string; image: unknown }[] };
  for (const vehicle of releaseVehicles)
    assert.ok(payload.vehicles.some((v) => v.id === vehicle.id));
  if (!curated) {
    const search = await request("/api/cars/search?pageSize=24");
    assert.equal(search.status, 200);
    const listing = (await search.json()) as { data: { total: number } };
    assert.ok(listing.data.total > 40, "full catalogue must not shrink to the starter release");
    const ai = await fetch(new URL("/api/ai/recommendations", origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "EV under 400000 NOK", limit: 2 }),
      signal: AbortSignal.timeout(30000),
    });
    assert.equal(ai.status, 200);
    const result = (await ai.json()) as { recommendations: { priceNok: number; href: string }[] };
    assert.ok(result.recommendations.length > 0);
    assert.ok(result.recommendations.every((v) => v.priceNok <= 400000));
    for (const vehicle of result.recommendations)
      assert.equal((await request(`/no${vehicle.href}`)).status, 200);
    const semantic = await fetch(new URL("/api/ai/search", origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "EV under 400000 NOK", limit: 8 }),
      signal: AbortSignal.timeout(30000),
    });
    assert.equal(semantic.status, 200);
    const searchResults = (await semantic.json()) as { results: { car: { priceNok: number } }[] };
    assert.ok(searchResults.results.length > 0);
    assert.ok(searchResults.results.every((entry) => entry.car.priceNok <= 400000));
    return;
  }
  for (const path of ["/api/cars/search", "/api/home", "/api/compare", "/api/ai/recommendations"]) {
    const unavailable = await request(path);
    assert.equal(unavailable.status, 503, path);
    assert.match(unavailable.headers.get("cache-control") ?? "", /no-store/, path);
  }
  assert.equal((await request("/no/cars/tesla/model-y-long-range")).status, 404);
});

test("unauthenticated admin requests cannot pass the middleware", async () => {
  for (const path of ["/api/admin/cars", "/no/api/admin/cars", "/en/api/admin/cars"])
    assert.equal((await request(path)).status, 401, path);
  const page = await request("/admin");
  assert.equal(page.status, 307);
  assert.equal(new URL(page.headers.get("location")!).pathname, "/login");
});

test("health, social image and sitemap are reachable without leaking demo URLs", async () => {
  assert.equal((await request("/api/health")).status, 200);
  const image = await request("/opengraph-image");
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type") ?? "", /image\/png/);
  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.ok(xml.includes("hongqi/ehs5-exclusive-4wd"));
  if (curated) assert.ok(!xml.includes("tesla") && !xml.includes("/ai<"));
  else assert.ok(xml.includes("tesla") && xml.includes("/ai<"));
});
