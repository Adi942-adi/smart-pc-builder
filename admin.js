const PRICE_OVERRIDE_KEY = "pcpro.priceOverrides.v1";
const PRICE_COLLECTION_LABELS = {
  cpus: "CPUs",
  motherboards: "Motherboards",
  gpus: "GPUs",
  ram: "RAM",
  storage: "Storage",
  psus: "Power Supplies",
  cases: "Cases",
  coolers: "Coolers"
};

let priceState = {};

document.addEventListener("DOMContentLoaded", async () => {
  priceState = await loadPrices();
  renderEditor();
  document.getElementById("savePrices").addEventListener("click", saveLocalPrices);
  document.getElementById("resetPrices").addEventListener("click", resetLocalPrices);
  document.getElementById("exportPrices").addEventListener("click", exportPrices);
});

async function loadPrices(){
  const base = {};
  for(const [collection, items] of Object.entries(COMPONENTS)){
    if(!Array.isArray(items)) continue;
    base[collection] = Object.fromEntries(items.map(item => [item.id, item.defaultPrice || item.price || 0]));
  }
  try{
    if(location.protocol !== "file:"){
      const response = await fetch("prices.json", {cache:"no-store"});
      if(response.ok){
        const file = await response.json();
        mergePrices(base, file.prices || file);
      }
    }
  }catch{
    // Keep defaults when the packaged JSON cannot be fetched.
  }
  try{
    const local = JSON.parse(localStorage.getItem(PRICE_OVERRIDE_KEY) || "null");
    if(local) mergePrices(base, local.prices || local);
  }catch{
    // Ignore malformed local edits.
  }
  return base;
}

function mergePrices(target, source){
  for(const [collection, prices] of Object.entries(source || {})){
    if(!target[collection]) continue;
    for(const [id, price] of Object.entries(prices)){
      if(id in target[collection]) target[collection][id] = Number(price);
    }
  }
}

function renderEditor(){
  const root = document.getElementById("priceEditor");
  root.innerHTML = Object.entries(COMPONENTS).map(([collection, items]) => {
    if(!Array.isArray(items)) return "";
    return `
      <section class="price-section">
        <div class="price-section-head">
          <h2>${PRICE_COLLECTION_LABELS[collection] || collection}</h2>
          <span>${items.length} items</span>
        </div>
        ${items.map(item => `
          <label class="price-row">
            <span>${escapeHtml(item.name)}</span>
            <input class="price-input" type="number" min="0" step="100" data-collection="${collection}" data-id="${item.id}" value="${priceState[collection][item.id]}">
          </label>
        `).join("")}
      </section>
    `;
  }).join("");
}

function collectPrices(){
  const next = structuredClone(priceState);
  document.querySelectorAll("[data-collection][data-id]").forEach(input => {
    const value = parseInt(input.value, 10);
    if(Number.isFinite(value)) next[input.dataset.collection][input.dataset.id] = value;
  });
  return next;
}

function saveLocalPrices(){
  priceState = collectPrices();
  localStorage.setItem(PRICE_OVERRIDE_KEY, JSON.stringify({lastUpdated:new Date().toISOString(), prices:priceState}));
  toast("Local prices saved");
}

function resetLocalPrices(){
  localStorage.removeItem(PRICE_OVERRIDE_KEY);
  location.reload();
}

function exportPrices(){
  priceState = collectPrices();
  const content = JSON.stringify({lastUpdated:new Date().toISOString().slice(0, 10), prices:priceState}, null, 2) + "\n";
  const blob = new Blob([content], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prices.json";
  a.click();
  URL.revokeObjectURL(url);
}

function toast(message){
  const existing = document.querySelector(".toast");
  if(existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

function escapeHtml(value){
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
