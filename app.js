const STORAGE_KEY = "pcpro.savedBuilds.v3";
const PRICE_OVERRIDE_KEY = "pcpro.priceOverrides.v1";
const COMPARE_KEY = "pcpro.compareSelection.v1";
const BUILD_KEYS = [
  ["cpu", "CPU"],
  ["gpu", "GPU"],
  ["motherboard", "Motherboard"],
  ["ram", "RAM"],
  ["storage", "Storage"],
  ["psu", "PSU"],
  ["case", "Cabinet"],
  ["cooler", "Cooler"]
];

const COLLECTION_BY_CATEGORY = {
  cpu: "cpus",
  gpu: "gpus",
  motherboard: "motherboards",
  ram: "ram",
  storage: "storage",
  psu: "psus",
  case: "cases",
  cooler: "coolers"
};

const CATEGORY_IMAGES = {
  cpu: "https://commons.wikimedia.org/wiki/Special:FilePath/Intel_CPU_Core_i7_6700K_Skylake_perspective.jpg?width=220",
  gpu: "https://commons.wikimedia.org/wiki/Special:FilePath/NVIDIA_GeForce_RTX_2080_founders_edition_2018_front.png?width=220",
  motherboard: "https://commons.wikimedia.org/wiki/Special:FilePath/ASRock_K7VT4A_Pro_Mainboard_Labeled_English.svg?width=220",
  ram: "https://commons.wikimedia.org/wiki/Special:FilePath/Generic_DDR4_RAM.jpg?width=220",
  storage: "https://commons.wikimedia.org/wiki/Special:FilePath/Samsung_960_EVO_SSD.jpg?width=220",
  psu: "https://commons.wikimedia.org/wiki/Special:FilePath/ATX_power_supply_interior-1000px_transparent.png?width=220",
  case: "https://commons.wikimedia.org/wiki/Special:FilePath/Computer_case_2012.png?width=220",
  cooler: "https://commons.wikimedia.org/wiki/Special:FilePath/Noctua_NH-D15_SE-AM4_and_NH-U12S_SE-AM4_CPU_Coolers.jpg?width=220"
};

const RETAILERS = [
  ["Amazon", query => `https://www.amazon.in/s?k=${query}`],
  ["MDComputers", query => `https://mdcomputers.in/index.php?route=product/search&search=${query}`],
  ["Vedant", query => `https://www.vedantcomputers.com/index.php?route=product/search&search=${query}`],
  ["PrimeABGB", query => `https://www.primeabgb.com/?s=${query}&post_type=product`]
];

const state = {
  budget: 80000,
  purpose: "gaming",
  brand: "amd",
  prefs: {
    gpuMaker: null,
    rtx: false,
    cuda: false,
    ramMin: null,
    storageMin: null,
    color: null,
    colorScope: null,
    rgb: null,
    wifi: false,
    form: null,
    resolution: null,
    futureProof: false,
    cooler: null
  },
  savedBuilds: [],
  currentBuild: null,
  compareA: null,
  compareB: null,
  chartInst: null
};

const $ = id => document.getElementById(id);
const money = value => "₹" + Math.round(value).toLocaleString("en-IN");
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const clone = value => JSON.parse(JSON.stringify(value));
const parseOptionalInt = value => value ? parseInt(value, 10) : null;

document.addEventListener("DOMContentLoaded", bootstrap);

async function bootstrap(){
  applyPriceMap();
  await loadPriceData();
  init();
}

async function loadPriceData(){
  let loaded = null;
  if(typeof fetch === "function" && location.protocol !== "file:"){
    try{
      const response = await fetch("prices.json", {cache:"no-store"});
      if(response.ok) loaded = await response.json();
    }catch{
      loaded = null;
    }
  }
  if(loaded) applyPriceMap(loaded);
  try{
    const local = JSON.parse(localStorage.getItem(PRICE_OVERRIDE_KEY) || "null");
    if(local) applyPriceMap(local);
  }catch{
    // Ignore malformed local price edits and keep packaged prices.
  }
}

function applyPriceMap(priceData){
  const table = priceData?.prices || priceData || {};
  for(const [collection, items] of Object.entries(COMPONENTS)){
    if(!Array.isArray(items)) continue;
    for(const item of items){
      const override = table[collection]?.[item.id];
      item.price = Number.isFinite(Number(override)) ? Number(override) : item.defaultPrice || item.price || 0;
    }
  }
}

function init(){
  $("dataNote").textContent = `Component data last updated ${DATA_LAST_UPDATED}`;
  state.savedBuilds = loadSavedBuilds();
  loadCompareSelection();
  updateSaveCount();
  bindEvents();
  updateBudget(state.budget);
  setPurpose(state.purpose);
  setBrand(state.brand);

  const shared = loadSharedBuild();
  if(shared){
    state.budget = shared.budget || state.budget;
    state.purpose = shared.purpose || state.purpose;
    state.brand = shared.brand || state.brand;
    state.prefs = {...state.prefs, ...(shared.prefs || {})};
    syncControls();
    if(shared.ids){
      state.currentBuild = hydrateSharedBuild(shared);
      if(state.currentBuild) renderBuild();
    }
  }
  updateAiPreview();
}

function bindEvents(){
  $("bslider").addEventListener("input", e => updateBudget(e.target.value));
  $("nlIn").addEventListener("input", updateAiPreview);
  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      $("nlIn").value = btn.dataset.query;
      updateAiPreview();
    });
  });
  document.querySelectorAll("[data-purpose]").forEach(btn => {
    btn.addEventListener("click", () => setPurpose(btn.dataset.purpose));
  });
  document.querySelectorAll("[data-brand]").forEach(btn => {
    btn.addEventListener("click", () => setBrand(btn.dataset.brand));
  });
  ["wifiPref","futurePref","gpuMakerPref","ramPref","storagePref","colorPref","rgbModePref"].forEach(id => {
    $(id).addEventListener("change", () => {
      readFilterControls();
      updateAiPreview();
    });
  });
  $("genBtn").addEventListener("click", genBuild);
  $("saveBtn").addEventListener("click", saveBuild);
  $("copyBtn").addEventListener("click", copySummary);
  $("shareBtn").addEventListener("click", copyShareUrl);
  $("whatsBtn").addEventListener("click", shareWhatsApp);
  $("printBtn").addEventListener("click", () => window.print());
  $("buildArea").addEventListener("click", handleBuildClick);
}

function updateBudget(value){
  state.budget = clamp(parseInt(value, 10) || 80000, 20000, 300000);
  $("bslider").value = state.budget;
  $("bdisplay").textContent = money(state.budget);
}

function setPurpose(value){
  state.purpose = value;
  document.querySelectorAll("[data-purpose]").forEach(btn => {
    btn.classList.toggle("on", btn.dataset.purpose === value);
  });
}

function setBrand(value){
  state.brand = value;
  $("btnAMD").className = "brand-btn" + (value === "amd" ? " amd-on" : "");
  $("btnIntel").className = "brand-btn" + (value === "intel" ? " intel-on" : "");
  $("brandNote").textContent = value === "amd" ? "Ryzen platforms prioritized" : "Intel Core platforms prioritized";
}

function readFilterControls(){
  state.prefs.gpuMaker = $("gpuMakerPref").value || null;
  state.prefs.ramMin = parseOptionalInt($("ramPref").value);
  state.prefs.storageMin = parseOptionalInt($("storagePref").value);
  state.prefs.color = $("colorPref").value || null;
  state.prefs.colorScope = state.prefs.color ? "case" : null;
  const rgbValue = $("rgbModePref").value;
  state.prefs.rgb = rgbValue === "" ? null : rgbValue === "true";
  state.prefs.wifi = $("wifiPref").checked;
  state.prefs.futureProof = $("futurePref").checked;
}

