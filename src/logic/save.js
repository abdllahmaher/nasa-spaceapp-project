const SAVE_KEY = "mars-outpost-mission-v2";

const DEFAULT_RESOURCES = {
  storedPower: 100,
  powerCondition: 62,
  water: 100,
  food: 100,
  lifeSupportCondition: 88,
  habitatSafety: 100,
  spareParts: 4,
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" ? value : {};
}

/**
 * Fills in anything an older save may be missing. A save written by a previous
 * build can lack `decisions`, `seen`, `flags` or `crew`, and reading those
 * blindly used to break the Sol transition with a hard crash.
 */
export function normalizeState(state) {
  const base = asObject(state);
  const crew = asObject(base.crew);
  const normalizedCrew = {};
  for (const id of ["kai", "nova", "rex"]) {
    const member = asObject(crew[id]);
    normalizedCrew[id] = { ...member, fatigue: Number.isFinite(member.fatigue) ? member.fatigue : 10 };
  }
  for (const [id, member] of Object.entries(crew)) {
    if (!normalizedCrew[id]) normalizedCrew[id] = { ...asObject(member) };
  }

  // Players who already finished Sol 1 on an older build keep their outpost:
  // every station they commissioned is marked operational instead of vanishing.
  const day = Number.isFinite(base.day) && base.day > 0 ? base.day : 1;
  const builds = asArray(base.builds);
  const migratedBuilds =
    builds.length === 0 && day > 1 ? ["power-junction", "life-support", "habitat-dome"] : builds;

  return {
    ...base,
    version: Number.isFinite(base.version) ? base.version : 1,
    day,
    resources: { ...DEFAULT_RESOURCES, ...asObject(base.resources) },
    crew: normalizedCrew,
    mission: { scienceProgress: 0, samplesCollected: 0, objectivesCompleted: [], ...asObject(base.mission) },
    drone: {
      // A save without a drone has already finished the tour, otherwise the
      // player would be sent back through the introduction mid-game.
      step: base.drone?.step ?? "free",
      seenAlerts: asArray(base.drone?.seenAlerts),
      morningSeen: base.drone?.morningSeen ?? 0,
      nudgedDay: base.drone?.nudgedDay ?? 0,
      meetIntroSeen: base.drone?.meetIntroSeen ?? true,
    },
    flags: asArray(base.flags),
    seen: asArray(base.seen),
    decisions: asObject(base.decisions),
    completedEvents: asArray(base.completedEvents),
    doneSubtasks: asArray(base.doneSubtasks),
    builds: migratedBuilds,
    eventHistory: asArray(base.eventHistory),
    decisionsByDay: asObject(base.decisionsByDay),
    lastReport: base.lastReport ?? null,
  };
}

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or storage disabled: the game still works in-memory.
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.day !== "number") return null;
    return normalizeState(parsed);
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}
