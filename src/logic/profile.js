/**
 * Player profile chosen on the landing page.
 *
 * `index.html` saves the name and the landing site in localStorage and also
 * appends them to the game URL (`game.html?name=...&map=...`). The URL wins so
 * the link keeps working in a fresh profile; storage is the fallback for a
 * normal reload of the game.
 *
 * This module deliberately has no image imports: the Node test suite loads the
 * story layer directly, and only the browser needs the map backdrop.
 */

export const NAME_KEY = "playerName";
export const MAP_KEY = "selectedMap";
export const DEFAULT_MAP = "jezero";

export const SITES = {
  jezero: {
    id: "jezero",
    name: "Jezero Crater",
    short: "Jezero",
    sub: "Aqua Valley",
    kicker: "JEZERO",
    coordinates: "18.44°N 77.45°E",
    site: {
      name: "Jezero Crater",
      coordinates: "18.44°N 77.45°E",
      sourceId: "marsTrek",
      note: "Site context from NASA Mars Trek's MRO CTX Jezero mosaic.",
    },
    weather: {
      issuedAt: "Jezero observations · Mars Year 36",
      source: "NASA/JPL · Perseverance wind observations",
      sourceUrl:
        "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-perseverance-studies-the-wild-winds-of-jezero-crater/",
    },
  },
  meridiani: {
    id: "meridiani",
    name: "Meridiani Planum",
    short: "Meridiani",
    sub: "Red Desert",
    kicker: "MERIDIANI",
    coordinates: "1.95°S 5.53°W",
    site: {
      name: "Meridiani Planum",
      coordinates: "1.95°S 5.53°W",
      sourceId: "marsTrek",
      note: "Site context from NASA Mars Trek's Meridiani Planum mosaic.",
    },
    weather: {
      issuedAt: "Meridiani observations · Mars Year 36",
      source: "NASA/JPL · Opportunity dust observations",
      sourceUrl:
        "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    },
    // The authored Sols were written around Jezero. These phrases are the only
    // ones that state a Jezero-specific geological fact, so they are swapped
    // for the equivalent Meridiani story instead of a blind find/replace.
    replacements: [
      [
        "Jezero Crater — an old river delta, four billion years old.",
        "Meridiani Planum — ancient playas and red plains, billions of years old.",
      ],
      [
        "Jezero was a river delta, so its layers record ancient water.",
        "Meridiani Planum held ancient water-rich playas, so its layers record that water.",
      ],
    ],
    observer: "Opportunity",
  },
};

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 24);
}

function readProfile() {
  // The tests import the story layer in Node, where there is no window or
  // landing page. Keep the authored default there.
  if (typeof window === "undefined") return { name: "", map: DEFAULT_MAP };

  let storedName = "";
  let storedMap = "";
  try {
    storedName = localStorage.getItem(NAME_KEY) ?? "";
    storedMap = localStorage.getItem(MAP_KEY) ?? "";
  } catch {
    // Private browsing or storage disabled: fall through to the defaults.
  }

  const params = new URLSearchParams(window.location.search);
  const name = cleanName(params.get("name") ?? storedName);
  const requestedMap = (params.get("map") ?? storedMap).toLowerCase();
  const map = SITES[requestedMap] ? requestedMap : DEFAULT_MAP;

  // Keep the URL choice for the next reload, like the landing page does.
  try {
    if (name) localStorage.setItem(NAME_KEY, name);
    if (SITES[requestedMap]) localStorage.setItem(MAP_KEY, map);
  } catch {
    // Ignore unavailable storage.
  }

  return { name, map };
}

export const PROFILE = readProfile();
export const PLAYER_NAME = PROFILE.name;
export const ACTIVE_SITE = SITES[PROFILE.map] ?? SITES[DEFAULT_MAP];
export const COMMANDER = PLAYER_NAME ? `Commander ${PLAYER_NAME}` : "Commander";

/* ------------------------------------------------------------ story text */

const list = (value) => (Array.isArray(value) ? value : []);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Applies the landing site (and the commander's name) to one display string. */
export function localizeText(text, site = ACTIVE_SITE, name = PLAYER_NAME) {
  if (typeof text !== "string" || !text) return text;
  let out = text;

  for (const [from, to] of site.replacements ?? []) {
    out = out.split(from).join(to);
  }

  if (site.id !== DEFAULT_MAP) {
    out = out.split("Jezero Crater").join(site.name);
    out = out.split("Jezero").join(site.name);
    out = out.split("JEZERO").join(site.kicker);
    if (site.observer) out = out.split("Perseverance").join(site.observer);
  }

  if (name) {
    const already = new RegExp(`\\bCommander\\b(?!\\s+${escapeRegExp(name)})`, "g");
    out = out.replace(already, `Commander ${name}`);
  }

  return out;
}

/** Localizes a plain value or a value that is a function of the save. */
function localizedValue(value, site, name) {
  if (typeof value === "function") {
    return (state) => localizedValue(value(state), site, name);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => localizedValue(entry, site, name));
  }
  return localizeText(value, site, name);
}

