/**
 * Resource metadata and small pure helpers.
 *
 * `spareParts` is a count; everything else is a 0-100 condition/level.
 */
export const RESOURCES = [
  { key: "storedPower", label: "Power", short: "PWR", unit: "%" },
  { key: "powerCondition", label: "Power bus", short: "BUS", unit: "%" },
  { key: "water", label: "Water", short: "H2O", unit: "%" },
  { key: "food", label: "Food", short: "FOOD", unit: "%" },
  { key: "lifeSupportCondition", label: "Life support", short: "LSS", unit: "%" },
  { key: "habitatSafety", label: "Habitat", short: "HAB", unit: "%" },
  { key: "spareParts", label: "Spares", short: "PART", unit: "" },
];

const PERCENT_RESOURCES = new Set([
  "storedPower",
  "powerCondition",
  "water",
  "food",
  "lifeSupportCondition",
  "habitatSafety",
]);

const COST_LABELS = {
  storedPower: ["power", "power"],
  powerCondition: ["power bus", "power bus"],
  water: ["water", "water"],
  food: ["food", "food"],
  lifeSupportCondition: ["life support", "life support"],
  habitatSafety: ["habitat safety", "habitat safety"],
  spareParts: ["spare part", "spare parts"],
};

/** Saves and older builds can hold strings or `null`; coerce before any math. */
function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampResource(key, value) {
  const number = asNumber(value);
  if (PERCENT_RESOURCES.has(key)) return Math.min(100, Math.max(0, number));
  return Math.max(0, number);
}

export function applyDelta(resources, key, delta) {
  return clampResource(key, asNumber(resources?.[key]) + asNumber(delta));
}

export function canAfford(resources, cost = {}) {
  return Object.entries(cost).every(
    ([key, amount]) => asNumber(resources?.[key]) >= asNumber(amount),
  );
}

export function payCost(resources, cost = {}) {
  const next = { ...resources };
  for (const [key, amount] of Object.entries(cost)) {
    next[key] = clampResource(key, asNumber(next[key]) - asNumber(amount));
  }
  return next;
}

export function applyEffects(resources, effects = {}) {
  const next = { ...resources };
  for (const [key, amount] of Object.entries(effects)) {
    next[key] = clampResource(key, asNumber(next[key]) + asNumber(amount));
  }
  return next;
}

export function formatCost(cost = {}) {
  return Object.entries(cost)
    .map(([key, amount]) => {
      const [single, plural] = COST_LABELS[key] ?? [key, key];
      return `${amount} ${amount === 1 ? single : plural}`;
    })
    .join(" · ");
}

export function formatResource(key, value) {
  const meta = RESOURCES.find((resource) => resource.key === key);
  if (!meta) return String(value);
  return meta.unit === "%" ? `${Math.round(value)}%` : String(Math.round(value));
}
