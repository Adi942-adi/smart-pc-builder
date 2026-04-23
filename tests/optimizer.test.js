const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const context = {
  console,
  document: {addEventListener: () => {}, querySelectorAll: () => []},
  localStorage: {getItem: () => null, setItem: () => {}, removeItem: () => {}},
  window: {},
  location: {protocol: "file:"},
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  URL,
  URLSearchParams,
  TextEncoder,
  TextDecoder
};

vm.createContext(context);
vm.runInContext(
  fs.readFileSync("data.js", "utf8") +
    "\n" +
    fs.readFileSync("app.js", "utf8") +
    "\nglobalThis.__test = {COMPONENTS, applyPriceMap, parseRequirements, optimizeBuild, checkCompatibility};",
  context
);

const {COMPONENTS, applyPriceMap, parseRequirements, optimizeBuild, checkCompatibility} = context.__test;
applyPriceMap();

function buildFromQuery(query){
  const parsed = parseRequirements(query, false);
  return optimizeBuild(parsed);
}

const rtxBuild = buildFromQuery("Gaming PC under Rs 80,000 with RTX GPU");
assert.equal(rtxBuild.data.gpu.maker, "nvidia", "RTX query should pick NVIDIA");
assert.equal(rtxBuild.data.gpu.rtx, true, "RTX query should pick an RTX-capable GPU");

const ramBuild = buildFromQuery("Video editing PC under Rs 90,000 with 32GB RAM");
assert.ok(ramBuild.data.ram.capacity >= 32, "32GB query should not return 16GB RAM");

const badData = {
  cpu: COMPONENTS.cpus.find(item => item.id === "r5-5600"),
  motherboard: COMPONENTS.motherboards.find(item => item.id === "z790-ddr5"),
  ram: COMPONENTS.ram.find(item => item.id === "ddr5-32"),
  gpu: COMPONENTS.gpus.find(item => item.id === "rx6600"),
  psu: COMPONENTS.psus.find(item => item.id === "rm750e"),
  case: COMPONENTS.cases.find(item => item.id === "meshify2"),
  cooler: COMPONENTS.coolers.find(item => item.id === "ak400")
};
const checks = checkCompatibility(badData, 320);
assert.ok(checks.some(check => check.level === "danger"), "socket/RAM mismatch should fail compatibility");

console.log("Optimizer tests passed");