function syncControls(){
  updateBudget(state.budget);
  setPurpose(state.purpose);
  setBrand(state.brand);
  $("gpuMakerPref").value = state.prefs.gpuMaker || "";
  $("ramPref").value = state.prefs.ramMin ? String(state.prefs.ramMin) : "";
  $("storagePref").value = state.prefs.storageMin ? String(state.prefs.storageMin) : "";
  $("colorPref").value = state.prefs.color || "";
  $("rgbModePref").value = state.prefs.rgb === null || state.prefs.rgb === undefined ? "" : String(state.prefs.rgb);
  $("wifiPref").checked = !!state.prefs.wifi;
  $("futurePref").checked = !!state.prefs.futureProof;
}

function updateAiPreview(){
  const parsed = parseRequirements($("nlIn").value, false);
  const tags = parsed.tags.length ? parsed.tags.map(t => `<strong>${escapeHtml(t)}</strong>`).join(" · ") : "No specific requirements detected yet.";
  $("aiDetect").innerHTML = tags;
}

function parseRequirements(text, apply){
  const lower = (text || "").toLowerCase();
  const nextPrefs = {...state.prefs};
  const tags = [];
  let nextPurpose = state.purpose;
  let nextBrand = state.brand;
  let nextBudget = state.budget;

  const parsedBudget = parseBudget(lower);
  if(parsedBudget){
    nextBudget = parsedBudget;
    tags.push(`budget ${money(parsedBudget)}`);
  }

  if(/\b(edit|editing|premiere|resolve|after effects|video|creator|youtube)\b/.test(lower)){
    nextPurpose = "editing";
    tags.push("editing workload");
  }else if(/\b(workstation|render|rendering|blender|cad|solidworks|simulation|3d|machine learning|ml|cuda work)\b/.test(lower)){
    nextPurpose = "workstation";
    tags.push("workstation workload");
  }else if(/\b(game|gaming|fps|stream|streaming|1440p|4k)\b/.test(lower)){
    nextPurpose = "gaming";
    tags.push("gaming workload");
  }else if(/\b(budget|cheap|affordable|value)\b/.test(lower)){
    nextPurpose = "budget";
    tags.push("value-first build");
  }

  if(/\b(intel|core i[3579]|xeon|lga1700|lga4677)\b/.test(lower)){
    nextBrand = "intel";
    tags.push("Intel CPU");
  }
  if(/\b(ryzen|threadripper|am4|am5|str5)\b/.test(lower) || /\bamd cpu\b/.test(lower) || (/\bamd\b/.test(lower) && !/\b(amd gpu|radeon|rx\s?\d{3,4})\b/.test(lower))){
    nextBrand = "amd";
    tags.push("AMD CPU");
  }

  if(/\b(rtx|nvidia|geforce|cuda|dlss)\b/.test(lower)){
    nextPrefs.gpuMaker = "nvidia";
    nextPrefs.rtx = /\brtx\b/.test(lower);
    nextPrefs.cuda = /\bcuda\b/.test(lower);
    tags.push(nextPrefs.rtx ? "RTX GPU" : "NVIDIA GPU");
  }
  if(/\b(radeon|rx\s?\d{3,4}|fsr|amd gpu)\b/.test(lower)){
    nextPrefs.gpuMaker = "amd";
    tags.push("AMD Radeon GPU");
  }

  const ramMin = parseRam(lower);
  if(ramMin){
    nextPrefs.ramMin = ramMin;
    tags.push(`${ramMin}GB RAM`);
  }

  const storageMin = parseStorage(lower);
  if(storageMin){
    nextPrefs.storageMin = storageMin;
    tags.push(formatStorage(storageMin));
  }

  if(/\b(wi-fi|wifi|wireless)\b/.test(lower)){
    nextPrefs.wifi = true;
    tags.push("Wi-Fi motherboard");
  }
  if(/\bwhite\s+(case|cabinet)|\b(case|cabinet)\b.*\bwhite\b/.test(lower)){
    nextPrefs.color = "white";
    nextPrefs.colorScope = "case";
    tags.push("white case");
  }else if(/\bwhite\b/.test(lower)){
    nextPrefs.color = "white";
    nextPrefs.colorScope = "theme";
    tags.push("white theme");
  }
  if(/\bno rgb|non rgb|without rgb\b/.test(lower)){
    nextPrefs.rgb = false;
    tags.push("no RGB");
  }else if(/\b(argb|rgb)\b/.test(lower)){
    nextPrefs.rgb = true;
    tags.push("RGB");
  }
  if(/\b(micro atx|matx|compact|small)\b/.test(lower)){
    nextPrefs.form = "mATX";
    tags.push("compact case");
  }else if(/\b(e-atx|eatx)\b/.test(lower)){
    nextPrefs.form = "E-ATX";
    tags.push("E-ATX support");
  }
  if(/\b4k\b/.test(lower)){
    nextPrefs.resolution = "4K";
    tags.push("4K target");
  }else if(/\b1440p|2k\b/.test(lower)){
    nextPrefs.resolution = "1440p";
    tags.push("1440p target");
  }else if(/\b1080p|fhd\b/.test(lower)){
    nextPrefs.resolution = "1080p";
    tags.push("1080p target");
  }
  if(/\b(future proof|future-proof|upgrade path|upgradable|upgradeable)\b/.test(lower)){
    nextPrefs.futureProof = true;
    tags.push("upgrade path");
  }
  if(/\b(aio|liquid cooler|water cool)\b/.test(lower)){
    nextPrefs.cooler = "aio";
    tags.push("AIO cooler");
  }

  if(apply){
    state.prefs = nextPrefs;
    updateBudget(nextBudget);
    setPurpose(nextPurpose);
    setBrand(nextBrand);
    syncControls();
  }

  return {budget:nextBudget, purpose:nextPurpose, brand:nextBrand, prefs:nextPrefs, tags:[...new Set(tags)]};
}

function parseBudget(text){
  const patterns = [
    /(?:₹|rs\.?|inr)\s*([0-9][0-9,.]*(?:\.\d+)?)\s*(lakh|lakhs|lac|l|k|thousand)?/i,
    /(?:under|below|max(?:imum)?|budget|around|upto|up to|within)\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,.]*(?:\.\d+)?)\s*(lakh|lakhs|lac|l|k|thousand)?/i,
    /([0-9]+(?:\.\d+)?)\s*(lakh|lakhs|lac|l|k)\b/i
  ];
  for(const pattern of patterns){
    const match = text.match(pattern);
    if(match){
      const value = normalizeBudgetNumber(match[1], match[2], pattern !== patterns[2]);
      if(value) return clamp(Math.round(value / 5000) * 5000, 20000, 300000);
    }
  }
  return null;
}

function normalizeBudgetNumber(raw, unit, contextual){
  const value = parseFloat(String(raw).replace(/,/g, ""));
  if(!Number.isFinite(value)) return null;
  const suffix = (unit || "").toLowerCase();
  if(["lakh","lakhs","lac","l"].includes(suffix)) return value * 100000;
  if(["k","thousand"].includes(suffix)) return value * 1000;
  if(value >= 20000) return value;
  if(contextual && value >= 20 && value <= 300) return value * 1000;
  return null;
}

