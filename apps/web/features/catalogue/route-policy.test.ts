import assert from "node:assert/strict";
import test from "node:test";
import { curatedRoutePolicy } from "./route-policy";

test("starter routes cannot leak the demo catalogue through public APIs or pages", () => {
  for (const path of [
    "/",
    "/cars",
    "/compare",
    "/brands/hongqi",
    "/api/catalogue",
    "/api/health",
    "/opengraph-image",
    "/admin/cars",
    "/api/admin/cars",
    "/api/auth/session",
    "/login",
  ])
    assert.equal(curatedRoutePolicy(path), "allow", path);
  for (const path of ["/api/cars", "/api/ai/recommendations", "/api/comparison"])
    assert.equal(curatedRoutePolicy(path), "unavailable", path);
  for (const path of ["/ai", "/launches", "/design-system"])
    assert.equal(curatedRoutePolicy(path), "redirect", path);
});
