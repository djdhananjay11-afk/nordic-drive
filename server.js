const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dbPath = path.join(root, "data", "cars-db.json");
const vehicleImageRoot = path.join(root, "apps", "web", "public", "vehicle-images");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  db.meta.updatedAt = new Date().toISOString();
  fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function parseBoolean(value) {
  return value === "true" || value === "1" || value === true;
}

function scoreCar(car) {
  return (
    Number(car.rangeKm || 0) * 1.8 +
    Number(car.bootLiters || 0) * 0.8 +
    Number(car.towKg || 0) * 0.35 +
    (car.awd ? 260 : 0) -
    Number(car.priceNok || 650000) / 1600
  );
}

function listVehicleAssets() {
  try {
    return fs
      .readdirSync(vehicleImageRoot)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => ({
        file,
        publicPath: `/apps/web/public/vehicle-images/${file}`,
        slug: file.replace(/\.svg$/i, ""),
      }));
  } catch {
    return [];
  }
}

const vehicleAssets = listVehicleAssets();

const explicitImageMap = {
  "tesla-model-y-2025": "tesla-model-y-long-range",
  "tesla-model-3-2023": "tesla-model-3-long-range",
  "volvo-ex30": "volvo-ex30-single-motor-extended-range",
  "volvo-ex90": "volvo-ex90-twin-motor",
  "volvo-c40": "volvo-ec40-twin-motor",
  "skoda-enyaq-85x": null,
  "hyundai-ioniq-5-awd": "hyundai-ioniq-5-awd",
  "hyundai-ioniq-6": "hyundai-ioniq-6-awd",
  "hyundai-kona-2024": "hyundai-kona-electric",
  "hyundai-inster": "hyundai-inster",
  "bmw-i4-edrive40": "bmw-i4-edrive40-gran-coupe",
  "bmw-i5": "bmw-i5-edrive-active-edition",
  "bmw-i7": "bmw-i7-xdrive60",
  "bmw-ix1": "bmw-ix1-edrive20",
  "bmw-ix2": "bmw-ix2-xdrive30",
  "volkswagen-id7-tourer-pro-s": null,
  "volkswagen-id7": null,
  "volkswagen-id5-gtx": null,
  "volkswagen-id-buzz": null,
  "kia-ev9": "kia-ev9-gt-line-awd",
  "kia-niro-ev-2022": null,
  "mg-mg4-trophy-extended-range": null,
  "mg5-electric": null,
  "toyota-rav4-plugin-hybrid": null,
  "toyota-bz4x": null,
  "audi-a6-s6": "audi-a6-e-tron-avant",
  "audi-q6-sq6": "audi-q6-e-tron-quattro",
  "audi-q8-e-tron": "audi-q8-e-tron-55-quattro",
  "xpeng-g6": null,
  "xpeng-g9": null,
  "xpeng-g3i": null,
  "byd-sealion-7": "byd-sealion-7-awd",
  "byd-dolphin": "byd-dolphin",
  "byd-seal": "byd-seal-excellence-awd",
  "byd-seal-u": "byd-seal-u",
  "byd-atto-3": "byd-atto-3",
  "byd-han": "byd-han-awd",
  "nio-el6": "nio-el6",
  "nio-et5": "nio-et5",
  "nio-el7": null,
  "nio-et7": null,
  "polestar-2-2023": "polestar-polestar-2-long-range",
  "polestar-3": "polestar-polestar-3-long-range-dual-motor",
  "polestar-4": "polestar-polestar-4-long-range-dual-motor",
  "porsche-macan-electric": "porsche-macan-electric-4",
  "ford-explorer-electric": null,
  "mercedes-benz-eqe-suv": null,
  "mercedes-benz-eqs-suv": null,
  "mercedes-benz-eqe": null,
  "renault-megane-e-tech": null,
  "renault-5": null,
  "nissan-ariya": null,
  "subaru-solterra": null,
  "lexus-rz": null,
  "smart-1": null,
  "fiat-500e": null,
  "honda-e-ny1": null,
  "citroen-e-c3": null,
  "opel-astra-electric": null,
  "opel-mokka-electric": null,
  "peugeot-e-3008": null,
  "peugeot-e-308": null,
  "cupra-born": null,
  "cupra-tavascan": null,
  "genesis-gv60": null,
  "jaguar-i-pace": null,
  "lucid-air": null,
  "lotus-eletre": null,
  "maserati-granturismo-folgore": null,
  "maxus-t90-ev": null,
  "mazda-mx-30": null,
  "seres-5": null,
  "zeekr-001": null,
  "zeekr-x": null,
  "hongqi-ehs7": null,
  "hongqi-eh7": null,
  "jac-e-js4": null,
  "fisker-ocean": null,
  "voyah-free": null,
};