function parseRam(text){
  const direct = text.match(/(\d{1,3})\s*gb\s*(?:ram|memory)/i) || text.match(/(?:ram|memory)\D{0,12}(\d{1,3})\s*gb/i);
  return direct ? parseInt(direct[1], 10) : null;
}

function parseStorage(text){
  const direct = text.match(/(\d+(?:\.\d+)?)\s*(tb|gb)\s*(?:nvme|ssd|storage|drive|hdd)?/i);
  if(!direct) return null;
  const around = direct[0].toLowerCase();
  if(/\d+\s*gb\s*(ram|memory)/.test(around)) return null;
  const amount = parseFloat(direct[1]);
  const unit = direct[2].toLowerCase();
  if(unit === "tb") return amount * 1000;
  return amount >= 240 ? amount : null;
}

function genBuild(){
  const parsed = parseRequirements($("nlIn").value, true);
  const btn = $("genBtn");
  const msgs = ["Parsing requirements...", "Scoring compatible parts...", "Checking power and fit...", "Balancing budget..."];
  let i = 0;
  btn.classList.add("busy");
  btn.disabled = true;
  btn.textContent = msgs[0];
  const iv = setInterval(() => {
    i += 1;
    if(i < msgs.length){
      btn.textContent = msgs[i];
      return;
    }
    clearInterval(iv);
    state.currentBuild = optimizeBuild(parsed);
    btn.classList.remove("busy");
    btn.disabled = false;
    btn.textContent = "Generate Build ↗";
    renderBuild();
  }, 230);
}

function optimizeBuild(parsed){
  const purpose = parsed.purpose;
  const budget = parsed.budget;
  const brand = parsed.brand;
  const prefs = parsed.prefs;
  const cpuPool = rankItems(COMPONENTS.cpus.filter(cpu => cpu.brand === brand), "cpu", purpose, prefs).slice(0, 8);
  let best = null;

  for(const cpu of cpuPool){
    const mbPool = preferred(
      COMPONENTS.motherboards.filter(mb => mb.socket === cpu.socket && cpu.memory.includes(mb.memory)),
      mb => (!prefs.wifi || mb.wifi) && (!prefs.form || mb.form === prefs.form || prefs.form === "E-ATX")
    );
    for(const motherboard of rankItems(mbPool, "motherboard", purpose, prefs).slice(0, 5)){
      const ramPool = preferred(
        COMPONENTS.ram.filter(ram => ram.type === motherboard.memory),
        ram => (!prefs.ramMin || ram.capacity >= prefs.ramMin) && rgbMatches(ram, prefs)
      );
      const gpuPool = preferred(
        COMPONENTS.gpus,
        gpu => (!prefs.gpuMaker || gpu.maker === prefs.gpuMaker) && (!prefs.rtx || gpu.rtx) && (!prefs.cuda || gpu.cuda) && colorMatches(gpu, prefs, "gpu")
      );
      const storagePool = preferred(
        COMPONENTS.storage,
        storage => !prefs.storageMin || storage.capacity >= prefs.storageMin
      );
      for(const gpu of rankItems(gpuPool, "gpu", purpose, prefs).slice(0, 8)){
        for(const ram of rankItems(ramPool, "ram", purpose, prefs).slice(0, 4)){
          for(const storage of rankItems(storagePool, "storage", purpose, prefs).slice(0, 4)){
            const wattage = estimateWattage({cpu, gpu});
            const psuPool = COMPONENTS.psus.filter(psu => psu.watts >= Math.ceil(wattage * 1.35));
            for(const psu of rankItems(psuPool, "psu", purpose, prefs).slice(0, 3)){
              const casePool = preferred(
                COMPONENTS.cases.filter(cab => caseFits(cab, motherboard, gpu)),
                cab => colorMatches(cab, prefs, "case") && rgbMatches(cab, prefs) && (!prefs.form || cab.forms.includes(prefs.form))
              );
              for(const cab of rankItems(casePool, "case", purpose, prefs).slice(0, 4)){
                const coolerPool = preferred(
                  COMPONENTS.coolers.filter(cooler => coolerFits(cooler, cpu, cab)),
                  cooler => !prefs.cooler || cooler.type === prefs.cooler
                );
                for(const cooler of rankItems(coolerPool, "cooler", purpose, prefs).slice(0, 3)){
                  const data = {cpu, gpu, motherboard, ram, storage, psu, case:cab, cooler};
                  const candidate = buildFromData(data, {budget, purpose, brand, prefs, detected:parsed.tags});
                  candidate.optimizerScore = scoreBuild(candidate);
                  if(!best || candidate.optimizerScore > best.optimizerScore) best = candidate;
                }
              }
            }
          }
        }
      }
    }
  }

  return best || fallbackBuild(parsed);
}

function fallbackBuild(parsed){
  const cpu = COMPONENTS.cpus.find(c => c.brand === parsed.brand) || COMPONENTS.cpus[0];
  const motherboard = COMPONENTS.motherboards.find(mb => mb.socket === cpu.socket && cpu.memory.includes(mb.memory));
  const gpu = COMPONENTS.gpus[0];
  const ram = COMPONENTS.ram.find(r => r.type === motherboard.memory);
  const storage = COMPONENTS.storage[0];
  const psu = COMPONENTS.psus.find(p => p.watts >= 550);
  const cab = COMPONENTS.cases.find(c => caseFits(c, motherboard, gpu));
  const cooler = COMPONENTS.coolers.find(c => coolerFits(c, cpu, cab));
  return buildFromData({cpu,gpu,motherboard,ram,storage,psu,case:cab,cooler}, parsed);
}

function preferred(items, predicate){
  const filtered = items.filter(predicate);
  return filtered.length ? filtered : items;
}

function rankItems(items, key, purpose, prefs){
  return [...items].sort((a, b) => itemScore(b, key, purpose, prefs) - itemScore(a, key, purpose, prefs));
}

function itemScore(item, key, purpose, prefs){
  const base = rawComponentScore(item, key, purpose);
  const value = base / Math.max(1, item.price / 10000);
  let bonus = 0;
  if(key === "gpu" && prefs.gpuMaker && item.maker === prefs.gpuMaker) bonus += 9;
  if(key === "gpu" && prefs.rtx && item.rtx) bonus += 8;
  if(key === "gpu" && prefs.cuda && item.cuda) bonus += 6;
  if(key === "ram" && prefs.ramMin && item.capacity >= prefs.ramMin) bonus += 7;
  if(key === "storage" && prefs.storageMin && item.capacity >= prefs.storageMin) bonus += 6;
  if((key === "case" || key === "gpu" || key === "ram") && colorMatches(item, prefs, key) && item.color === prefs.color) bonus += 6;
  if((key === "case" || key === "ram") && prefs.rgb === item.rgb) bonus += 4;
  if(key === "motherboard" && prefs.wifi && item.wifi) bonus += 7;
  if(key === "motherboard" && prefs.futureProof && (item.socket === "AM5" || item.score >= 90)) bonus += 8;
  if(key === "cooler" && prefs.cooler && item.type === prefs.cooler) bonus += 8;
  return base + value * (purpose === "budget" ? 2.2 : 0.8) + bonus - item.price / 25000;
}

function buildFromData(data, meta){
  const total = calcTotal(data);
  const wattage = estimateWattage(data);
  const compatibility = checkCompatibility(data, wattage);
  const performance = performanceScore(data, meta.purpose);
  const tier = classifyTier(total);
  return {
    label: `${title(meta.purpose)} · ${meta.brand.toUpperCase()} · ${tier}`,
    total,
    budget: meta.budget,
    purpose: meta.purpose,
    brand: meta.brand,
    tier,
    prefs: clone(meta.prefs || {}),
    detected: meta.detected || [],
    data: clone(data),
    wattage,
    compatibility,
    performance,
    createdAt: new Date().toISOString()
  };
}

