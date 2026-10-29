import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function stubElement() {
  return {
    value: "", checked: false, hidden: false, disabled: false, textContent: "", innerHTML: "",
    options: [], dataset: {}, style: { setProperty() {}, removeProperty() {} },
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {}, appendChild() {}, append() {}, replaceChildren() {}, setAttribute() {},
    querySelector: () => null, querySelectorAll: () => [], matches: () => false,
  };
}

/**
 * Loads the real script.js against a minimal DOM stub and returns its public
 * surface. init() never runs (DOMContentLoaded never fires), so only the
 * pure prompt builders are exercised.
 */
let cached;
export async function loadStudio() {
  if (cached) return cached;
  globalThis.window = globalThis;
  globalThis.document = {
    getElementById: () => stubElement(),
    querySelectorAll: () => [],
    addEventListener() {},
    documentElement: stubElement(),
  };
  require("../content-types.js");
  require("../aspect-ratios.js");
  require("../islamic-art-styles.js");
  require("../thai-typography.js");
  require("../prompt-tools.js");
  require("../script.js");
  cached = globalThis.HealthPromptStudio;
  return cached;
}