function localizedNode(node, site, name) {
  if (!node) return node;
  if (typeof node === "function") {
    return (state) => localizedNode(node(state), site, name);
  }

  const out = { ...node };
  for (const key of ["eyebrow", "title", "report"]) {
    if (typeof out[key] === "string") out[key] = localizeText(out[key], site, name);
  }
  if (Array.isArray(out.body)) {
    out.body = out.body.map((line) => localizeText(line, site, name));
  }
  if (Array.isArray(out.lines)) {
    out.lines = out.lines.map((line) => localizeText(line, site, name));
  }
  if (Array.isArray(out.choices)) {
    out.choices = out.choices.map((choice) => ({
      ...choice,
      label: localizeText(choice.label, site, name),
      detail: localizeText(choice.detail, site, name),
      result: localizeText(choice.result, site, name),
      toast: localizeText(choice.toast, site, name),
    }));
  }
  return out;
}

function localizedWeather(weather, site, name) {
  if (!weather) return weather;
  const next = {
    ...weather,
    headline: localizeText(weather.headline, site, name),
    line: localizeText(weather.line, site, name),
    issuedAt: localizeText(weather.issuedAt, site, name),
    source: localizeText(weather.source, site, name),
  };

  if (site.id === DEFAULT_MAP) return next;

  // A source that names Perseverance/Jezero belongs to the other site; use the
  // matching mission source instead. General NASA sources stay untouched.
  const siteSpecific = /perseverance|jezero/i.test(
    `${weather.source ?? ""} ${weather.sourceUrl ?? ""}`,
  );
  return {
    ...next,
    issuedAt: site.weather.issuedAt,
    ...(siteSpecific
      ? { source: site.weather.source, sourceUrl: site.weather.sourceUrl }
      : {}),
  };
}

/**
 * Swaps the authored Jezero framing for the site picked on the landing page.
 * Objectives keep their original check functions; only display text changes.
 */
export function applySiteToDay(day, site = ACTIVE_SITE, name = PLAYER_NAME) {
  if (!day) return day;

  const mission = day.mission
    ? {
        ...day.mission,
        title: localizedValue(day.mission.title, site, name),
        brief: localizedValue(day.mission.brief, site, name),
        why: localizedValue(day.mission.why, site, name),
      }
    : day.mission;

  const briefing = day.briefing
    ? {
        ...day.briefing,
        kicker: localizeText(day.briefing.kicker, site, name),
        title: localizedValue(day.briefing.title, site, name),
        lines: localizedValue(day.briefing.lines, site, name),
        hint: localizeText(day.briefing.hint, site, name),
        site: site.site,
        weather: localizedWeather(day.briefing.weather, site, name),
      }
    : day.briefing;

  const subtasks = list(day.subtasks).map((subtask) => ({
    ...subtask,
    label: localizeText(subtask.label, site, name),
    why: localizeText(subtask.why, site, name),
    how: localizeText(subtask.how, site, name),
  }));

  const objectives = list(day.objectives).map((objective) => ({
    ...objective,
    label: localizeText(objective.label, site, name),
    hint: localizeText(objective.hint, site, name),
  }));

  const interactions = Object.fromEntries(
    Object.entries(day.interactions ?? {}).map(([key, node]) => [
      key,
      localizedNode(node, site, name),
    ]),
  );

  const decision = day.decision
    ? {
        ...day.decision,
        title: localizedValue(day.decision.title, site, name),
        shortTitle: localizedValue(day.decision.shortTitle, site, name),
        question: localizedValue(day.decision.question, site, name),
        stakes: localizedValue(day.decision.stakes, site, name),
        options: list(day.decision.options).map((option) => ({
          ...option,
          label: localizeText(option.label, site, name),
          detail: localizeText(option.detail, site, name),
          reply: localizeText(option.reply, site, name),
          toast: localizeText(option.toast, site, name),
        })),
      }
    : day.decision;

  return {
    ...day,
    location: site.name,
    coordinates: site.coordinates,
    mission,
    briefing,
    subtasks,
    objectives,
    interactions,
    decision,
  };
}