function scoreBuild(build){
  const over = Math.max(0, build.total - build.budget);
  const spare = Math.max(0, build.budget - build.total);
  const unusedPenalty = Math.max(0, spare - build.budget * 0.18) / 1400;
  const overPenalty = over / 260;
  const dangerPenalty = build.compatibility.filter(c => c.level === "danger").length * 80;
  const warnPenalty = build.compatibility.filter(c => c.level === "warn").length * 16;
  const value = build.performance.overall / Math.max(1, build.total / 10000);
  return build.performance.overall + value * (build.purpose === "budget" ? 4 : 1.5) - unusedPenalty - overPenalty - dangerPenalty - warnPenalty;
}

function performanceScore(data, purpose){
  const weights = PURPOSE_WEIGHTS[purpose] || PURPOSE_WEIGHTS.gaming;
  const weighted =
    rawComponentScore(data.cpu, "cpu", purpose) * weights.cpu +
    rawComponentScore(data.gpu, "gpu", purpose) * weights.gpu +
    data.ram.score * weights.ram +
    data.storage.score * weights.storage +
    data.motherboard.score * weights.motherboard +
    data.psu.score * weights.psu +
    data.case.score * weights.case +
    data.cooler.score * weights.cooler;
  return {
    overall: Math.round(weighted),
    cpu: rawComponentScore(data.cpu, "cpu", purpose),
    gpu: rawComponentScore(data.gpu, "gpu", purpose),
    memory: data.ram.score,
    storage: data.storage.score
  };
}

function rawComponentScore(item, key, purpose){
  if(!item) return 0;
  if(typeof item.score === "number") return item.score;
  return item.score?.[purpose] || item.score?.gaming || 0;
}

function calcTotal(data){
  return Object.values(data).reduce((sum, part) => sum + (part?.price || 0), 0);
}

function estimateWattage(data){
  return Math.ceil((data.cpu?.tdp || 65) + (data.gpu?.tdp || 120) + 90);
}

function checkCompatibility(data, wattage){
  const checks = [];
  addCheck(checks, data.cpu.socket === data.motherboard.socket, "CPU socket matches motherboard", `CPU uses ${data.cpu.socket}, board uses ${data.motherboard.socket}`, true);
  addCheck(checks, data.cpu.memory.includes(data.ram.type) && data.motherboard.memory === data.ram.type, "RAM type is compatible", `${data.ram.type} memory selected for ${data.motherboard.memory} board`, true);
  addCheck(checks, data.psu.watts >= wattage * 1.35, "PSU has safe wattage headroom", `Estimated ${wattage}W draw, ${data.psu.watts}W PSU selected`, false);
  addCheck(checks, data.case.forms.includes(data.motherboard.form) && data.gpu.length <= data.case.gpuMax, "Case fits motherboard and GPU", `${data.motherboard.form} board, ${data.gpu.length}mm GPU, ${data.case.gpuMax}mm clearance`, true);
  addCheck(checks, coolerFits(data.cooler, data.cpu, data.case), "Cooler supports socket and thermals", `${data.cooler.name} rated for ${data.cooler.capacity}W on ${data.cpu.socket}`, false);
  return checks;
}

function addCheck(checks, pass, ok, detail, hard){
  checks.push({
    level: pass ? "ok" : hard ? "danger" : "warn",
    text: pass ? ok : detail
  });
}

function caseFits(cab, motherboard, gpu){
  return cab.forms.includes(motherboard.form) && gpu.length <= cab.gpuMax;
}

function coolerFits(cooler, cpu, cab){
  if(!cooler.sockets.includes(cpu.socket)) return false;
  if(cooler.capacity < cpu.tdp * 1.1) return false;
  if(cooler.type === "air") return cooler.height <= cab.airCoolerMax;
  return cooler.radiator <= cab.radiator;
}

function colorMatches(item, prefs, key){
  if(!prefs.color || !item.color) return true;
  if(prefs.colorScope === "case") return key !== "case" || item.color === prefs.color;
  return item.color === prefs.color;
}

function rgbMatches(item, prefs){
  return prefs.rgb === null || prefs.rgb === undefined || item.rgb === undefined || item.rgb === prefs.rgb;
}

function classifyTier(total){
  if(total <= 50000) return "low tier";
  if(total <= 120000) return "mid tier";
  return "high tier";
}

function renderBuild(){
  const build = state.currentBuild;
  if(!build) return;
  $("emptyState").hidden = true;
  $("buildArea").hidden = false;
  $("saveBtn").hidden = false;
  $("shareTools").hidden = false;

  const totalNote = build.total <= build.budget
    ? `<div class="budget-note budget-good">${money(build.budget - build.total)} under budget</div>`
    : `<div class="budget-note budget-bad">${money(build.total - build.budget)} over budget</div>`;
  const checks = build.compatibility.map(check => `
    <div class="compat-bar compat-${check.level} si">
      <div class="dot dot-${check.level}"></div>
      <span>${escapeHtml(check.text)}</span>
    </div>
  `).join("");
  const rows = BUILD_KEYS.map(([key, label], i) => {
    const part = build.data[key];
    const note = optimizerNote(key, part, build);
    return `
      <div class="comp-row si" style="animation-delay:${0.03 * i}s">
        <div class="part-thumb"><img src="${imageUrlFor(key, part)}" alt="${escapeHtml(part.name)}"></div>
        <div class="ctype">${label}</div>
        <div>
          <div class="cname">${escapeHtml(part.name)}</div>
          <div class="cspec">${escapeHtml(componentSpec(key, part))}</div>
          <div class="optimizer-note">${escapeHtml(note)}</div>
          <div class="retail-links">${renderRetailerLinks(part)}</div>
        </div>
        <button class="swap-btn" data-swap="${key}">swap</button>
        <div class="cprice">${money(part.price)}</div>
      </div>
      <div class="swap-panel" id="swap_${key}"></div>
    `;
  }).join("");

  $("buildArea").innerHTML = `
    <div class="bld-hdr si">
      <div>
        <div class="eyebrow">${build.brand.toUpperCase()} · ${build.purpose.toUpperCase()} · ${build.tier.toUpperCase()}</div>
        <div class="bld-title">${title(build.purpose)} PC · ${build.brand === "amd" ? '<span style="color:var(--amd)">AMD</span>' : '<span style="color:var(--blue)">Intel</span>'} build</div>
        <div class="bld-sub">Budget: ${money(build.budget)} · Components: 8 · Est. draw: ${build.wattage}W · Score: ${build.performance.overall}/100</div>
      </div>
      <div>
        <div class="bld-total-lbl">total cost</div>
        <div class="bld-total">${money(build.total)}</div>
        ${totalNote}
      </div>
    </div>

    <div class="compat-list">${checks}</div>

    ${renderPrintSheet(build)}

    <div class="tab-bar si">
      <button class="tb on" data-tab="comps">Components</button>
      <button class="tb" data-tab="chart">Budget chart</button>
      <button class="tb" data-tab="perf">Performance</button>
      <button class="tb" data-tab="expl">Reasoning</button>
      <button class="tb" data-tab="upg">Upgrades</button>
      <button class="tb" data-tab="compare">Compare</button>
    </div>

    <div class="tc on" id="tc-comps">
      ${rows}
      <div class="total-row">
        <span class="tiny-muted">Build total</span>
        <span style="font-family:'Space Mono',monospace;font-size:15px;font-weight:600;color:var(--acc)">${money(build.total)}</span>
      </div>
    </div>

    <div class="tc" id="tc-chart">${renderChartShell(build)}</div>
    <div class="tc" id="tc-perf">${renderPerformance(build)}</div>
    <div class="tc" id="tc-expl">${renderReasoning(build)}</div>
    <div class="tc" id="tc-upg">${renderUpgrades(build)}</div>
    <div class="tc" id="tc-compare"><div id="compareArea"></div></div>
  `;

  renderCompareArea();
  setTimeout(() => {
    ["overall","cpu","memory","storage"].forEach((key, i) => {
      const el = $(`pf${i}`);
      if(el) el.style.width = Math.min(100, build.performance[key]) + "%";
    });
  }, 120);
}

