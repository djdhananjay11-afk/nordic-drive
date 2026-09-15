export function curatedRoutePolicy(path: string): "allow" | "unavailable" | "redirect" {
  if (path === "/opengraph-image" || path.startsWith("/opengraph-image/")) return "allow";
  if (/^\/(admin|api\/admin|api\/auth|api\/monitoring)(\/|$)/.test(path)) return "allow";
  if (path === "/api/catalogue" || path === "/api/health") return "allow";
  if (path.startsWith("/api/")) return "unavailable";
  if (
    path === "/" ||
    /^\/(cars|brands|compare|electric-cars|disclaimer|privacy|terms|auth|login)(\/|$)/.test(path)
  )
    return "allow";
  return "redirect";
}
