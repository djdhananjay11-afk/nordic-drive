const selected = new Set();
const favorites = new Set();
const formatter = new Intl.NumberFormat("nb-NO");

let cars = [];
let brands = [];
let dbMeta = {};

const refs = {
  modelGrid: document.querySelector("#modelGrid"),
  resultCount: document.querySelector("#resultCount"),
  activeFilters: document.querySelector("#activeFilters"),
  modelCount: document.querySelector("#modelCount"),
  brandCount: document.querySelector("#brandCount"),
  bestTow: document.querySelector("#bestTow"),
  bestRange: document.querySelector("#bestRange"),
  dbStatus: document.querySelector("#dbStatus"),
  searchInput: document.querySelector("#searchInput"),
  fuelFilter: document.querySelector("#fuelFilter"),
  bodyFilter: document.querySelector("#bodyFilter"),
  brandFilter: document.querySelector("#brandFilter"),
  priceRange: document.querySelector("#priceRange"),
  priceOutput: document.querySelector("#priceOutput"),
  awdFilter: document.querySelector("#awdFilter"),
  towFilter: document.querySelector("#towFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  compareEmpty: document.querySelector("#compareEmpty"),
  compareWrap: document.querySelector("#compareWrap"),
  compareHead: document.querySelector("#compareHead"),
  compareBody: document.querySelector("#compareBody"),
  clearCompare: document.querySelector("#clearCompare"),
  kmYear: document.querySelector("#kmYear"),
  kmYearOut: document.querySelector("#kmYearOut"),
  downPayment: document.querySelector("#downPayment"),
  downPaymentOut: document.querySelector("#downPaymentOut"),
  calculatorModel: document.querySelector("#calculatorModel"),
  monthlyCost: document.querySelector("#monthlyCost"),
};

function kr(value) {
  if (!value) return "Oppdateres";
  return `${formatter.format(Math.round(value))} kr`;
}

function numberOrPending(value, suffix = "") {
  if (!value) return "Oppdateres";
  return `${formatter.format(value)}${suffix}`;
}

function vehicleImage(car) {
  const palette = {
    Tesla: ["#f5f8f8", "#dc6f33"],
    Volvo: ["#dbe8ea", "#1f6f8b"],
    BMW: ["#f2f7f7", "#124b3d"],
    Audi: ["#e7ecec", "#9f4620"],
    BYD: ["#e9f4f1", "#1f6f8b"],
    Volkswagen: ["#dce9ed", "#124b3d"],
    Polestar: ["#f7faf9", "#62706c"],
    "Mercedes-Benz": ["#eef3f3", "#17211f"],
    Porsche: ["#f6efe7", "#dc6f33"],
  };
  const [body, accent] = palette[car.brand] || ["#edf5f3", "#1f6f8b"];
  const label = `${car.brand} ${car.model}`.replace(/[<>&"]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f6faf9"/>
          <stop offset="1" stop-color="#d9e7e7"/>
        </linearGradient>
        <linearGradient id="body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${body}"/>
          <stop offset=".58" stop-color="${body}"/>
          <stop offset=".59" stop-color="${accent}"/>
          <stop offset="1" stop-color="#12362f"/>
        </linearGradient>
      </defs>
      <rect width="900" height="520" fill="url(#bg)"/>
      <path d="M0 390 C160 330 310 350 455 386 C610 425 760 406 900 345 L900 520 L0 520 Z" fill="#cbdcda"/>
      <path d="M158 312 C207 237 271 198 377 190 L535 190 C636 193 705 238 757 309 L803 327 C828 337 840 355 839 383 L833 420 L95 420 L89 383 C86 353 105 331 136 323 Z" fill="url(#body)"/>
      <path d="M312 214 L523 214 C588 216 634 246 670 300 L250 300 C264 256 284 228 312 214 Z" fill="#9cc9d2"/>
      <path d="M419 214 L419 300" stroke="#124b3d" stroke-width="12" opacity=".5"/>
      <path d="M145 332 L89 349 C117 318 134 311 170 309 Z" fill="${accent}"/>
      <path d="M752 329 L820 348 C794 316 777 309 741 308 Z" fill="#fff2aa"/>
      <circle cx="238" cy="420" r="72" fill="#101816"/>
      <circle cx="238" cy="420" r="34" fill="#d7e7e5"/>
      <circle cx="679" cy="420" r="72" fill="#101816"/>
      <circle cx="679" cy="420" r="34" fill="#d7e7e5"/>
      <text x="450" y="96" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="800" fill="#17211f">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function missingModelImage(car) {
  const label = `${car.brand} ${car.model}`.replace(/[<>&"]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" role="img" aria-label="Mangler modellfoto for ${label}">
      <rect width="900" height="520" fill="#eef5f3"/>
      <path d="M0 382 C180 322 330 348 480 384 C628 420 768 404 900 345 L900 520 L0 520 Z" fill="#d4e2df"/>
      <path d="M136 328 C198 255 286 218 414 218 L557 218 C665 224 734 264 789 334 L822 344 C846 352 858 372 851 399 L843 428 L79 428 L73 396 C69 367 90 344 121 337 Z" fill="#c8d8d5" stroke="#ffffff" stroke-width="6"/>
      <path d="M332 244 L538 244 C599 247 648 276 688 320 L270 320 C285 284 304 258 332 244 Z" fill="#91adb3"/>
      <circle cx="234" cy="428" r="64" fill="#17211f"/>
      <circle cx="234" cy="428" r="29" fill="#e8f3f5"/>
      <circle cx="682" cy="428" r="64" fill="#17211f"/>
      <circle cx="682" cy="428" r="29" fill="#e8f3f5"/>
      <text x="450" y="96" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="800" fill="#17211f">${label}</text>
      <text x="450" y="150" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#62706c">Modellfoto mangler i databasen</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function apiParams() {
  const params = new URLSearchParams({
    search: refs.searchInput.value.trim(),
    fuel: refs.fuelFilter.value,
    body: refs.bodyFilter.value,
    brand: refs.brandFilter.value,
    maxPrice: refs.priceRange.value,
    awd: refs.awdFilter.checked ? "true" : "false",
    tow: refs.towFilter.checked ? "true" : "false",
    sort: refs.sortSelect.value,
  });
  return params;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error ${response.status}`);
  return response.json();
}

async function loadBrands() {
  const payload = await fetchJson("/api/brands");
  brands = payload.brands;
  refs.brandFilter.innerHTML = [
    `<option value="all">Alle merker</option>`,
    ...brands.map((brand) => `<option value="${brand.name}">${brand.name}</option>`),
  ].join("");
}

async function loadCars() {
  const payload = await fetchJson(`/api/cars?${apiParams().toString()}`);
  cars = payload.cars;
  dbMeta = payload.meta;
  updateStats(payload.stats);
  renderCards();
  renderCalculatorOptions();
  renderCompare();
  updateCalculator();
}

function updateStats(stats) {
  refs.modelCount.textContent = stats.modelCount;
  refs.brandCount.textContent = stats.brandCount;
  refs.bestTow.textContent = `${formatter.format(stats.bestTowKg)} kg`;
  refs.bestRange.textContent = `${formatter.format(stats.bestRangeKm)} km`;
  refs.dbStatus.textContent = `${stats.modelCount} modeller fra ${stats.brandCount} merker i lokal DB`;
}

function renderCards() {
  refs.resultCount.textContent = `${cars.length} ${cars.length === 1 ? "modell" : "modeller"}`;
  refs.activeFilters.textContent = describeFilters();

  if (!cars.length) {
    refs.modelGrid.innerHTML = `
      <div class="no-results">
        <h3>Ingen modeller matcher filtrene</h3>
        <p>Utvid pris, fjern et krav eller søk etter en annen modell.</p>
      </div>
    `;
    return;
  }

  refs.modelGrid.innerHTML = cars
    .map(
      (car) => {
        const imageSrc = car.image || missingModelImage(car);
        const imageStatus = car.imageStatus === "model-mapped" ? "Modell-mappet bilde" : "Mangler modellfoto";
        return `
        <article class="model-card">
          <div class="model-photo">
            <img
              src="${imageSrc}"
              alt="${car.brand} ${car.model}"
              class="${car.imageStatus === "model-mapped" ? "asset-image" : "missing-image"}"
              loading="lazy"
              onerror="this.onerror=null;this.src='${missingModelImage(car)}';"
            >
            <span class="image-status ${car.imageStatus === "model-mapped" ? "mapped" : "missing"}">${imageStatus}</span>
            <div class="badge-row">
              ${(car.tags || []).slice(0, 3).map((tag) => `<span class="badge">${tag}</span>`).join("")}
            </div>
          </div>
          <div class="model-body">
            <div class="model-title">
              <div>
                <h3>${car.brand} ${car.model}</h3>
                <p>${car.body} · ${car.fuel}</p>
              </div>
              <span class="price">${kr(car.priceNok)}</span>
            </div>
            <div class="specs">
              <div class="spec"><span>WLTP</span><strong>${numberOrPending(car.rangeKm, " km")}</strong></div>
              <div class="spec"><span>Bagasje</span><strong>${numberOrPending(car.bootLiters, " liter")}</strong></div>
              <div class="spec"><span>Henger</span><strong>${numberOrPending(car.towKg, " kg")}</strong></div>
              <div class="spec"><span>Drift</span><strong>${car.awd ? "AWD" : "2WD"}</strong></div>
            </div>
            <div class="model-actions">
              <button class="compare-toggle ${selected.has(car.id) ? "active" : ""}" type="button" data-action="compare" data-id="${car.id}">
                ${selected.has(car.id) ? "Valgt" : "Sammenlign"}
              </button>
              <button class="favorite-toggle ${favorites.has(car.id) ? "active" : ""}" type="button" data-action="favorite" data-id="${car.id}">
                ${favorites.has(car.id) ? "Lagret" : "Lagre"}
              </button>
            </div>
          </div>
        </article>
      `;
      }
    )
    .join("");
}

function describeFilters() {
  const parts = [];
  if (refs.searchInput.value.trim()) parts.push(`Søk: ${refs.searchInput.value.trim()}`);
  if (refs.brandFilter.value !== "all") parts.push(refs.brandFilter.value);
  if (refs.fuelFilter.value !== "all") parts.push(refs.fuelFilter.value);
  if (refs.bodyFilter.value !== "all") parts.push(refs.bodyFilter.value);
  if (refs.awdFilter.checked) parts.push("AWD");
  if (refs.towFilter.checked) parts.push("henger 1 200 kg+");
  parts.push(`inntil ${kr(Number(refs.priceRange.value))}`);
  return parts.join(" · ");
}

function getChosenCars() {
  const visibleChosen = cars.filter((car) => selected.has(car.id));
  const missingIds = [...selected].filter((id) => !visibleChosen.some((car) => car.id === id));
  if (!missingIds.length) return visibleChosen;
  return visibleChosen;
}

function renderCompare() {
  const chosen = getChosenCars();
  refs.compareEmpty.hidden = chosen.length > 0;
  refs.compareWrap.hidden = chosen.length === 0;

  if (!chosen.length) {
    refs.compareHead.innerHTML = "";
    refs.compareBody.innerHTML = "";
    return;
  }

  refs.compareHead.innerHTML = `
    <tr>
      <th>Felt</th>
      ${chosen.map((car) => `<th>${car.brand}<br>${car.model}</th>`).join("")}
    </tr>
  `;

  const rows = [
    ["Pris fra", (car) => kr(car.priceNok)],
    ["Månedskostnad", (car) => kr(car.monthlyBaseNok)],
    ["WLTP-rekkevidde", (car) => numberOrPending(car.rangeKm, " km")],
    ["Hurtiglading", (car) => (car.fastChargeKw ? `${car.fastChargeKw} kW` : "Oppdateres")],
    ["Seter", (car) => numberOrPending(car.seats)],
    ["Bagasjeplass", (car) => numberOrPending(car.bootLiters, " liter")],
    ["Hengervekt", (car) => numberOrPending(car.towKg, " kg")],
    ["Drift", (car) => (car.awd ? "Firehjulstrekk" : "Tohjulstrekk")],
    ["Effekt", (car) => numberOrPending(car.powerHp, " hk")],
    ["Datastatus", (car) => car.dataQuality || "Starterdata"],
  ];

  refs.compareBody.innerHTML = rows
    .map(
      ([label, getter]) => `
        <tr>
          <th>${label}</th>
          ${chosen.map((car) => `<td>${getter(car)}</td>`).join("")}
        </tr>
      `
    )
    .join("");
}

function renderCalculatorOptions() {
  const current = refs.calculatorModel.value;
  refs.calculatorModel.innerHTML = cars
    .filter((car) => car.monthlyBaseNok)
    .map((car) => `<option value="${car.id}">${car.brand} ${car.model}</option>`)
    .join("");

  if ([...refs.calculatorModel.options].some((option) => option.value === current)) {
    refs.calculatorModel.value = current;
  }
}

function updateCalculator() {
  const car = cars.find((item) => item.id === refs.calculatorModel.value) || cars.find((item) => item.monthlyBaseNok);
  if (!car) {
    refs.monthlyCost.textContent = "Oppdateres";
    return;
  }

  const km = Number(refs.kmYear.value);
  const downPayment = Number(refs.downPayment.value);
  const usageAdjustment = (km - 16000) * (car.fuel === "Elektrisk" ? 0.18 : 0.42);
  const financeAdjustment = (100000 - downPayment) * 0.0062;
  const total = Math.max(2800, Number(car.monthlyBaseNok || 0) + usageAdjustment + financeAdjustment);

  refs.kmYearOut.textContent = `${formatter.format(km)} km`;
  refs.downPaymentOut.textContent = kr(downPayment);
  refs.monthlyCost.textContent = kr(total);
}

function handleGridClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  if (button.dataset.action === "favorite") {
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  }

  if (button.dataset.action === "compare") {
    if (selected.has(id)) {
      selected.delete(id);
    } else if (selected.size < 3) {
      selected.add(id);
    } else {
      const first = selected.values().next().value;
      selected.delete(first);
      selected.add(id);
    }
  }

  renderCards();
  renderCompare();
}

function debounce(fn, delay = 180) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function bindEvents() {
  const debouncedLoad = debounce(loadCars);

  document.querySelector("#filters").addEventListener("input", () => {
    refs.priceOutput.textContent = kr(Number(refs.priceRange.value));
    debouncedLoad();
  });

  document.querySelector("#filters").addEventListener("change", loadCars);
  refs.modelGrid.addEventListener("click", handleGridClick);
  refs.clearCompare.addEventListener("click", () => {
    selected.clear();
    renderCards();
    renderCompare();
  });

  [refs.kmYear, refs.downPayment, refs.calculatorModel].forEach((input) => {
    input.addEventListener("input", updateCalculator);
    input.addEventListener("change", updateCalculator);
  });
}

async function init() {
  refs.priceOutput.textContent = kr(Number(refs.priceRange.value));
  refs.modelGrid.innerHTML = `<div class="no-results"><h3>Laster bil-databasen</h3><p>Henter modeller fra lokal API.</p></div>`;
  bindEvents();
  await loadBrands();
  await loadCars();
}

init().catch((error) => {
  refs.modelGrid.innerHTML = `
    <div class="no-results">
      <h3>Kunne ikke laste databasen</h3>
      <p>Start serveren med <code>npm start</code> og åpne http://localhost:4173.</p>
    </div>
  `;
  console.error(error);
});