function renderChartShell(build){
  const colors = ["#4a9eff","#00e5a0","#a78bfa","#ff6b35","#ffb020","#ff4b4b","#5dc8a0","#b6f36a"];
  const legend = BUILD_KEYS.map(([key, label], i) => {
    const pct = Math.round(build.data[key].price / build.total * 100);
    return `<span class="legend-item"><span class="legend-swatch" style="background:${colors[i]}"></span>${label} ${pct}%</span>`;
  }).join("");
  return `<div class="legend-row">${legend}</div><div class="chart-wrap"><canvas id="budgetChart">Budget breakdown by component.</canvas></div>`;
}

function renderPrintSheet(build){
  return `
    <section class="print-sheet">
      <h1>${escapeHtml(build.label)}</h1>
      <p>Budget ${money(build.budget)} · Total ${money(build.total)} · Score ${build.performance.overall}/100 · Estimated draw ${build.wattage}W</p>
      <table>
        <thead><tr><th>Part</th><th>Selection</th><th>Reason</th><th>Price</th></tr></thead>
        <tbody>
          ${BUILD_KEYS.map(([key, label]) => {
            const part = build.data[key];
            return `<tr><td>${label}</td><td>${escapeHtml(part.name)}</td><td>${escapeHtml(optimizerNote(key, part, build))}</td><td>${money(part.price)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderPerformance(build){
  const perf = build.performance;
  const rows = [
    ["Overall score", perf.overall, "#00e5a0"],
    ["CPU performance", perf.cpu, "#4a9eff"],
    ["Memory headroom", perf.memory, "#ff6b35"],
    ["Storage I/O", perf.storage, "#a78bfa"]
  ].map(([label, value, color], i) => `
    <div class="perf-row">
      <div class="perf-hdr"><span class="perf-lbl">${label}</span><span>${value}<span class="tiny-muted">/100</span></span></div>
      <div class="perf-track"><div class="perf-fill" id="pf${i}" style="width:0%;background:${color}"></div></div>
    </div>
  `).join("");

  let metrics;
  if(build.purpose === "gaming"){
    metrics = [
      [`${fpsEstimate(build, "1080p")}+`, "FPS 1080p", "var(--acc)"],
      [`${fpsEstimate(build, "1440p")}+`, "FPS 1440p", "var(--blue)"],
      [build.performance.gpu > 82 ? `${fpsEstimate(build, "4K")}+` : "—", "FPS 4K", "var(--orange)"]
    ];
  }else if(build.purpose === "editing"){
    metrics = [
      [`${timelineRating(build)}`, "4K timeline", "var(--acc)"],
      [`${exportScore(build)}x`, "Export score", "var(--blue)"],
      [`${renderScore(build)}/100`, "Render score", "var(--orange)"]
    ];
  }else if(build.purpose === "workstation"){
    metrics = [
      [build.data.gpu.cuda ? "CUDA" : "OpenCL", "GPU compute", "var(--acc)"],
      [`${build.data.gpu.vram}GB`, "VRAM", "var(--blue)"],
      [`${build.data.cpu.cores} cores`, "Multicore", "var(--orange)"]
    ];
  }else{
    metrics = [
      [build.data.ram.capacity + "GB", "RAM buffer", "var(--acc)"],
      [build.data.cpu.cores + " cores", "CPU threads", "var(--blue)"],
      [formatStorage(build.data.storage.capacity), "Storage", "var(--orange)"]
    ];
  }

  return `
    <div style="margin-bottom:16px">${rows}</div>
    <div class="metric-grid">
      ${metrics.map(m => `<div class="metric-card"><div class="metric-val" style="color:${m[2]}">${m[0]}</div><div class="metric-lbl">${m[1]}</div></div>`).join("")}
    </div>
  `;
}

function renderReasoning(build){
  const detected = build.detected.length ? build.detected.join(", ") : "manual controls";
  const priority = build.purpose === "gaming" ? "GPU → CPU → RAM → Storage" : build.purpose === "editing" ? "CPU → RAM → GPU → Storage" : "CPU → RAM → Storage → GPU";
  const socketLife = build.data.cpu.socket === "AM5" ? "Strong AM5 upgrade path" : build.data.cpu.socket === "LGA1700" ? "Mature LGA1700 platform" : build.data.cpu.socket.includes("TR") || build.data.cpu.socket === "LGA4677" ? "Professional workstation platform" : "Budget platform";
  const bottleneck = build.performance.gpu + 12 < build.performance.cpu ? "GPU may limit peak workloads" : build.performance.cpu + 12 < build.performance.gpu ? "CPU may limit peak workloads" : "Balanced CPU/GPU pairing";
  return `
    <div class="expl-box">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div class="ai-badge">PARSED REQUEST</div><span class="tiny-muted">${escapeHtml(detected)}</span></div>
      <div class="expl-txt">
        The optimizer scored compatible combinations against your budget, then favored the parts that best match ${escapeHtml(build.purpose)} workloads.
        This build spends ${Math.round(build.data.gpu.price / build.total * 100)}% on GPU and ${Math.round(build.data.cpu.price / build.total * 100)}% on CPU, while keeping PSU, case, RAM, and cooler compatibility checked.
      </div>
    </div>
    <div class="insight-grid">
      <div class="insight"><div class="insight-k">PRIORITY ORDER</div><div class="insight-v">${priority}</div></div>
      <div class="insight"><div class="insight-k">PLATFORM</div><div class="insight-v">${socketLife}</div></div>
      <div class="insight"><div class="insight-k">BOTTLENECK CHECK</div><div class="insight-v" style="color:var(--ok)">${bottleneck}</div></div>
      <div class="insight"><div class="insight-k">VALUE SCORE</div><div class="insight-v">${(build.performance.overall / (build.total / 10000)).toFixed(1)} points per ₹10K</div></div>
    </div>
  `;
}

function renderUpgrades(build){
  const nextBudget = build.total <= 50000 ? 30000 : 50000;
  return `
    <div class="eyebrow" style="margin-bottom:10px">SUGGESTED UPGRADES</div>
    <div class="upg-row" data-upgrade="tier">
      <span class="upg-ic">🚀</span>
      <div class="upg-tx"><strong>Raise optimizer budget</strong><br><span class="tiny-muted">Lets the scorer move to stronger CPU/GPU combinations</span></div>
      <div class="upg-delta">+${money(nextBudget)}</div>
    </div>
    <div class="upg-row" data-upgrade="storage">
      <span class="upg-ic">💾</span>
      <div class="upg-tx"><strong>Target 2TB NVMe storage</strong><br><span class="tiny-muted">Better for games, media cache, and project files</span></div>
      <div class="upg-delta">2TB</div>
    </div>
    <div class="upg-row" data-upgrade="ram">
      <span class="upg-ic">🔌</span>
      <div class="upg-tx"><strong>Target 32GB RAM minimum</strong><br><span class="tiny-muted">Improves editing, browser-heavy work, and longevity</span></div>
      <div class="upg-delta">32GB</div>
    </div>
    <div class="upg-row" data-upgrade="cooler">
      <span class="upg-ic">❄️</span>
      <div class="upg-tx"><strong>Prefer AIO cooling</strong><br><span class="tiny-muted">Useful for high-wattage CPUs and quieter sustained loads</span></div>
      <div class="upg-delta">AIO</div>
    </div>
  `;
}

function handleBuildClick(event){
  const tab = event.target.closest("[data-tab]");
  if(tab){
    switchTab(tab.dataset.tab, tab);
    return;
  }
  const swap = event.target.closest("[data-swap]");
  if(swap){
    toggleSwap(swap.dataset.swap);
    return;
  }
  const option = event.target.closest("[data-swap-option]");
  if(option){
    applySwap(option.dataset.category, option.dataset.id);
    return;
  }
  const upgrade = event.target.closest("[data-upgrade]");
  if(upgrade){
    applyUpgrade(upgrade.dataset.upgrade);
  }
}

function switchTab(name, btn){
  document.querySelectorAll(".tb").forEach(b => b.classList.remove("on"));
  document.querySelectorAll(".tc").forEach(t => t.classList.remove("on"));
  btn.classList.add("on");
  $(`tc-${name}`).classList.add("on");
  if(name === "chart") setTimeout(renderChart, 50);
  if(name === "compare") renderCompareArea();
}

function renderChart(){
  if(state.chartInst){
    state.chartInst.destroy();
    state.chartInst = null;
  }
  if(typeof Chart === "undefined") return;
  const canvas = $("budgetChart");
  if(!canvas || !state.currentBuild) return;
  const colors = ["#4a9eff","#00e5a0","#a78bfa","#ff6b35","#ffb020","#ff4b4b","#5dc8a0","#b6f36a"];
  const labels = BUILD_KEYS.map(([, label]) => label);
  const prices = BUILD_KEYS.map(([key]) => state.currentBuild.data[key].price);
  state.chartInst = new Chart(canvas, {
    type: "doughnut",
    data: {labels, datasets: [{data: prices, backgroundColor: colors, borderWidth: 2, borderColor: "#0a0c10", hoverBorderWidth: 3}]},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {display: false},
        tooltip: {callbacks: {label: ctx => `${ctx.label}: ${money(ctx.parsed)} (${Math.round(ctx.parsed / prices.reduce((a,b) => a + b, 0) * 100)}%)`}}
      },
      animation: {duration: 800}
    }
  });
}