function vehicleImageFor(car) {
  const explicitSlug = explicitImageMap[car.id];
  const exactAsset = vehicleAssets.find((asset) => asset.slug === explicitSlug);
  if (exactAsset) return exactAsset.publicPath;

  const normalizedId = car.id.replace(/-\d{4}$/g, "");
  const looseAsset = vehicleAssets.find((asset) => asset.slug.startsWith(normalizedId));
  if (looseAsset) return looseAsset.publicPath;

  return null;
}

function enrichCar(car) {
  const mappedImage = vehicleImageFor(car);
  return {
    ...car,
    image: mappedImage,
    imageStatus: mappedImage ? "model-mapped" : "missing-model-photo",
  };
}

function filterCars(cars, params) {
  const query = normalize(params.get("search"));
  const fuel = params.get("fuel") || "all";
  const body = params.get("body") || "all";
  const brand = params.get("brand") || "all";
  const maxPrice = Number(params.get("maxPrice") || 0);
  const awdOnly = parseBoolean(params.get("awd"));
  const towOnly = parseBoolean(params.get("tow"));
  const sortBy = params.get("sort") || "match";

  const filtered = cars.filter((car) => {
    const haystack = normalize([
      car.brand,
      car.model,
      car.body,
      car.fuel,
      car.segment,
      ...(car.tags || []),
    ].join(" "));

    return (
      car.market === "Norway" &&
      (!query || haystack.includes(query)) &&
      (fuel === "all" || car.fuel === fuel) &&
      (body === "all" || car.body === body) &&
      (brand === "all" || car.brand === brand) &&
      (!maxPrice || !car.priceNok || car.priceNok <= maxPrice) &&
      (!awdOnly || car.awd) &&
      (!towOnly || Number(car.towKg || 0) >= 1200)
    );
  });

  return filtered.sort((a, b) => {
    if (sortBy === "price") return Number(a.priceNok || 99999999) - Number(b.priceNok || 99999999);
    if (sortBy === "range") return Number(b.rangeKm || 0) - Number(a.rangeKm || 0);
    if (sortBy === "space") return Number(b.bootLiters || 0) - Number(a.bootLiters || 0);
    if (sortBy === "monthly") return Number(a.monthlyBaseNok || 999999) - Number(b.monthlyBaseNok || 999999);
    if (sortBy === "brand") return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "nb");
    return scoreCar(b) - scoreCar(a);
  }).map(enrichCar);
}

function stats(db) {
  const cars = db.cars.filter((car) => car.market === "Norway");
  return {
    brandCount: new Set(cars.map((car) => car.brand)).size,
    modelCount: cars.length,
    bestTowKg: Math.max(...cars.map((car) => Number(car.towKg || 0))),
    bestRangeKm: Math.max(...cars.map((car) => Number(car.rangeKm || 0))),
    updatedAt: db.meta.updatedAt,
    dataNote: db.meta.dataNote,
  };
}

function validateCar(input) {
  const required = ["brand", "model", "body", "fuel"];
  const missing = required.filter((field) => !input[field]);
  if (missing.length) {
    return { ok: false, error: `Missing required fields: ${missing.join(", ")}` };
  }

  const id = input.id || `${input.brand}-${input.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    ok: true,
    car: {
      id,
      market: "Norway",
      segment: input.segment || "Personbil",
      status: input.status || "active",
      tags: Array.isArray(input.tags) ? input.tags : [],
      ...input,
      id,
    },
  };
}

async function handleApi(req, res, url) {
  const db = readDb();

  if (req.method === "GET" && url.pathname === "/api/cars") {
    return sendJson(res, 200, {
      meta: db.meta,
      stats: stats(db),
      cars: filterCars(db.cars, url.searchParams),
    });
  }

  if (req.method === "GET" && url.pathname === "/api/brands") {
    return sendJson(res, 200, {
      brands: db.brands.sort((a, b) => a.name.localeCompare(b.name, "nb")),
    });
  }

  if (req.method === "GET" && url.pathname === "/api/stats") {
    return sendJson(res, 200, stats(db));
  }

  if (req.method === "POST" && url.pathname === "/api/cars") {
    const payload = await readBody(req);
    const validation = validateCar(payload);
    if (!validation.ok) return sendJson(res, 400, { error: validation.error });

    const index = db.cars.findIndex((car) => car.id === validation.car.id);
    if (index >= 0) db.cars[index] = { ...db.cars[index], ...validation.car };
    else db.cars.push(validation.car);

    if (!db.brands.some((brand) => brand.name === validation.car.brand)) {
      db.brands.push({ name: validation.car.brand, country: payload.brandCountry || "Unknown", activeInNorway: true });
    }

    writeDb(db);
    return sendJson(res, index >= 0 ? 200 : 201, validation.car);
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/cars/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/cars/", ""));
    const before = db.cars.length;
    db.cars = db.cars.filter((car) => car.id !== id);
    writeDb(db);
    return sendJson(res, before === db.cars.length ? 404 : 200, { deleted: before !== db.cars.length, id });
  }

  return sendJson(res, 404, { error: "API route not found" });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`BilKompass running at http://localhost:${port}`);
});
