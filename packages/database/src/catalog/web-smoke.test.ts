import assert from "node:assert/strict";
import test from "node:test";
import { releaseVehicles, vehiclePath } from "./release.js";

// Read-only checks against a locally running snapshot-mode production build.
const origin = "http://localhost:3000";
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
      ...releaseVehicles.flatMap((v) => [vehiclePath(v), `/brands/${v.brandSlug}`]),
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

test("API exposes only the starter snapshot and legacy demo endpoints are unavailable", async () => {
  const response = await request("/api/catalogue");
  assert.equal(response.status, 200);
  const payload = (await response.json()) as { vehicles: { id: string; image: unknown }[] };
  assert.deepEqual(
    payload.vehicles.map((v) => v.id).sort(),
    releaseVehicles.map((v) => v.id).sort(),
  );
  assert.ok(payload.vehicles.every((v) => v.image === null));
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
  assert.ok(!xml.includes("tesla") && !xml.includes("/ai<"));
});