function toggleSwap(category){
  const panel = $(`swap_${category}`);
  if(panel.classList.contains("open")){
    panel.classList.remove("open");
    panel.innerHTML = "";
    return;
  }
  document.querySelectorAll(".swap-panel").forEach(p => {
    p.classList.remove("open");
    p.innerHTML = "";
  });
  const options = getSwapOptions(category);
  if(!options.length) return;
  const current = state.currentBuild.data[category];
  panel.innerHTML = `
    <div class="eyebrow">SWAP ${category.toUpperCase()} · COMPATIBLE OPTIONS</div>
    ${options.map(opt => {
      const diff = opt.price - current.price;
      const badge = diff === 0 ? "" : `<span class="swap-opt-diff ${diff < 0 ? "cheaper" : "pricier"}">${diff < 0 ? "-" : "+"} ${money(Math.abs(diff))}</span>`;
      return `
        <div class="swap-option${opt.id === current.id ? " selected" : ""}" data-swap-option="${opt.id}" data-category="${category}">
          <div><span style="font-size:12px;font-weight:500">${escapeHtml(opt.name)}</span>${badge}<br><span class="tiny-muted">${escapeHtml(componentSpec(category, opt))}</span></div>
          <div class="swap-opt-price">${money(opt.price)}</div>
        </div>
      `;
    }).join("")}
  `;
  panel.classList.add("open");
}

function getSwapOptions(category){
  const build = state.currentBuild;
  const d = build.data;
  const prefs = build.prefs;
  let options = [];
  if(category === "cpu"){
    options = COMPONENTS.cpus.filter(cpu => cpu.brand === build.brand && cpu.socket === d.motherboard.socket && cpu.memory.includes(d.ram.type));
  }else if(category === "gpu"){
    options = COMPONENTS.gpus.filter(gpu => gpu.length <= d.case.gpuMax && (!prefs.gpuMaker || gpu.maker === prefs.gpuMaker || gpu.price <= d.gpu.price));
  }else if(category === "motherboard"){
    options = COMPONENTS.motherboards.filter(mb => mb.socket === d.cpu.socket && mb.memory === d.ram.type && d.case.forms.includes(mb.form));
  }else if(category === "ram"){
    options = COMPONENTS.ram.filter(ram => ram.type === d.motherboard.memory);
  }else if(category === "storage"){
    options = COMPONENTS.storage;
  }else if(category === "psu"){
    options = COMPONENTS.psus.filter(psu => psu.watts >= estimateWattage(d) * 1.35);
  }else if(category === "case"){
    options = COMPONENTS.cases.filter(cab => caseFits(cab, d.motherboard, d.gpu) && coolerFits(d.cooler, d.cpu, cab));
  }else if(category === "cooler"){
    options = COMPONENTS.coolers.filter(cooler => coolerFits(cooler, d.cpu, d.case));
  }
  return rankItems(options, category, build.purpose, prefs).slice(0, 8);
}

function applySwap(category, id){
  const collection = COMPONENTS[COLLECTION_BY_CATEGORY[category]];
  const next = collection.find(item => item.id === id);
  if(!next || !state.currentBuild) return;
  const data = clone(state.currentBuild.data);
  data[category] = clone(next);
  repairBuild(data, state.currentBuild);
  state.currentBuild = buildFromData(data, {
    budget: state.currentBuild.budget,
    purpose: state.currentBuild.purpose,
    brand: state.currentBuild.brand,
    prefs: state.currentBuild.prefs,
    detected: state.currentBuild.detected
  });
  renderBuild();
}

function repairBuild(data, build){
  if(data.motherboard.socket !== data.cpu.socket || data.motherboard.memory !== data.ram.type){
    data.motherboard = rankItems(COMPONENTS.motherboards.filter(mb => mb.socket === data.cpu.socket && data.cpu.memory.includes(mb.memory)), "motherboard", build.purpose, build.prefs)[0];
  }
  if(data.ram.type !== data.motherboard.memory){
    data.ram = rankItems(COMPONENTS.ram.filter(ram => ram.type === data.motherboard.memory), "ram", build.purpose, build.prefs)[0];
  }
  if(!caseFits(data.case, data.motherboard, data.gpu)){
    data.case = rankItems(COMPONENTS.cases.filter(cab => caseFits(cab, data.motherboard, data.gpu)), "case", build.purpose, build.prefs)[0];
  }
  if(!coolerFits(data.cooler, data.cpu, data.case)){
    data.cooler = rankItems(COMPONENTS.coolers.filter(cooler => coolerFits(cooler, data.cpu, data.case)), "cooler", build.purpose, build.prefs)[0];
  }
  const wattage = estimateWattage(data);
  if(data.psu.watts < wattage * 1.35){
    data.psu = rankItems(COMPONENTS.psus.filter(psu => psu.watts >= wattage * 1.35), "psu", build.purpose, build.prefs)[0];
  }
}

function applyUpgrade(type){
  if(type === "tier"){
    updateBudget(Math.min(300000, state.budget + (state.budget <= 50000 ? 30000 : 50000)));
  }else if(type === "storage"){
    state.prefs.storageMin = Math.max(state.prefs.storageMin || 0, 2000);
  }else if(type === "ram"){
    state.prefs.ramMin = Math.max(state.prefs.ramMin || 0, 32);
  }else if(type === "cooler"){
    state.prefs.cooler = "aio";
  }
  genBuild();
}

function saveBuild(){
  if(!state.currentBuild) return;
  const saved = clone(state.currentBuild);
  saved.id = Date.now();
  saved.timestamp = new Date().toLocaleString([], {month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"});
  state.savedBuilds.push(saved);
  persistSavedBuilds();
  updateSaveCount();
  renderCompareArea();
  $("saveBtn").textContent = "✓ Build Saved";
  $("saveBtn").style.borderColor = "var(--acc)";
  $("saveBtn").style.color = "var(--acc)";
  setTimeout(() => {
    $("saveBtn").textContent = "+ Save This Build";
    $("saveBtn").style.borderColor = "";
    $("saveBtn").style.color = "";
  }, 1400);
}

function deleteSave(id){
  state.savedBuilds = state.savedBuilds.filter(build => build.id !== id);
  if(state.compareA === id) state.compareA = null;
  if(state.compareB === id) state.compareB = null;
  persistCompareSelection();
  persistSavedBuilds();
  updateSaveCount();
  renderCompareArea();
}

function loadSaved(id){
  const build = state.savedBuilds.find(item => item.id === id);
  if(!build) return;
  state.currentBuild = clone(build);
  state.budget = build.budget;
  state.purpose = build.purpose;
  state.brand = build.brand;
  state.prefs = {...state.prefs, ...(build.prefs || {})};
  syncControls();
  renderBuild();
}

function renderCompareArea(){
  const area = $("compareArea");
  if(!area) return;
  if(state.savedBuilds.length === 0){
    area.innerHTML = '<div class="no-saves">No saved builds yet.<br>Generate and save builds to compare them here.</div>';
    return;
  }
  const savedList = state.savedBuilds.map(build => `
    <div class="saved-card" data-load-save="${build.id}">
      <div class="saved-card-hdr">
        <div class="saved-name">${escapeHtml(build.label)}</div>
        <div style="display:flex;align-items:center;gap:4px">
          <div class="saved-price">${money(build.total)}</div>
          <button class="del-btn" data-delete-save="${build.id}">✕</button>
        </div>
      </div>
      <div class="saved-sub">${escapeHtml(build.timestamp || "saved")} · score ${build.performance?.overall || "?"}/100</div>
    </div>
  `).join("");

  let compareHtml = "";
  if(state.savedBuilds.length >= 2){
    ensureCompareSelection();
    const b1 = state.savedBuilds.find(build => build.id === state.compareA) || state.savedBuilds[state.savedBuilds.length - 2];
    const b2 = state.savedBuilds.find(build => build.id === state.compareB) || state.savedBuilds[state.savedBuilds.length - 1];
    const options = state.savedBuilds.map(build => `<option value="${build.id}">${escapeHtml(build.label)} · ${money(build.total)}</option>`).join("");
    compareHtml = `
      <div class="eyebrow" style="margin:14px 0 8px">SIDE-BY-SIDE COMPARISON</div>
      <div class="compare-selectors">
        <label class="filter-field">Build A<select id="compareA">${options}</select></label>
        <label class="filter-field">Build B<select id="compareB">${options}</select></label>
      </div>
      <div class="compare-grid">
        ${renderCompareColumn(b1, b2)}
        ${renderCompareColumn(b2, b1)}
      </div>
      <div class="tiny-muted" style="margin-top:8px;padding:8px 10px;background:var(--surf);border:1px solid var(--bord);border-radius:6px">
        ${b1.total > b2.total ? `${escapeHtml(b2.label)} saves ${money(b1.total - b2.total)}` : `${escapeHtml(b1.label)} saves ${money(b2.total - b1.total)}`}
        · Green highlight = stronger value/performance for that component.
      </div>
    `;
  }

  area.innerHTML = `
    <div class="eyebrow" style="margin-bottom:10px">SAVED BUILDS (${state.savedBuilds.length})</div>
    ${savedList}
    ${compareHtml}
  `;

  area.querySelectorAll("[data-load-save]").forEach(card => {
    card.addEventListener("click", () => loadSaved(parseInt(card.dataset.loadSave, 10)));
  });
  area.querySelectorAll("[data-delete-save]").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      deleteSave(parseInt(btn.dataset.deleteSave, 10));
    });
  });
  const compareA = $("compareA");
  const compareB = $("compareB");
  if(compareA && compareB){
    compareA.value = String(state.compareA);
    compareB.value = String(state.compareB);
    compareA.addEventListener("change", () => {
      state.compareA = parseInt(compareA.value, 10);
      if(state.compareA === state.compareB) state.compareB = firstDifferentSavedId(state.compareA);
      persistCompareSelection();
      renderCompareArea();
    });
    compareB.addEventListener("change", () => {
      state.compareB = parseInt(compareB.value, 10);
      if(state.compareA === state.compareB) state.compareA = firstDifferentSavedId(state.compareB);
      persistCompareSelection();
      renderCompareArea();
    });
  }
}

function ensureCompareSelection(){
  const ids = state.savedBuilds.map(build => build.id);
  if(!ids.includes(state.compareA)) state.compareA = ids[Math.max(0, ids.length - 2)];
  if(!ids.includes(state.compareB) || state.compareB === state.compareA) state.compareB = ids[ids.length - 1] === state.compareA ? ids[0] : ids[ids.length - 1];
  persistCompareSelection();
}

function firstDifferentSavedId(id){
  return state.savedBuilds.find(build => build.id !== id)?.id || id;
}

function renderCompareColumn(build, opponent){
  return `
    <div class="cmp-col">
      <div class="cmp-col-hdr"><div class="cmp-col-name">${escapeHtml(build.label)}</div><div class="cmp-col-price">${money(build.total)}</div></div>
      ${BUILD_KEYS.map(([key, label]) => {
        const mine = build.data[key];
        const theirs = opponent.data[key];
        const winner = componentValue(mine, key, build.purpose) >= componentValue(theirs, key, opponent.purpose) * 1.02;
        return `<div class="cmp-item ${winner ? "winner" : ""}"><span class="cmp-item-type">${label}</span><span class="cmp-item-val">${escapeHtml(mine.name)}</span></div>`;
      }).join("")}
    </div>
  `;
}

function componentValue(part, key, purpose){
  return rawComponentScore(part, key, purpose) / Math.max(1, part.price / 10000);
}

function loadSavedBuilds(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }catch{
    return [];
  }
}

function persistSavedBuilds(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedBuilds.slice(-20)));
}

function loadCompareSelection(){
  try{
    const saved = JSON.parse(localStorage.getItem(COMPARE_KEY) || "null");
    state.compareA = saved?.a || null;
    state.compareB = saved?.b || null;
  }catch{
    state.compareA = null;
    state.compareB = null;
  }
}

function persistCompareSelection(){
  localStorage.setItem(COMPARE_KEY, JSON.stringify({a:state.compareA, b:state.compareB}));
}

function updateSaveCount(){
  $("saveCount").textContent = `${state.savedBuilds.length} SAVED`;
}

function copySummary(){
  if(!state.currentBuild) return;
  copyText(buildSummary(state.currentBuild), "Build summary copied");
}

function copyShareUrl(){
  if(!state.currentBuild) return;
  const url = new URL(window.location.href);
  url.searchParams.set("build", encodePayload(sharePayload(state.currentBuild)));
  copyText(url.toString(), "Share URL copied");
}

function shareWhatsApp(){
  if(!state.currentBuild) return;
  const text = encodeURIComponent(buildSummary(state.currentBuild));
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
}

function buildSummary(build){
  const lines = [
    `PCPro Build: ${build.label}`,
    `Budget: ${money(build.budget)} | Total: ${money(build.total)} | Score: ${build.performance.overall}/100`,
    `Compatibility: ${build.compatibility.every(c => c.level === "ok") ? "All checks passed" : build.compatibility.map(c => c.text).join("; ")}`,
    "",
    ...BUILD_KEYS.map(([key, label]) => `${label}: ${build.data[key].name} - ${money(build.data[key].price)}`)
  ];
  return lines.join("\n");
}

function sharePayload(build){
  return {
    budget: build.budget,
    purpose: build.purpose,
    brand: build.brand,
    prefs: build.prefs,
    ids: Object.fromEntries(BUILD_KEYS.map(([key]) => [key, build.data[key].id]))
  };
}

function loadSharedBuild(){
  const raw = new URLSearchParams(window.location.search).get("build");
  if(!raw) return null;
  try{
    return decodePayload(raw);
  }catch{
    toast("Could not read shared build URL");
    return null;
  }
}

function hydrateSharedBuild(shared){
  const data = {};
  for(const [key] of BUILD_KEYS){
    data[key] = findComponentById(key, shared.ids[key]);
    if(!data[key]) return null;
  }
  return buildFromData(data, {
    budget: shared.budget || state.budget,
    purpose: shared.purpose || state.purpose,
    brand: shared.brand || state.brand,
    prefs: shared.prefs || state.prefs,
    detected: ["shared URL"]
  });
}

function findComponentById(category, id){
  const collection = COMPONENTS[COLLECTION_BY_CATEGORY[category]];
  return collection?.find(item => item.id === id);
}

function imageUrlFor(category, part){
  return part.image || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.case;
}

function renderRetailerLinks(part){
  const query = encodeURIComponent(part.name);
  return RETAILERS.map(([name, buildUrl]) => `<a href="${buildUrl(query)}" target="_blank" rel="noopener noreferrer">${name}</a>`).join("");
}

function optimizerNote(key, part, build){
  const prefs = build.prefs || {};
  if(key === "gpu"){
    if(prefs.rtx && part.rtx) return "RTX selected because the request asked for NVIDIA/RTX features.";
    if(prefs.gpuMaker && part.maker === prefs.gpuMaker) return `${part.maker.toUpperCase()} GPU matched the manual GPU brand filter.`;
    return build.purpose === "gaming" ? "GPU received the highest optimizer weight for gaming FPS." : "GPU chosen for acceleration while preserving CPU and RAM budget.";
  }
  if(key === "ram"){
    if(prefs.ramMin && part.capacity >= prefs.ramMin) return `${part.capacity}GB RAM selected to satisfy the ${prefs.ramMin}GB minimum.`;
    return build.purpose === "editing" || build.purpose === "workstation" ? `${part.capacity}GB RAM protects heavier timelines and project files.` : "RAM picked for the best capacity-to-price balance.";
  }
  if(key === "psu"){
    const headroom = Math.round(part.watts / build.wattage * 100 - 100);
    return `${part.watts}W PSU selected for about ${headroom}% headroom over estimated draw.`;
  }
  if(key === "cpu"){
    return `${part.cores} cores balanced ${build.purpose} performance against the total budget.`;
  }
  if(key === "motherboard"){
    return part.wifi ? "Wi-Fi board selected while matching socket and memory type." : "Board selected for socket, memory, and value compatibility.";
  }
  if(key === "storage"){
    if(prefs.storageMin && part.capacity >= prefs.storageMin) return `${formatStorage(part.capacity)} storage satisfies the requested minimum.`;
    return "NVMe storage selected for a fast boot drive and responsive app/game loading.";
  }
  if(key === "case"){
    if(prefs.color && part.color === prefs.color) return `${title(part.color)} case selected from the case color filter.`;
    return "Case selected for motherboard fit, GPU clearance, and airflow value.";
  }
  if(key === "cooler"){
    return part.type === "aio" ? "AIO cooler selected for sustained high-load thermal headroom." : "Cooler selected to fit the case and handle CPU wattage.";
  }
  return "Selected by the optimizer for compatibility and value.";
}

async function copyText(text, success){
  try{
    await navigator.clipboard.writeText(text);
    toast(success);
  }catch{
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    toast(success);
  }
}

function encodePayload(payload){
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function decodePayload(raw){
  const binary = atob(raw);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function toast(message){
  const existing = document.querySelector(".toast");
  if(existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function componentSpec(key, part){
  if(key === "cpu") return `${part.socket} · ${part.cores} cores · ${part.tdp}W TDP`;
  if(key === "gpu") return `${part.vram}GB VRAM · ${part.maker.toUpperCase()} · ${part.tdp}W · ${part.length}mm`;
  if(key === "motherboard") return `${part.socket} · ${part.memory} · ${part.form}${part.wifi ? " · Wi-Fi" : ""}`;
  if(key === "ram") return `${part.capacity}GB · ${part.type} ${part.speed}MHz${part.rgb ? " · RGB" : ""}`;
  if(key === "storage") return `${formatStorage(part.capacity)} · ${part.nvme ? "NVMe SSD" : "SSD"}`;
  if(key === "psu") return `${part.watts}W · ${part.rating}${part.modular ? " · Modular" : ""}`;
  if(key === "case") return `${part.forms.join("/")} · ${part.gpuMax}mm GPU · ${part.color}`;
  if(key === "cooler") return `${part.type.toUpperCase()} · ${part.capacity}W cooling · ${part.sockets.join("/")}`;
  return "";
}

function formatStorage(capacity){
  if(capacity >= 1000){
    const tb = capacity / 1000;
    return `${Number.isInteger(tb) ? tb : tb.toFixed(1)}TB`;
  }
  return `${capacity}GB`;
}

function fpsEstimate(build, resolution){
  const gpu = build.performance.gpu;
  const cpu = build.performance.cpu;
  const base = Math.round((gpu * 0.75 + cpu * 0.25));
  if(resolution === "1080p") return Math.max(45, Math.round(base * 1.45));
  if(resolution === "1440p") return Math.max(30, Math.round(base * 1.02));
  return Math.max(25, Math.round(base * 0.62));
}

function timelineRating(build){
  const score = build.performance.cpu * 0.35 + build.performance.gpu * 0.25 + build.performance.memory * 0.25 + build.performance.storage * 0.15;
  if(score >= 90) return "8K ready";
  if(score >= 75) return "Smooth";
  if(score >= 60) return "Proxy safe";
  return "Basic";
}

function exportScore(build){
  const score = (build.performance.cpu * 0.55 + build.performance.gpu * 0.35 + build.performance.storage * 0.10) / 25;
  return score.toFixed(1);
}

function renderScore(build){
  return Math.round(build.performance.cpu * 0.55 + build.performance.gpu * 0.30 + build.performance.memory * 0.15);
}

function title(text){
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value){
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
